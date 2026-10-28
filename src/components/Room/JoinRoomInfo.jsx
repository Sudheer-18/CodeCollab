const tips = [
  ["📝", "What is a Room Code?", "A unique identifier created by the room owner that allows others to join and collaborate."],
  ["🔒", "Private or Public?", "Rooms can be private (invite-only) or public (joinable by anyone with the code)."],
  ["👥", "Collaborate", "Once joined, you can code together, chat in real-time, and run code with other members."],
];

export default function JoinRoomInfo() {
  return <div className="join-info">
    {tips.map(([icon, title, description]) => <div className="info-card" key={title}>
      <div className="info-icon">{icon}</div><h3>{title}</h3><p>{description}</p>
    </div>)}
  </div>;
}
