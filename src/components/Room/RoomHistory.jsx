const displayAuthor = (entry) => {
  if (entry?.displayName) return entry.displayName;
  if (entry?.author && entry.author !== "guest" && entry.author !== "anonymous") return entry.author;
  return "Guest";
};

export default function RoomHistory({ history = [], onLoad, onRestore, onBack }) {
  return <section className="history-pane history-page">
    <header className="history-header">
      <div><h3>History</h3><p className="history-subtitle">Restore a previous version back into the editor.</p></div>
      <button className="ghost-button" onClick={onBack}>Back to editor</button>
    </header>
    {history.length ? <ul className="history-list">
      {history.slice().reverse().map((entry, index) => <li key={`${entry.at}-${index}`} className="history-item">
        <div className="history-item-meta">
          <div><strong>{displayAuthor(entry)}</strong><div className="history-ts">{entry.at}</div></div>
          <div className="history-actions">
            <button className="btn-secondary" onClick={() => onLoad(entry.editorContent || "")}>Load</button>
            <button className="btn-primary" onClick={() => onRestore(entry.editorContent || "")}>Restore</button>
          </div>
        </div>
      </li>)}
    </ul> : <p className="history-empty">No history yet</p>}
  </section>;
}
