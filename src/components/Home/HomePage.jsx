import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../../services/auth";
import HomeHeader from "./HomeHeader";
import HomeHero from "./HomeHero";
import HomeVisual from "./HomeVisual";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);

  const logout = () => {
    clearSession();
    setUser(null);
    navigate("/login");
  };

  return (
    <main className="home-page">
      <HomeHeader user={user} onLogout={logout} />
      <section className="hero-section">
        <HomeHero navigate={navigate} />
        <HomeVisual />
      </section>
    </main>
  );
}
