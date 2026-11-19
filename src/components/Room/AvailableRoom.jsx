import useAvailableRooms from "./useAvailableRooms";
import AvailableRoomList from "./AvailableRoomList";
import "./AvailableRoom.css";

export default function AvailableRoom() {
  const page = useAvailableRooms();
  return <main className="available-rooms-page">
    <section className="available-rooms-panel">
      <header className="available-rooms-header">
        <div><p className="available-rooms-eyebrow">Find your next collaboration</p><h1>Available rooms</h1>
          <p>Browse public coding rooms and join a team.</p></div>
        <div className="available-rooms-actions">
          <button className="available-back-button" onClick={() => page.navigate("/")}>Home</button>
          <button className="available-create-button" onClick={() => page.navigate("/create-room")}>Create room</button>
        </div>
      </header>
      {page.error && <div className="available-rooms-error" role="alert">{page.error}</div>}
      {page.loading ? <p className="available-rooms-message" role="status">Loading available rooms...</p> :
        page.rooms.length === 0 ? <div className="available-rooms-empty">
          <h2>No public rooms available</h2><p>Create a public room and invite others to collaborate.</p>
          <button className="available-create-button" onClick={() => page.navigate("/create-room")}>Create a room</button>
        </div> : <AvailableRoomList rooms={page.rooms} joiningRoomId={page.joiningRoomId} onJoin={page.joinRoom} />}
    </section>
  </main>;
}
