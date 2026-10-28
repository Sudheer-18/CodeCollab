import { useNavigate } from "react-router-dom";

export default function HomeHeader({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <header className="home-header">
      <div className="logo">CodeCollab</div>
      <nav className="top-nav" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#about">About</a>
        {user ? (
          <>
            <button className="login-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="login-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        )}
      </nav>
    </header>
  );
}
