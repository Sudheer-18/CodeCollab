# CodeCollab

CodeCollab is a React/Vite collaboration client backed by a Spring Boot/MongoDB API and a Socket.IO service.

## Project layout

```text
src/
  components/
    Home/       Landing page and its presentation components
    Login/      Login/signup screens and authentication flow
    Room/       Room pages, collaboration hook, editor, chat, and participants
    dashboard/  Dashboard page, profile, statistics, and room lists
  services/     Shared HTTP client and browser-session helpers
backend/demo/
  src/main/java/com/example/demo/
    controller/ HTTP endpoints grouped by resource
    service/    User, room, and dashboard logic
    repository/ MongoDB access
    model/      MongoDB entities
    dto/        Shared API result type
socket-server/
  src/          Socket server setup, room registry, and event handlers
```

## Run locally

Install the frontend dependencies and start Vite:

```powershell
npm install
npm run dev
```

Run the API from `backend/demo`:

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/Codecollab"
.\mvnw.cmd spring-boot:run
```

Run the Socket.IO service from the repository root:

```powershell
npm --prefix socket-server start
```

The frontend defaults to the API at `http://localhost:5000` and Socket.IO at `http://localhost:5001`. Set `VITE_API_URL` and `VITE_SOCKET_URL` in a local, untracked `.env` file to override them. The socket service accepts `PORT` and `BACKEND_URL`.

The backend uses a local MongoDB URI by default. Set `MONGODB_URI` to your MongoDB connection string when using another instance. For IntelliJ, add `MONGODB_URI=mongodb://localhost:27017/Codecollab` to the run configuration's environment variables if you prefer an explicit setting. Do not commit database credentials.

The user lookup endpoint returns `_id`, `fullName`, and `email`; password data is not exposed.

## Validation

```powershell
npm run lint
npm run build
Push-Location backend\demo
.\mvnw.cmd test
Pop-Location
```

The current test suite contains a Spring application-context test. Add a local MongoDB test service or mock-backed repository tests before relying on database behavior in CI.
