import RoomVideoCall from "./RoomVideoCall";
import RoomParticipants from "./RoomParticipants";
import RoomChat from "./RoomChat";

export default function RoomSidebar({ session }) {
  const participants = session.room.participants || [];
  const count = session.room.participantsCount || participants.length || 0;
  const joinVideo = () => {
    const call = session.room.activeVideoCall || session.room.videoCall;
    const url = call ? call.url || call : `https://meet.jit.si/${session.room.roomCode || session.room.roomId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return <aside className="room-sidebar">
    <RoomVideoCall room={session.room} count={count} visible={session.showInlineVideo}
      onToggle={() => session.setShowInlineVideo((value) => !value)} onJoin={joinVideo} />
    <RoomParticipants participants={participants} />
    <RoomChat session={session} />
  </aside>;
}
