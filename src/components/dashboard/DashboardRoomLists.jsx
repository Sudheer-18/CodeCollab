import DashboardRoomCard from "./DashboardRoomCard";

function RoomList({ title, rooms, joined, navigate }) {
  return <div className="rooms-col">
    <h2>{title}</h2><div className="rooms-list">
      {rooms.length ? rooms.map((room) => <DashboardRoomCard key={room.id} room={room} joined={joined} onEnter={navigate} />) :
        <p className="empty-state">No rooms {joined ? "joined" : "created"} yet</p>}
    </div>
  </div>;
}

export default function DashboardRoomLists({ rooms, navigate }) {
  return <div className="rooms-section">
    <RoomList title="Rooms Created" rooms={rooms.created} navigate={navigate} />
    <RoomList title="Rooms Joined" rooms={rooms.joined} joined navigate={navigate} />
  </div>;
}
