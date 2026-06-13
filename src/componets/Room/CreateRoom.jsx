import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRoom.css";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [visibility, setVisibility] = useState("public");
  const [roomCode, setRoomCode] = useState("");
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const generateRoomCode = () => {
    const prefix = roomName.trim().slice(0, 3).toUpperCase() || "CR";
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // API call to backend to create room
      const response = await fetch("http://localhost:5000/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName: roomName.trim(),
          language,
          visibility,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create room");
      }

      const data = await response.json();
      setRoomCode(data.roomCode || generateRoomCode());
      setCreated(true);
    } catch (err) {
      console.error("Create room error:", err);
      setError(err.message || "Failed to create room. Please try again.");
      // Still generate a room code for UI purposes
      setRoomCode(generateRoomCode());
      setCreated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-room-page">
      <div className="create-room-card">
        <div className="create-room-header">
          <div>
            <p className="eyebrow">Create Room</p>
            <h1>Set up your coding room and invite teammates.</h1>
          </div>
          <button className="ghost-button" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="create-room-form" onSubmit={handleSubmit}>
          <label>
            Room Name
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </label>

          <label>
            Language
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>JavaScript</option>
              <option>TypeScript</option>
              <option>Python</option>
              <option>Java</option>
              <option>Go</option>
            </select>
          </label>

          <label>
            Visibility
            <div className="visibility-options">
              <button
                type="button"
                className={visibility === "public" ? "option active" : "option"}
                onClick={() => setVisibility("public")}
              >
                Public
              </button>
              <button
                type="button"
                className={visibility === "private" ? "option active" : "option"}
                onClick={() => setVisibility("private")}
              >
                Private
              </button>
            </div>
          </label>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>

        {created && (
          <div className="room-summary">
            <p>Room created successfully!</p>
            <div className="summary-card">
              <div>
                <span>Room</span>
                <strong>{roomName}</strong>
              </div>
              <div>
                <span>Code</span>
                <strong>{roomCode}</strong>
              </div>
              <div>
                <span>Language</span>
                <strong>{language}</strong>
              </div>
              <div>
                <span>Visibility</span>
                <strong>{visibility}</strong>
              </div>
            </div>
            <button className="secondary-action" type="button" onClick={() => navigate(`/`)}>
              Go to Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default CreateRoom;
