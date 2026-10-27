export default function JoinRoomForm({ room }) {
  return (
    <div className="join-room-card">
      <div className="join-header"><h1>Join a Room</h1><p>Enter a room code to collaborate with others</p></div>
      {room.error && <div className="alert error" role="alert">{room.error}</div>}
      {room.success && <div className="alert success" role="status">{room.success}</div>}
      <div className="form-group">
        <label htmlFor="roomCode">Room Code</label>
        <input id="roomCode" value={room.roomCode} placeholder="e.g., PROJ-1234" maxLength="20"
          disabled={room.loading} onChange={(event) => room.setRoomCode(event.target.value.toUpperCase())}
          onKeyDown={(event) => event.key === "Enter" && room.joinRoom(room.roomCode)} />
        <p className="hint">Room codes are provided by room creators</p>
      </div>
      <button className="btn-join" onClick={() => room.joinRoom(room.roomCode)} disabled={room.loading}>
        {room.loading ? "Joining..." : "Join Room"}
      </button>
      {room.recentRooms.length > 0 && <div className="recent-section">
        <h3>Recent Rooms</h3><div className="recent-rooms">
          {room.recentRooms.map((code) => <button key={code} className="recent-room-btn"
            onClick={() => room.joinRoom(code)} disabled={room.loading}>{code}</button>)}
        </div>
      </div>}
    </div>
  );
}
