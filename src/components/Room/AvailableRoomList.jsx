export default function AvailableRoomList({ rooms, joiningRoomId, onJoin }) {
  return <div className="available-room-grid">
    {rooms.map((room) => <article className="available-room-card" key={room.roomId}>
      <div className="available-room-card-heading">
        <div><h2>{room.roomName}</h2><span className="available-room-language">{room.language || "Code collaboration"}</span></div>
        <span className="available-room-status">Open</span>
      </div>
      <p className="available-room-members">{room.participantsCount} / 5 participants</p>
      <button className="available-join-button" onClick={() => onJoin(room)} disabled={Boolean(joiningRoomId)}>
        {joiningRoomId === room.roomId ? "Joining..." : "Join room"}
      </button>
    </article>)}
  </div>;
}
