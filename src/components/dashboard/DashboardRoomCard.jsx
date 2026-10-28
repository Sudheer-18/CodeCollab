export default function DashboardRoomCard({ room, joined, onEnter }) {
  return <div className="room-card">
    <div className="room-header"><h3>{room.name}</h3><span className="room-code">{room.code}</span></div>
    <p className="room-language"><strong>Language:</strong> {room.language}</p>
    <p className="room-visibility"><strong>{joined ? "Owner" : "Visibility"}:</strong>{" "}
      {joined ? room.owner || "Unknown" : <span className={room.visibility}>{room.visibility}</span>}</p>
    <p className="room-members"><strong>Members:</strong> {room.members || 0}</p>
    <button className="btn-enter" onClick={() => onEnter(`/room/${room.id}`)}>Enter Room</button>
  </div>;
}
