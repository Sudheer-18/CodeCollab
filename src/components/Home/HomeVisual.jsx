export default function HomeVisual() {
  return (
    <div className="hero-visual">
      <div className="visual-card">
        <div className="visual-card-header">
          <span>main.js</span>
          <div className="circle-group"><span className="circle red" /><span className="circle yellow" /><span className="circle green" /></div>
        </div>
        <pre className="code-preview">{`import React from "react";

const App = () => {
  return <h1>CodeCollab</h1>;
};

export default App;`}</pre>
        <div className="avatar-row">
          <div className="avatar">R</div><div className="avatar">M</div>
          <div className="avatar">A</div><div className="avatar plus">+3</div>
        </div>
        <div className="visual-status"><span>Live collaboration</span><button className="run-btn">Run Code</button></div>
      </div>
    </div>
  );
}
