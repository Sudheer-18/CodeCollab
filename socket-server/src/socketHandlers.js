const axios = require("axios");
const RoomRegistry = require("./roomRegistry");

module.exports = function registerSocketHandlers(io, backendUrl) {
  const rooms = new RoomRegistry(io);

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    const leaveRoom = () => {
      const { roomId } = socket.data;
      if (!roomId) return;
      rooms.remove(roomId, socket.id);
      socket.leave(roomId);
      delete socket.data.roomId;
      delete socket.data.userId;
      delete socket.data.displayName;
    };

    socket.on("joinRoom", async (payload = {}, acknowledge) => {
      const request = payload || {};
      const roomId = typeof request.roomId === "string" ? request.roomId.trim() : "";
      const requestedUserId = typeof request.userId === "string" ? request.userId.trim() : "";
      if (!roomId) {
        if (typeof acknowledge === "function") acknowledge({ success: false, error: "A room ID is required." });
        return;
      }

      leaveRoom();
      let userId = requestedUserId || "guest";
      let displayName = "Guest";
      if (requestedUserId) {
        try {
          const response = await axios.get(`${backendUrl}/users/${encodeURIComponent(requestedUserId)}`, { timeout: 3000 });
          const profile = response && response.data ? response.data : {};
          displayName = profile.fullName || profile.name || requestedUserId;
        } catch (error) {
          console.warn("Could not validate socket user; joining as guest:", error.message);
          userId = "guest";
          displayName = "Guest";
        }
      }

      await socket.join(roomId);
      socket.data.userId = userId;
      socket.data.displayName = displayName;
      socket.data.roomId = roomId;
      rooms.add(roomId, socket.id, { userId, fullName: displayName, displayName, joinedAt: new Date().toISOString() });
      if (typeof acknowledge === "function") acknowledge({ success: true });
    });

    socket.on("leaveRoom", leaveRoom);
    socket.on("editorChange", (request = {}) => {
      const { roomId, userId } = socket.data;
      if (roomId && request && typeof request.content === "string") {
        socket.to(roomId).emit("remoteEditorChange", { content: request.content, author: userId || "guest" });
      }
    });
    socket.on("chatMessage", (request = {}, acknowledge) => {
      const { roomId, userId, displayName } = socket.data;
      const text = request && typeof request.text === "string" ? request.text.trim() : "";
      if (!roomId || !text || text.length > 2000) {
        if (typeof acknowledge === "function") {
          acknowledge({ success: false, error: "Join a room and enter a message of 1-2000 characters." });
        }
        return;
      }
      const message = {
        author: userId || "guest",
        displayName: displayName || "Guest",
        fullName: displayName || "Guest",
        text,
        at: new Date().toISOString(),
      };
      socket.to(roomId).emit("chatMessage", message);
      if (typeof acknowledge === "function") acknowledge({ success: true, message });
    });
    socket.on("restore", (request = {}) => {
      const { roomId, userId } = socket.data;
      if (roomId && request && typeof request.content === "string") {
        io.to(roomId).emit("remoteEditorRestore", { content: request.content, author: userId || "guest" });
      }
    });
    socket.on("disconnect", () => {
      leaveRoom();
      console.log("socket disconnected", socket.id);
    });
  });
};
