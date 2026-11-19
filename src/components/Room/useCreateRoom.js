import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

export default function useCreateRoom() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("authToken")) navigate("/login");
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const room = await apiRequest("/api/rooms/create", {
        method: "POST",
        body: JSON.stringify({ roomName: roomName.trim(), language, visibility }),
      });
      navigate(`/room/${room.roomId}`);
    } catch (requestError) {
      setError(requestError.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    roomName, setRoomName, language, setLanguage,
    visibility, setVisibility, loading, error, submit, navigate,
  };
}
