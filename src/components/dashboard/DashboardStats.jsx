const items = [
  ["created", "Rooms Created", (stats) => stats.roomsCreated],
  ["joined", "Rooms Joined", (stats) => stats.roomsJoined],
  ["total", "Total Rooms", (stats) => stats.roomsCreated + stats.roomsJoined],
  ["participants", "Total Participants", (stats) => stats.totalParticipants],
];

export default function DashboardStats({ stats }) {
  return <div className="stats-section">
    {items.map(([icon, label, value]) => <div className="stat-card" key={icon}>
      <div className={`stat-icon ${icon}`}>{icon === "created" ? "📁" : icon === "joined" ? "👥" : icon === "total" ? "📊" : "🧑‍🤝‍🧑"}</div>
      <div className="stat-content"><h3>{value(stats)}</h3><p>{label}</p></div>
    </div>)}
  </div>;
}
