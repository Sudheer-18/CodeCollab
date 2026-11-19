import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function useJoinRoom() {
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
    try {
      const recent = JSON.parse(localStorage.getItem("recentRoomCodes") || "[]");
      setRecentRooms(Array.isArray(recent) ? recent : []);
    } catch {
      localStorage.removeItem("recentRoomCodes");
    }
  }, [navigate]);

  const joinRoom = async (code) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setError("Please enter a room code");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const room = await apiRequest("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({ roomCode: normalizedCode }),
      });
      setSuccess(`Successfully joined room: ${room.roomName}`);
      const recent = [normalizedCode, ...recentRooms.filter((item) => item !== normalizedCode)].slice(0, 5);
      setRecentRooms(recent);
      localStorage.setItem("recentRoomCodes", JSON.stringify(recent));
      setRoomCode("");
      window.setTimeout(() => navigate(`/room/${room.roomId}`), 1500);
    } catch (requestError) {
      setError(requestError.message || "Failed to join room. Please check the room code.");
    } finally {
      setLoading(false);
    }
  };

  return { navigate, roomCode, setRoomCode, loading, error, success, recentRooms, joinRoom };
}
