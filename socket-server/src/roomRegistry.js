class RoomRegistry {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  add(roomId, socketId, participant) {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Map());
    this.rooms.get(roomId).set(socketId, participant);
    this.emitParticipants(roomId);
  }

  remove(roomId, socketId) {
    const participants = this.rooms.get(roomId);
    if (!participants) return;
    participants.delete(socketId);
    if (participants.size === 0) this.rooms.delete(roomId);
    else this.emitParticipants(roomId);
  }

  emitParticipants(roomId) {
    const participants = this.rooms.get(roomId);
    if (participants) this.io.to(roomId).emit("participants", Array.from(participants.values()));
  }
}

module.exports = RoomRegistry;
