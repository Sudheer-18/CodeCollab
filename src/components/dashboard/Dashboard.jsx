import useDashboard from "./useDashboard";
import DashboardProfile from "./DashboardProfile";
import DashboardStats from "./DashboardStats";
import DashboardRoomLists from "./DashboardRoomLists";
import "./Dashboard.css";

export default function DashBoard() {
  const page = useDashboard();
  if (page.loading) return <div className="dashboard-page"><div className="loading">Loading dashboard...</div></div>;
  return <main className="dashboard-page">
    <header className="dashboard-header">
      <div className="header-left"><h1>Dashboard</h1><p className="welcome-text">Welcome back, <strong>{page.user?.fullName || "User"}</strong>!</p></div>
      <div className="header-right">
        <button className="btn-primary" onClick={() => page.navigate("/create-room")}>Create Room</button>
        <button className="btn-secondary" onClick={() => page.navigate("/join-room")}>Join Room</button>
        <button className="btn-logout" onClick={page.logout}>Logout</button>
      </div>
    </header>
    {page.error && <div className="alert error" role="alert">{page.error}</div>}
    <div className="dashboard-content">
      <DashboardProfile page={page} /><DashboardStats stats={page.stats} />
      <DashboardRoomLists rooms={page.rooms} navigate={page.navigate} />
    </div>
  </main>;
}
