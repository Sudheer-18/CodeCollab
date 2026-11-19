import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function useAvailableRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState("");
  const [error, setError] = useState("");

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRooms(await apiRequest("/api/rooms/available"));
    } catch (requestError) {
      setError(requestError.message || "Unable to load available rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const joinRoom = async (room) => {
    setJoiningRoomId(room.roomId);
    setError("");
    try {
      const joined = await apiRequest("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({ roomCode: room.roomCode }),
      });
      navigate(`/room/${joined.roomId}`);
    } catch (requestError) {
      setError(requestError.message || "Unable to join this room. Please try again.");
      setJoiningRoomId("");
    }
  };

  return { rooms, loading, joiningRoomId, error, joinRoom, navigate };
}
