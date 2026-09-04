
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    roomsCreated: 0,
    roomsJoined: 0,
    totalParticipants: 0,
  });
  const [rooms, setRooms] = useState({
    created: [],
    joined: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

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
      setProfileName(userData?.fullName || "");

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
        totalParticipants: data.totalParticipants || 0,
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

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!profileName.trim()) {
      setProfileMessage("Enter your name before saving.");
      return;
    }

    setProfileLoading(true);
    setProfileMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: profileName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile");
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditingProfile(false);
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileMessage(err.message || "Unable to update profile");
    } finally {
      setProfileLoading(false);
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
          <button className="btn-primary" onClick={() => navigate("/create-room")}>Create Room</button>
          <button className="btn-secondary" onClick={() => navigate("/join-room")}>Join Room</button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="dashboard-content">
        <section className="profile-section">
          <div className="profile-heading">
            <div className="profile-avatar">{(user?.fullName || "U").charAt(0).toUpperCase()}</div>
            <div>
              <p className="section-kicker">Your account</p>
              <h2>{user?.fullName || "User"}</h2>
              <p>{user?.email || "No email available"}</p>
            </div>
          </div>
          <div className="profile-actions">
            {editingProfile ? (
              <form className="profile-form" onSubmit={handleProfileSave}>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  aria-label="Full name"
                  placeholder="Full name"
                  maxLength="80"
                />
                <button className="btn-primary" type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Save name"}
                </button>
                <button className="btn-secondary" type="button" onClick={() => setEditingProfile(false)}>Cancel</button>
              </form>
            ) : (
              <button className="btn-secondary" onClick={() => setEditingProfile(true)}>Edit profile</button>
            )}
            {profileMessage && <span className="profile-message">{profileMessage}</span>}
          </div>
        </section>

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
          <div className="stat-card">
            <div className="stat-icon participants">🧑‍🤝‍🧑</div>
            <div className="stat-content">
              <h3>{stats.totalParticipants}</h3>
              <p>Total Participants</p>
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
