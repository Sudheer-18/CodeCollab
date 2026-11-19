import RoomHistory from "./RoomHistory";

export default function RoomEditor({ session }) {
  return <div className="editor-column">
    <div className="room-tabs">
      <button className={`room-tab ${session.viewMode === "editor" ? "active" : ""}`} onClick={() => session.setViewMode("editor")}>Code Editor</button>
      <button className={`room-tab ${session.viewMode === "history" ? "active" : ""}`} onClick={() => session.setViewMode("history")}>View History</button>
    </div>
    {session.viewMode === "editor" ? <div className="editor-pane">
      {session.remoteAvailable && <div className="remote-available">
        <strong>Remote changes available</strong><div className="remote-actions">
          <button className="btn-secondary" onClick={session.dismissRemote}>Dismiss</button>
          <button className="btn-primary" onClick={session.applyRemote}>Apply</button>
        </div>
      </div>}
      {session.editorError && <p className="alert error" role="alert">{session.editorError}</p>}
      <textarea value={session.editorText} onChange={session.handleEditorChange}
        placeholder="Type code here..." className="code-editor" aria-label="Collaborative code editor" />
    </div> : <RoomHistory history={session.room.history} onLoad={session.loadVersion}
      onRestore={session.restoreVersion} onBack={() => session.setViewMode("editor")} />}
  </div>;
}
