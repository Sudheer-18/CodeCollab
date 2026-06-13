import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <header className="home-header">
        <div className="logo">CodeCollab</div>
        <nav className="top-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#about">About</a>
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-eyebrow">Code Together.</span>
          <h1>Build Better.</h1>
          <p className="hero-text">
            Real-time collaborative code editor for developers to build, share and grow together.
          </p>

          <div className="hero-actions">
            <button className="primary-action" onClick={() => navigate("/create-room")}>Create Room</button>
            <button className="secondary-action" onClick={() => navigate("/login")}>Join Room</button>
          </div>

          <div className="hero-features" id="features">
            <div className="feature-card">
              <strong>Real-time Editing</strong>
              <span>Edit code instantly with your team.</span>
            </div>
            <div className="feature-card">
              <strong>Live Chat</strong>
              <span>Communicate in real time without leaving the editor.</span>
            </div>
            <div className="feature-card">
              <strong>Run & Test</strong>
              <span>Compile and preview code in multiple languages.</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-card-header">
              <span>main.js</span>
              <div className="circle-group">
                <span className="circle red" />
                <span className="circle yellow" />
                <span className="circle green" />
              </div>
            </div>
            <pre className="code-preview">
{`import React from "react";

const App = () => {
  return <h1>CodeCollab</h1>;
};

export default App;`}
            </pre>
            <div className="avatar-row">
              <div className="avatar">R</div>
              <div className="avatar">M</div>
              <div className="avatar">A</div>
              <div className="avatar plus">+3</div>
            </div>
            <div className="visual-status">
              <span>Live collaboration</span>
              <button className="run-btn">Run Code</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;