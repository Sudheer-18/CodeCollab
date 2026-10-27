import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

const SOCKET_URL = (() => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window === "undefined") return "http://localhost:5001";
  const { protocol, hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" ? "http://localhost:5001" : `${protocol}//${hostname}:5001`;
})();

const SOCKET_STATUS_HINT = "Chat is unavailable while the room connection is offline. Start the socket service with `npm --prefix socket-server start` or check VITE_SOCKET_URL.";

export default function useRoomSession() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorText, setEditorText] = useState("");
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState("");
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editorError, setEditorError] = useState("");
  const [viewMode, setViewMode] = useState("editor");
  const [showInlineVideo, setShowInlineVideo] = useState(false);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const saveTimeout = useRef(null);
  const emitTimeout = useRef(null);
  const typingTimer = useRef(null);
  const typingRef = useRef(false);
  const hasLocalEdit = useRef(false);
  const editorTextRef = useRef("");
  const latestRemoteContent = useRef("");
  const loadedRoomId = useRef("");
  const localKey = `room-editor-${id}`;

  const fetchRoom = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/rooms/${id}`);
      setRoom(data);
      if (loadedRoomId.current !== id) {
        const content = localStorage.getItem(localKey) ?? data.editorContent ?? "";
        setEditorText(content);
        editorTextRef.current = content;
        latestRemoteContent.current = data.editorContent || "";
        loadedRoomId.current = id;
      } else {
        latestRemoteContent.current = data.editorContent || "";
        if (!typingRef.current && !hasLocalEdit.current) {
          setEditorText(latestRemoteContent.current);
          editorTextRef.current = latestRemoteContent.current;
          setRemoteAvailable(false);
        } else if (latestRemoteContent.current !== editorTextRef.current) {
          setRemoteAvailable(true);
        }
      }
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [id, localKey]);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchRoom();
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      setSocketError("");
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      socket.emit("joinRoom", { roomId: id, userId: localStorage.getItem("authToken") || null }, (result) => {
        if (!result?.success) setSocketError(result?.error || "Failed to join the room socket");
      });
    });
    const pollRoom = () => {
      setSocketConnected(false);
      if (!intervalRef.current) intervalRef.current = window.setInterval(fetchRoom, 4000);
    };
    socket.on("connect_error", () => {
      setSocketError(`Socket connection failed. ${SOCKET_STATUS_HINT}`);
      pollRoom();
    });
    socket.on("disconnect", () => {
      setSocketError("Socket disconnected. Reconnecting...");
      pollRoom();
    });
    socket.on("remoteEditorChange", ({ content }) => {
      latestRemoteContent.current = content || "";
      if (!typingRef.current && !hasLocalEdit.current) {
        setEditorText(latestRemoteContent.current);
        editorTextRef.current = latestRemoteContent.current;
        setRemoteAvailable(false);
      } else if (latestRemoteContent.current !== editorTextRef.current) {
        setRemoteAvailable(true);
      }
    });
    socket.on("remoteEditorRestore", ({ content }) => {
      const restored = content || "";
      latestRemoteContent.current = restored;
      editorTextRef.current = restored;
      setEditorText(restored);
      localStorage.setItem(localKey, restored);
      hasLocalEdit.current = false;
      setRemoteAvailable(false);
    });
    socket.on("participants", (participants) => {
      setRoom((current) => ({ ...(current || {}), participants, participantsCount: participants.length }));
    });
    socket.on("chatMessage", (message) => setMessages((current) => [...current, message]));

    return () => {
      [saveTimeout.current, emitTimeout.current, typingTimer.current].forEach((timer) => timer && window.clearTimeout(timer));
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      socket.emit("leaveRoom");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchRoom, id, localKey]);

  const saveEditorContent = async (content) => {
    try {
      await apiRequest(`/api/rooms/${id}/content`, {
        method: "PATCH",
        body: JSON.stringify({ editorContent: content }),
      });
      if (localStorage.getItem(localKey) === content) hasLocalEdit.current = false;
      setEditorError("");
      return true;
    } catch (requestError) {
      setEditorError(requestError.message || "Editor changes could not be saved.");
      return false;
    }
  };

  const handleEditorChange = (event) => {
    const content = event.target.value;
    setEditorText(content);
    editorTextRef.current = content;
    hasLocalEdit.current = true;
    localStorage.setItem(localKey, content);
    typingRef.current = true;
    setRemoteAvailable(false);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      typingRef.current = false;
      if (latestRemoteContent.current && latestRemoteContent.current !== editorTextRef.current) setRemoteAvailable(true);
    }, 2000);
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveEditorContent(content).then((saved) => {
        if (saved) socketRef.current?.emit("editorChange", { roomId: id, content });
      });
    }, 1000);
    if (emitTimeout.current) window.clearTimeout(emitTimeout.current);
    emitTimeout.current = window.setTimeout(() => socketRef.current?.emit("editorChange", { roomId: id, content }), 300);
  };

  const sendChat = () => {
    const text = newMessage.trim();
    if (!text) return;
    if (!socketRef.current || !socketConnected) {
      setChatError(SOCKET_STATUS_HINT);
      return;
    }
    setChatError("");
    socketRef.current.timeout(5000).emit("chatMessage", { text }, (sendError, response) => {
      if (sendError || !response?.success) {
        setChatError(response?.error || "Message could not be sent. Please try again.");
        return;
      }
      setMessages((current) => [...current, response.message]);
      setNewMessage((current) => current === text ? "" : current);
    });
  };

  const applyRemote = () => {
    const content = latestRemoteContent.current || "";
    setEditorText(content);
    editorTextRef.current = content;
    localStorage.setItem(localKey, content);
    hasLocalEdit.current = false;
    setRemoteAvailable(false);
  };

  const dismissRemote = () => setRemoteAvailable(false);

  const loadVersion = (content) => {
    setEditorText(content);
    editorTextRef.current = content;
    localStorage.setItem(localKey, content);
    hasLocalEdit.current = true;
    setViewMode("editor");
  };

  const restoreVersion = async (content) => {
    loadVersion(content);
    if (await saveEditorContent(content)) {
      socketRef.current?.emit("restore", { roomId: id, content });
    }
  };

  return {
    id, room, loading, error, editorText, remoteAvailable, editorError,
    socketConnected, socketError, chatError, messages, newMessage, setNewMessage,
    viewMode, setViewMode, showInlineVideo, setShowInlineVideo, handleEditorChange,
    sendChat, applyRemote, dismissRemote, loadVersion, restoreVersion,
  };
}
