import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Room.css";
import "./CreateRoom.css";
import { io as socketIOClient } from "socket.io-client";

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorText, setEditorText] = useState("");
  const saveTimeout = useRef(null);
  const emitTimeout = useRef(null);
  const hasLocalEdit = useRef(false);
  const initialLoad = useRef(true);
  const typingRef = useRef(false);
  const typingTimer = useRef(null);
  const latestRemoteContent = useRef("");
  const editorTextRef = useRef("");
  const [remoteAvailable, setRemoteAvailable] = useState(false);

  const localKey = `room-editor-${id}`;
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState("");
  const [viewMode, setViewMode] = useState("editor");

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to load room");
      }
      const data = await res.json();
      setRoom(data);

      if (initialLoad.current) {
        const saved = localStorage.getItem(localKey);
        const startContent = saved ?? data.editorContent ?? "";
        setEditorText(startContent);
        editorTextRef.current = startContent;
        initialLoad.current = false;
      } else {
        latestRemoteContent.current = data.editorContent || "";
        // if user is not typing and there are no local unsaved edits, apply remote immediately
        if (!typingRef.current && !hasLocalEdit.current) {
          if (latestRemoteContent.current !== editorTextRef.current) {
            setEditorText(latestRemoteContent.current);
            editorTextRef.current = latestRemoteContent.current;
            setRemoteAvailable(false);
          }
        } else {
          // mark that remote changes are available while user is active
          if (latestRemoteContent.current !== editorTextRef.current) {
            setRemoteAvailable(true);
          }
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch once; further updates come from socket events
    fetchRoom();
    // connect socket
    try {
      socketRef.current = socketIOClient(process.env.REACT_APP_SOCKET_URL || "http://localhost:5001");
      socketRef.current.on("connect", () => {
        setSocketConnected(true);
        setSocketError("");
        const userId = localStorage.getItem("authToken") || null;
        socketRef.current.emit("joinRoom", { roomId: id, userId });
      });
      socketRef.current.on("connect_error", (err) => {
        console.warn("socket connect_error", err);
        setSocketError("Socket connection failed");
        setSocketConnected(false);
        // start polling fallback
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => fetchRoom(), 4000);
        }
      });
    } catch (err) {
      console.error("socket init error", err);
      setSocketError("Socket init error");
      intervalRef.current = setInterval(() => fetchRoom(), 4000);
    }

    // Guard event registration in case socket initialization failed
    if (socketRef.current) {
      socketRef.current.on("remoteEditorChange", ({ content, author }) => {
        latestRemoteContent.current = content || "";
        if (!typingRef.current && !hasLocalEdit.current) {
          setEditorText(latestRemoteContent.current);
          editorTextRef.current = latestRemoteContent.current;
          setRemoteAvailable(false);
        } else if (latestRemoteContent.current !== editorTextRef.current) {
          setRemoteAvailable(true);
        }
      });

      socketRef.current.on("remoteEditorRestore", ({ content, author }) => {
        latestRemoteContent.current = content || "";
        setEditorText(latestRemoteContent.current);
        editorTextRef.current = latestRemoteContent.current;
        localStorage.setItem(localKey, latestRemoteContent.current);
        setRemoteAvailable(false);
      });

      socketRef.current.on("participants", (list) => {
        setRoom((r) => ({ ...(r || {}), participants: list, participantsCount: (list || []).length }));
      });

      socketRef.current.on("chatMessage", (msg) => {
        setMessages((m) => [...m, msg]);
      });
    }

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (socketRef.current) {
        try { socketRef.current.emit("leaveRoom"); } catch {}
        try { socketRef.current.disconnect(); } catch {}
      }
    };
  }, [id]);

  // chat and UI state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInlineVideo, setShowInlineVideo] = useState(false);

  const saveEditorContent = async (content) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/rooms/${id}/content`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ editorContent: content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save editor content");
      }
      if (localStorage.getItem(localKey) === content) {
        hasLocalEdit.current = false;
      }
    } catch (err) {
      console.error("Editor save failed", err);
    }
  };

  const handleEditorChange = (e) => {
    const value = e.target.value;
    setEditorText(value);
    editorTextRef.current = value;
    hasLocalEdit.current = true;
    localStorage.setItem(localKey, value);
    // user is typing
    typingRef.current = true;
    setRemoteAvailable(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      typingRef.current = false;
      // when user becomes idle, if no local edits pending, apply remote
      if (!hasLocalEdit.current && latestRemoteContent.current && latestRemoteContent.current !== editorTextRef.current) {
        setEditorText(latestRemoteContent.current);
        editorTextRef.current = latestRemoteContent.current;
        setRemoteAvailable(false);
      } else if (latestRemoteContent.current && latestRemoteContent.current !== editorTextRef.current) {
        setRemoteAvailable(true);
      }
    }, 2000);

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveEditorContent(value).then(() => {
        try {
          socketRef.current && socketRef.current.emit("editorChange", { roomId: id, content: value, author: localStorage.getItem("authToken") || null });
        } catch (e) {}
      });
    }, 1000);

    // emit live updates (debounced shorter) so other clients see typing live
    if (emitTimeout.current) clearTimeout(emitTimeout.current);
    emitTimeout.current = setTimeout(() => {
      try {
        socketRef.current && socketRef.current.emit("editorChange", { roomId: id, content: value, author: localStorage.getItem("authToken") || null });
      } catch (e) {}
    }, 300);
  };

  const sendChat = () => {
    const text = (newMessage || "").trim();
    if (!text) return;
    const author = localStorage.getItem("authToken") || "anon";
    const payload = { roomId: id, author, text };
    try {
      socketRef.current && socketRef.current.emit("chatMessage", payload);
      setMessages((m) => [...m, { author, text, at: new Date().toISOString() }]);
      setNewMessage("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinVideo = () => {
    if (!room) return;
    const active = room.activeVideoCall || room.videoCall || null;
    const url = active ? (active.url || active) : `https://meet.jit.si/${room.roomCode || room.roomId}`;
    window.open(url, "_blank");
  };

  const applyRemoteNow = () => {
    const remote = latestRemoteContent.current || "";
    setEditorText(remote);
    editorTextRef.current = remote;
    localStorage.setItem(localKey, remote);
    setRemoteAvailable(false);
  };

  if (loading) return <div className="loading">Loading room...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (!room) return <div className="alert error">Room not found</div>;

  const participants = room.participants || [];
  const participantsCount = room.participantsCount || participants.length || 0;

  return (
    <main className="create-room-page room-page">
      <div className="create-room-card room-card">
        <div className="create-room-header room-header">
          <div>
            <p className="eyebrow">{room.roomName}</p>
            <h1>Room code: {room.roomCode}</h1>
            <p>Language: {room.language}</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <div className="room-main">
          <div className="room-tabs">
            <button className={`room-tab ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')}>
              Code Editor
            </button>
            <button className={`room-tab ${viewMode === 'history' ? 'active' : ''}`} onClick={() => setViewMode('history')}>
              View History
            </button>
          </div>

          <div className="editor-column">
            {viewMode === 'editor' ? (
              <div className="editor-pane">
                {remoteAvailable && (
                  <div className="remote-available">
                    <div><strong>Remote changes available</strong></div>
                    <div className="remote-actions">
                      <button className="btn-secondary" onClick={() => setRemoteAvailable(false)}>Dismiss</button>
                      <button className="btn-primary" onClick={applyRemoteNow}>Apply</button>
                    </div>
                  </div>
                )}
                <textarea
                  value={editorText}
                  onChange={handleEditorChange}
                  placeholder="Type code here..."
                  className="code-editor"
                />
              </div>
            ) : (
              <div className="history-pane history-page">
                <div className="history-header">
                  <div>
                    <h3>History</h3>
                    <p className="history-subtitle">Restore a previous version back into the editor.</p>
                  </div>
                  <button className="ghost-button" onClick={() => setViewMode('editor')}>Back to editor</button>
                </div>
                {room.history && room.history.length > 0 ? (
                  <ul className="history-list">
                    {room.history.slice().reverse().map((h, idx) => (
                      <li key={idx} className="history-item">
                        <div className="history-item-meta">
                          <div>
                            <strong>{h.author || 'anon'}</strong>
                            <div className="history-ts">{h.at}</div>
                          </div>
                          <div className="history-actions">
                            <button className="btn-secondary" onClick={() => {
                              setEditorText(h.editorContent || "");
                              localStorage.setItem(localKey, h.editorContent || "");
                              hasLocalEdit.current = true;
                              setViewMode('editor');
                            }}>Load</button>
                            <button className="btn-primary" onClick={async () => {
                              const content = h.editorContent || "";
                              setEditorText(content);
                              localStorage.setItem(localKey, content);
                              setViewMode('editor');
                              try {
                                await saveEditorContent(content);
                                socketRef.current && socketRef.current.emit("restore", { roomId: id, content, author: localStorage.getItem("authToken") || null });
                              } catch (err) {
                                console.error(err);
                              }
                            }}>Restore</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="history-empty">No history yet</p>
                )}
              </div>
            )}
          </div>

          <aside className="room-sidebar">
            <div className="video-section">
              <h3>Video Call</h3>
              <p>Participants: {participantsCount} / 5</p>
              <p>
                {room.activeVideoCall || room.videoCall
                  ? "Join the active video room to speak with everyone."
                  : "Start a shared video room for all joined users."
                }
              </p>
              <div style={{display:'flex', gap:8}}>
                <button className="submit-button" onClick={handleJoinVideo} disabled={participantsCount === 0}>
                  {room.activeVideoCall || room.videoCall ? "Join Video Call" : "Start Video Call"}
                </button>
                <button className="btn-secondary" onClick={() => setShowInlineVideo((s) => !s)}>
                  {showInlineVideo ? "Hide Video" : "Show Video Inline"}
                </button>
              </div>
              {showInlineVideo && (
                <div style={{marginTop:8}}>
                  <iframe
                    title="video-room"
                    src={(room.activeVideoCall && room.activeVideoCall.url) || `https://meet.jit.si/${room.roomCode || room.roomId}`}
                    width="100%"
                    height="240"
                    allow="camera; microphone; display-capture"
                    style={{border:0}}
                  />
                </div>
              )}
            </div>

            <div className="participants">
              <h3>Participants</h3>
              {participants.length > 0 ? (
                <ul>
                  {participants.map((p, idx) => (
                    <li key={idx}>{p.userId} - {p.joinedAt || "-"}</li>
                  ))}
                </ul>
              ) : (
                <p>No participants yet</p>
              )}
            </div>

            <div className="chat-section">
              <h3>Chat</h3>
              <div className="chat-box">
                {messages.length === 0 ? (
                  <div className="history-empty">No messages yet</div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className="chat-message">
                      <strong>{m.author}</strong>
                      <div>{m.text}</div>
                      <div className="history-ts">{m.at}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-footer">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message" />
                <button className="submit-button" onClick={sendChat}>Send</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Room;
