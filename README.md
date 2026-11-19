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

Start the backend from `backend/demo`. Copy `.env.example` to `.env` and replace its placeholder values with your Atlas URI and a private JWT secret. The real `.env` is ignored by Git; do not commit it.

```powershell
Copy-Item .env.example .env
.\mvnw.cmd spring-boot:run
```

The frontend defaults to the deployed API at `https://codecollab-1-stj1.onrender.com`. To use a different backend locally, set `VITE_API_URL` in a root `.env.local` file (for example, `VITE_API_URL=http://127.0.0.1:5000`) and restart Vite. In Render, set `MONGODB_URI` to your Atlas connection string and `JWT_SECRET` to a private random secret of at least 32 characters in the service Environment settings. Enter each value directly—do not put `${...}` around them or commit them to source. The backend requires a MongoDB URI and has no localhost fallback. The backend defaults to port `5000`; the Socket.IO service defaults to port `5001`.

The Socket.IO service must be deployed separately from the Spring API. Set `VITE_SOCKET_URL` in the Vercel project to that service's public URL, `BACKEND_URL` on the socket service to the Spring API URL, and `SOCKET_ALLOWED_ORIGINS` to `https://code-collab-dun-three.vercel.app`. Without `VITE_SOCKET_URL`, production room pages skip the Socket.IO connection rather than trying localhost. `VITE_WS_URL` and `WEBSOCKET_ALLOWED_ORIGINS` can override the Spring WebSocket address and origin. Do not commit credentials.

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
