const getParticipantName = (participant) => {
  if (!participant) return "Guest";
  if (typeof participant === "string") return participant || "Guest";

  const candidate = participant.fullName || participant.displayName || participant.name || participant.userId;
  if (!candidate || candidate === "guest" || candidate === "anonymous") return "Guest";
  return candidate;
};

export default function RoomParticipants({ participants = [] }) {
  return <section className="participants">
    <h3>Participants</h3>
    {participants.length ? <ul>{participants.map((participant, index) => {
      const name = getParticipantName(participant);
      const joinedAt = typeof participant === "string" ? "-" : participant.joinedAt || "-";
      return <li key={`${name}-${index}`}>{name} - {joinedAt}</li>;
    })}</ul> : <p>No participants yet</p>}
  </section>;
}
