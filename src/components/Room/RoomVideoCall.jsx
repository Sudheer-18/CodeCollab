export default function RoomVideoCall({ room, count, visible, onToggle, onJoin }) {
  const url = (room.activeVideoCall && room.activeVideoCall.url) || `https://meet.jit.si/${room.roomCode || room.roomId}`;
  return <section className="video-section">
    <h3>Video Call</h3><p>Participants: {count} / 5</p>
    <p>{room.activeVideoCall || room.videoCall ? "Join the active video room to speak with everyone." : "Start a shared video room for all joined users."}</p>
    <div className="video-actions">
      <button className="submit-button" onClick={onJoin} disabled={count === 0}>
        {room.activeVideoCall || room.videoCall ? "Join Video Call" : "Start Video Call"}
      </button>
      <button className="btn-secondary" onClick={onToggle}>{visible ? "Hide Video" : "Show Video Inline"}</button>
    </div>
    {visible && <iframe title="video-room" src={url} width="100%" height="240"
      allow="camera; microphone; display-capture" />}
  </section>;
}
