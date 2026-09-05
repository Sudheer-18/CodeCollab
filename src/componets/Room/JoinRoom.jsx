import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinRoom.css";

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }

    // Load recent rooms from localStorage (if any)
    const recent = localStorage.getItem("recentRoomCodes");
    if (recent) {
      setRecentRooms(JSON.parse(recent));
    }
  }, []);

  const handleInputChange = (e) => {
    setRoomCode(e.target.value.toUpperCase());
    setError("");
  };

  const handleJoinRoom = async (code) => {
    if (!code.trim()) {
      setError("Please enter a room code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");

      // Call backend API to join room
      const response = await fetch("http://localhost:5000/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ roomCode: code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join room");
      }

      const data = await response.json();
      setSuccess(`Successfully joined room: ${data.roomName}`);

      // Save room code to recent rooms
      const recent = localStorage.getItem("recentRoomCodes");
      const recentList = recent ? JSON.parse(recent) : [];
      if (!recentList.includes(code)) {
        recentList.unshift(code);
        if (recentList.length > 5) recentList.pop();
        localStorage.setItem("recentRoomCodes", JSON.stringify(recentList));
      }

      setRoomCode("");

      // Redirect to room after 1.5 seconds
      setTimeout(() => {
        navigate(`/room/${data.roomId}`);
      }, 1500);
    } catch (err) {
      console.error("Join room error:", err);
      setError(err.message || "Failed to join room. Please check the room code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-room-page">
      <div className="join-room-container">
        <div className="join-room-card">
          <div className="join-header">
            <h1>Join a Room</h1>
            <p>Enter a room code to collaborate with others</p>
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="form-group">
            <label htmlFor="roomCode">Room Code</label>
            <input
              type="text"
              id="roomCode"
              placeholder="e.g., PROJ-1234"
              value={roomCode}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && handleJoinRoom(roomCode)}
              disabled={loading}
              maxLength="20"
            />
            <p className="hint">Room codes are provided by room creators</p>
          </div>

          <button
            className="btn-join"
            onClick={() => handleJoinRoom(roomCode)}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>

          {recentRooms.length > 0 && (
            <div className="recent-section">
              <h3>Recent Rooms</h3>
              <div className="recent-rooms">
                {recentRooms.map((code, index) => (
                  <button
                    key={index}
                    className="recent-room-btn"
                    onClick={() => handleJoinRoom(code)}
                    disabled={loading}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="join-info">
          <div className="info-card">
            <div className="info-icon">📝</div>
            <h3>What is a Room Code?</h3>
            <p>A unique identifier created by the room owner that allows others to join and collaborate.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🔒</div>
            <h3>Private or Public?</h3>
            <p>Rooms can be private (invite-only) or public (joinable by anyone with the code).</p>
          </div>

          <div className="info-card">
            <div className="info-icon">👥</div>
            <h3>Collaborate</h3>
            <p>Once joined, you can code together, chat in real-time, and run code with other members.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
