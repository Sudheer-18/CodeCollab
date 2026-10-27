export default function HomeHero({ navigate }) {
  return (
    <div className="hero-copy">
      <span className="hero-eyebrow">Code Together.</span>
      <h1>Build Better.</h1>
      <p className="hero-text">
        Real-time collaborative code editor for developers to build, share and grow together.
      </p>
      <div className="hero-actions">
        <button className="primary-action" onClick={() => navigate("/create-room")}>Create Room</button>
        <button className="secondary-action" onClick={() => navigate("/join-room")}>Join Room</button>
        <button className="secondary-action" onClick={() => navigate("/availableroom")}>Available rooms</button>
      </div>
      <div className="hero-features" id="features">
        <div className="feature-card"><strong>Real-time Editing</strong><span>Edit code instantly with your team.</span></div>
        <div className="feature-card"><strong>Live Chat</strong><span>Communicate in real time without leaving the editor.</span></div>
        <div className="feature-card"><strong>Run &amp; Test</strong><span>Compile and preview code in multiple languages.</span></div>
      </div>
    </div>
  );
}
