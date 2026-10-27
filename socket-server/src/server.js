const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./socketHandlers");

const port = process.env.PORT || 5001;
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get("/health", (_request, response) => response.json({ status: "ok" }));
registerSocketHandlers(io, backendUrl);

server.listen(port, () => console.log(`Socket server listening on ${port}`));
