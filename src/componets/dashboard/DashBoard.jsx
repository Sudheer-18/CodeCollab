
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    roomsCreated: 0,
    roomsJoined: 0,
  });
  const [rooms, setRooms] = useState({
    created: [],
    joined: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!token) {
        navigate("/login");
        return;
      }

      setUser(userData);

      // Fetch user stats and rooms from backend
      const response = await fetch("http://localhost:5000/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setStats({
        roomsCreated: data.roomsCreated || 0,
        roomsJoined: data.roomsJoined || 0,
      });
      setRooms({
        created: data.createdRooms || [],
        joined: data.joinedRooms || [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard. Make sure backend is running at localhost:5000");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="welcome-text">
            Welcome back, <strong>{user?.fullName || "User"}</strong>!
          </p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={() => navigate("/create-room")}>
            Create New Room
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon created">📁</div>
            <div className="stat-content">
              <h3>{stats.roomsCreated}</h3>
              <p>Rooms Created</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon joined">👥</div>
            <div className="stat-content">
              <h3>{stats.roomsJoined}</h3>
              <p>Rooms Joined</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total">📊</div>
            <div className="stat-content">
              <h3>{stats.roomsCreated + stats.roomsJoined}</h3>
              <p>Total Rooms</p>
            </div>
          </div>
        </div>

        <div className="rooms-section">
          <div className="rooms-col">
            <h2>Rooms Created</h2>
            <div className="rooms-list">
              {rooms.created.length > 0 ? (
                rooms.created.map((room) => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <h3>{room.name}</h3>
                      <span className="room-code">{room.code}</span>
                    </div>
                    <p className="room-language">
                      <strong>Language:</strong> {room.language}
                    </p>
                    <p className="room-visibility">
                      <strong>Visibility:</strong>{" "}
                      <span className={room.visibility}>{room.visibility}</span>
                    </p>
                    <p className="room-members">
                      <strong>Members:</strong> {room.members || 0}
                    </p>
                    <button className="btn-enter" onClick={() => navigate(`/room/${room.id}`)}>
                      Enter Room
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-state">No rooms created yet</p>
              )}
            </div>
          </div>

          <div className="rooms-col">
            <h2>Rooms Joined</h2>
            <div className="rooms-list">
              {rooms.joined.length > 0 ? (
                rooms.joined.map((room) => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <h3>{room.name}</h3>
                      <span className="room-code">{room.code}</span>
                    </div>
                    <p className="room-language">
                      <strong>Language:</strong> {room.language}
                    </p>
                    <p className="room-visibility">
                      <strong>Owner:</strong> {room.owner || "Unknown"}
                    </p>
                    <p className="room-members">
                      <strong>Members:</strong> {room.members || 0}
                    </p>
                    <button className="btn-enter" onClick={() => navigate(`/room/${room.id}`)}>
                      Enter Room
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-state">No rooms joined yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
