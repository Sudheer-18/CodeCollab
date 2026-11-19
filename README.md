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

The backend defaults to port `5000`; the Socket.IO service defaults to port `5001`. Set `VITE_API_URL` and `VITE_SOCKET_URL` in a local `.env` file to override the frontend endpoints. Set `BACKEND_URL` to override the backend URL used by the socket service. Do not commit credentials.

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
