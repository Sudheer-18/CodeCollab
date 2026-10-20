# CodeCollab

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
