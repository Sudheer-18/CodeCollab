const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
});

const PORT = process.env.PORT || 5001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const rooms = {}; // { roomId: { participants: Set() } }

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('joinRoom', ({ roomId, userId }) => {
    (async () => {
      let resolvedUser = userId || socket.id;
      // validate userId against backend
      if (userId) {
        try {
          const resp = await axios.get(`${BACKEND_URL}/users/${userId}`);
          if (resp && resp.status === 200) {
            // keep resolvedUser
            resolvedUser = userId;
          } else {
            resolvedUser = 'guest';
          }
        } catch (e) {
          resolvedUser = 'guest';
        }
      }

      socket.join(roomId);
      socket.data.userId = resolvedUser;
      socket.data.roomId = roomId;
      if (!rooms[roomId]) rooms[roomId] = { participants: new Set() };
      rooms[roomId].participants.add(socket.data.userId);
      io.to(roomId).emit('participants', Array.from(rooms[roomId].participants));
    })();
  });

  socket.on('leaveRoom', () => {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].participants.delete(userId);
      io.to(roomId).emit('participants', Array.from(rooms[roomId].participants));
    }
    socket.leave(roomId);
  });

  socket.on('editorChange', async ({ roomId, content, author }) => {
    socket.to(roomId).emit('remoteEditorChange', { content, author });
    // persist to backend (best-effort)
    try {
      await axios.patch(`${BACKEND_URL}/api/rooms/${roomId}/content`, { editorContent: content }, {
        headers: author ? { Authorization: `Bearer ${author}` } : {}
      });
    } catch (e) {
      // ignore persistence errors
    }
  });

  // chat messages
  socket.on('chatMessage', ({ roomId, author, text }) => {
    const payload = { author: author || socket.data.userId || 'anon', text, at: new Date().toISOString() };
    io.to(roomId).emit('chatMessage', payload);
    // no persistence for chat in this simple implementation
  });

  socket.on('restore', async ({ roomId, content, author }) => {
    io.to(roomId).emit('remoteEditorRestore', { content, author });
    try {
      await axios.patch(`${BACKEND_URL}/api/rooms/${roomId}/content`, { editorContent: content }, {
        headers: author ? { Authorization: `Bearer ${author}` } : {}
      });
    } catch (e) {}
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].participants.delete(userId);
      io.to(roomId).emit('participants', Array.from(rooms[roomId].participants));
    }
    console.log('socket disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket server listening on ${PORT}`);
});
