import useJoinRoom from "./useJoinRoom";
import JoinRoomForm from "./JoinRoomForm";
import JoinRoomInfo from "./JoinRoomInfo";
import "./JoinRoom.css";

export default function JoinRoom() {
  const room = useJoinRoom();
  return <main className="join-room-page">
    <div className="join-room-container">
      <JoinRoomForm room={room} />
      <JoinRoomInfo />
    </div>
  </main>;
}
