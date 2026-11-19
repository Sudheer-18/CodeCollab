export default function CreateRoomForm({ room, loading, onSubmit }) {
  return (
    <form className="create-room-form" onSubmit={onSubmit}>
      <label>Room Name
        <input type="text" value={room.roomName} onChange={(event) => room.setRoomName(event.target.value)} placeholder="Enter room name" required />
      </label>
      <label>Language
        <select value={room.language} onChange={(event) => room.setLanguage(event.target.value)}>
          <option>JavaScript</option><option>TypeScript</option><option>Python</option><option>Java</option><option>Go</option>
        </select>
      </label>
      <label>Visibility
        <div className="visibility-options">
          {["public", "private"].map((visibility) => (
            <button key={visibility} type="button" className={room.visibility === visibility ? "option active" : "option"}
              onClick={() => room.setVisibility(visibility)}>
              {visibility === "public" ? "Public" : "Private"}
            </button>
          ))}
        </div>
      </label>
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? "Creating..." : "Create Room"}
      </button>
    </form>
  );
}
