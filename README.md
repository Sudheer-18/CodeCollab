<<<<<<< HEAD
# CodeCollab – Real-Time Collaborative Coding Platform

## Local configuration

The Spring Boot backend requires `MONGODB_URI` and `JWT_SECRET`. Use a JWT secret with at least 32 characters and keep both values outside source control. Optional `JWT_EXPIRATION_MS` defaults to 24 hours and `WEBSOCKET_ALLOWED_ORIGINS` defaults to `http://localhost:5173`.

Set the backend values in PowerShell before starting Spring Boot:

```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>/<database>"
$env:JWT_SECRET = "replace-with-a-random-secret-at-least-32-characters"
cd backend/demo
.\mvnw.cmd spring-boot:run
```

For a deployed frontend, set `VITE_API_URL` to the Spring HTTP base URL and `VITE_WS_URL` to its WebSocket base URL (`ws://` locally, `wss://` over HTTPS). Set `WEBSOCKET_ALLOWED_ORIGINS` to the exact frontend origin(s), separated by commas.

Passwords are stored with BCrypt. Existing plaintext-password accounts are upgraded to BCrypt after their next successful login.




## 1. Project Overview

CodeCollab is a real-time collaborative coding platform that allows multiple developers to write, share, and execute code together in a shared room.

The platform helps developers collaborate during coding sessions, identify errors, and discuss solutions without repeatedly sharing code manually.

**Main Objective:** To make collaborative coding, code sharing, and debugging faster and easier.

## 2. Problem Statement

When developers work individually, sharing code, identifying bugs, and reviewing changes with teammates can take additional time.

CodeCollab addresses this problem by allowing multiple users to join a shared room, collaborate on code, and execute programs through an integrated compiler feature.

## 3. Tech Stack

- **Frontend:** React.js
- **Backend:** Java, Spring Boot
- **Database:** MongoDB
- **Real-Time Communication:** WebSockets
- **Authentication:** JWT
- **Code Execution:** Docker-based execution environment
- **Deployment:** Vercel and Render

## 4. Key Features

- **Real-Time Collaboration:** Multiple users can work in the same coding room.
- **Room-Based Access:** Users join a room using its unique room ID.
- **Live Code Synchronization:** Code updates are shared with users in the same room.
- **Code Execution:** Users can select a supported programming language and run code.
- **Authentication:** JWT-based authentication.
- **Database Persistence:** MongoDB stores application data.

## 5. System Architecture

### High-Level Workflow

1. The user interacts with the React frontend.
2. The frontend communicates with Spring Boot through REST APIs for supported HTTP operations.
3. WebSockets handle real-time communication between connected users.
4. Room IDs identify the collaboration room associated with updates.
5. MongoDB stores the application's persistent data.
6. For code execution, the application uses its Docker-based execution setup and displays the execution result to the user.

### Architecture Flow

React Frontend → Spring Boot Backend → MongoDB

React Frontend ↔ WebSocket Communication ↔ Spring Boot Backend

Code Editor → Code Execution Request → Docker-Based Execution → Output/Error

## 6. Real-Time Code Synchronization

When a user edits code, the frontend sends an update through the WebSocket connection. The backend routes the update to users in the corresponding room. Other users receive the update, update their frontend state, and see the latest code.

**Important concepts:** WebSocket connections, room IDs, message routing, React state updates, and real-time communication.

## 7. Authentication Flow

1. The user registers or logs in.
2. The backend validates the request.
3. The application uses JWT-based authentication.
4. Authenticated requests are handled according to the application's authentication configuration.

## 8. Code Execution Workflow

1. The user selects a programming language.
2. The user writes code and clicks the Run button.
3. The frontend sends the code and language to the backend.
4. The Docker-based execution environment runs the submitted program.
5. The execution result or error is returned and displayed to the user.

## 9. My Technical Learning

Through this project, I gained practical experience with:

- Building React frontend components.
- Developing backend functionality using Java and Spring Boot.
- Designing and consuming REST APIs.
- Implementing real-time communication using WebSockets.
- Working with MongoDB.
- Understanding JWT-based authentication.
- Integrating a Docker-based code execution workflow.

## 10. Challenges and Technical Considerations

### Real-Time Synchronization
Keeping code synchronized across multiple connected users requires reliable message delivery and room-specific routing.

### Concurrent Editing
Simultaneous edits can create conflicts or overwrite changes. More advanced conflict-resolution mechanisms may be needed for robust collaborative editing.

### Secure Code Execution
Submitted code must be treated as untrusted. Execution environments should use appropriate timeouts, resource limits, and isolation controls.

### Room Management
Users must receive updates only for their respective collaboration rooms.

## 11. Interview Preparation Checklist

Before explaining this project in an interview, prepare answers for:

- Why did you choose Spring Boot instead of Express.js?
- How do WebSockets differ from REST APIs?
- How does room-based message routing work?
- What is the role of React state in synchronization?
- How does JWT authentication work?
- Why did you use MongoDB?
- How does Docker-based code execution work?
- How would you handle simultaneous code edits?
- How would you prevent infinite loops from consuming server resources?
- What was your individual contribution to the project?

## 12. Conclusion

CodeCollab combines frontend development, backend APIs, persistent storage, real-time communication, authentication, and code execution into a collaborative coding platform. It helped me understand how different application components work together to support a real-time, multi-user experience.

=======
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
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
