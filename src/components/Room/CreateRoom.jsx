import useCreateRoom from "./useCreateRoom";
import CreateRoomForm from "./CreateRoomForm";
import "./CreateRoom.css";

export default function CreateRoom() {
  const room = useCreateRoom();
  return (
    <main className="create-room-page">
      <div className="create-room-card">
        <header className="create-room-header">
          <div><p className="eyebrow">Create Room</p><h1>Set up your coding room and invite teammates.</h1></div>
          <button className="ghost-button" type="button" onClick={() => room.navigate(-1)}>Back</button>
        </header>
        {room.error && <div className="alert error" role="alert">{room.error}</div>}
        <CreateRoomForm room={room} loading={room.loading} onSubmit={room.submit} />
      </div>
    </main>
  );
}
