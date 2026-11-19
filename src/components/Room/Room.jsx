import { useNavigate } from "react-router-dom";
import useRoomSession from "./useRoomSession";
import RoomEditor from "./RoomEditor";
import RoomSidebar from "./RoomSidebar";
import "./Room.css";
import "./CreateRoom.css";

export default function Room() {
  const navigate = useNavigate();
  const session = useRoomSession();
  if (session.loading) return <div className="loading">Loading room...</div>;
  if (session.error) return <div className="alert error" role="alert">{session.error}</div>;
  if (!session.room) return <div className="alert error">Room not found</div>;
  return <main className="create-room-page room-page">
    <div className="create-room-card room-card">
      <header className="create-room-header room-header">
        <div><p className="eyebrow">{session.room.roomName}</p><h1>Room code: {session.room.roomCode}</h1>
          <p>Language: {session.room.language}</p></div>
        <button className="ghost-button" onClick={() => navigate(-1)}>Back</button>
      </header>
      <div className="room-main">
        <RoomEditor session={session} /><RoomSidebar session={session} />
      </div>
    </div>
  </main>;
}
