# CodeCollab

CodeCollab is a collaborative coding platform with a React/Vite frontend, a Spring Boot/MongoDB API, and a Socket.IO service.

## Project layout

- `src/components/` contains the frontend pages and collaboration UI.
- `src/services/` contains shared HTTP and authentication helpers.
- `backend/demo/` contains the Spring Boot API.
- `socket-server/` contains the Socket.IO service.

## Run locally

Install the frontend dependencies and start the frontend and socket service:

```powershell
npm install
npm run dev
```

Start the backend from `backend/demo` with MongoDB running:

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/Codecollab"
$env:JWT_SECRET = "replace-with-a-random-secret-at-least-32-characters"
.\mvnw.cmd spring-boot:run
```

Production frontend builds use `https://codecollab-1-stj1.onrender.com` for API requests and allow the frontend origin `https://code-collab-dun-three.vercel.app` for backend WebSockets. The backend defaults to port `5000`; the Socket.IO service defaults to port `5001`.

The Socket.IO service must be deployed separately from the Spring API. Set `VITE_SOCKET_URL` in the Vercel project to that service's public URL, `BACKEND_URL` on the socket service to the Spring API URL, and `SOCKET_ALLOWED_ORIGINS` to `https://code-collab-dun-three.vercel.app`. `VITE_API_URL` and `WEBSOCKET_ALLOWED_ORIGINS` can override the frontend API and backend WebSocket origin. For local development, the API defaults to `http://localhost:5000`; use local environment overrides as needed. Do not commit credentials.

## Validation

Run these commands from the repository root:

```powershell
npm run lint
npm run build
node --check socket-server/index.js
Push-Location backend\demo
.\mvnw.cmd test
Pop-Location
```
