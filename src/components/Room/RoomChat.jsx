const displayAuthor = (message) => {
  if (message?.displayName) return message.displayName;
  if (message?.author && message.author !== "guest" && message.author !== "anonymous") return message.author;
  return "Guest";
};

export default function RoomChat({ session }) {
  return <section className="chat-section">
    <h3>Chat</h3><p role="status">{session.socketConnected ? "Connected" : session.socketError || "Connecting to room..."}</p>
    {session.chatError && <p className="alert error" role="alert">{session.chatError}</p>}
    <div className="chat-box">
      {session.messages.length ? session.messages.map((message, index) => <div key={`${message.at}-${index}`} className="chat-message">
        <strong>{displayAuthor(message)}</strong><div>{message.text}</div><div className="history-ts">{message.at}</div>
      </div>) : <div className="history-empty">No messages yet</div>}
    </div>
    <div className="chat-footer">
      <input value={session.newMessage} onChange={(event) => session.setNewMessage(event.target.value)} placeholder="Type a message" aria-label="Chat message" />
      <button className="submit-button" onClick={session.sendChat}>Send</button>
    </div>
  </section>;
}
