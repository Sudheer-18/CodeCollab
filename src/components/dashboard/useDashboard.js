import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { clearSession, getStoredUser } from "../../services/auth";

export default function useDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ roomsCreated: 0, roomsJoined: 0, totalParticipants: 0 });
  const [rooms, setRooms] = useState({ created: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      setLoading(false);
      return;
    }
    const storedUser = getStoredUser();
    setUser(storedUser);
    setProfileName(storedUser?.fullName || "");
    apiRequest("/api/dashboard/stats")
      .then((data) => {
        setStats({
          roomsCreated: data.roomsCreated || 0,
          roomsJoined: data.roomsJoined || 0,
          totalParticipants: data.totalParticipants || 0,
        });
        setRooms({ created: data.createdRooms || [], joined: data.joinedRooms || [] });
      })
      .catch((requestError) => setError(requestError.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profileName.trim()) {
      setProfileMessage("Enter your name before saving.");
      return;
    }
    setProfileLoading(true);
    setProfileMessage("");
    try {
      const data = await apiRequest("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: profileName.trim() }),
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditingProfile(false);
      setProfileMessage("Profile updated.");
    } catch (requestError) {
      setProfileMessage(requestError.message || "Unable to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const logout = () => { clearSession(); navigate("/login"); };
  return {
    navigate, user, stats, rooms, loading, error, editingProfile, setEditingProfile,
    profileName, setProfileName, profileLoading, profileMessage, saveProfile, logout,
  };
}
