const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");

const port = process.env.PORT || 5001;
const backendUrl = process.env.BACKEND_URL || "https://codecollab-1-stj1.onrender.com";
const allowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || "https://code-collab-dun-three.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

app.get("/health", (_request, response) => response.json({ status: "ok" }));
registerSocketHandlers(io, backendUrl);

server.listen(port, () => console.log(`Socket server listening on ${port}`));
