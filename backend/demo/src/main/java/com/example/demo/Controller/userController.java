package com.example.demo.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;

import com.example.demo.Model.User;
import com.example.demo.services.UserSeeervice;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
public class userController {

    @Autowired
    private UserSeeervice userService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostMapping("/users/add")
    public ResponseEntity<Map<String, Object>> saveUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        if (user.getFullName() == null || user.getFullName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            response.put("message", "Full name, email, and password are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (userService.emailExists(user.getEmail().trim().toLowerCase())) {
            response.put("message", "An account with this email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        user.setEmail(user.getEmail().trim().toLowerCase());
        User savedUser = userService.saveUser(user);
        response.put("success", true);
        response.put("message", "Account created successfully");
        response.put("user", savedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/users/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            response.put("success", false);
            response.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(response);
        }

        User user = userService.login(email.trim().toLowerCase(), password);

        if (user == null) {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Use the user id as the token for this simple demo.
        String token = user.getId();

        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", user);
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/rooms/create")
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Map<String, String> roomData,
                                                          @RequestHeader(value = "Authorization", required = false) String authorization) {
        String roomName = roomData.get("roomName");
        String language = roomData.get("language");
        String visibility = roomData.get("visibility");

        if (roomName == null || roomName.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Room name is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User authenticatedUser = authenticatedUser(authorization);
        if (authenticatedUser == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Please log in before creating a room");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String roomId = UUID.randomUUID().toString();
        String roomCode = generateRoomCode(roomName);
        String createdBy = authenticatedUser.getId();

        Map<String, Object> room = new HashMap<>();
        room.put("roomId", roomId);
        room.put("roomCode", roomCode);
        room.put("roomName", roomName);
        room.put("language", language != null ? language : "JavaScript");
        room.put("visibility", visibility != null ? visibility : "public");
        room.put("createdBy", createdBy);
        room.put("createdAt", Instant.now().toString());
        // participants will be list of objects { userId, joinedAt }
        List<Map<String, Object>> participantsList = new ArrayList<>();
        room.put("participants", participantsList);
        room.put("participantsCount", 0);
        room.put("activeVideoCall", null);
        room.put("editorContent", "");
        // history: list of { author, editorContent, at }
        List<Map<String, Object>> historyList = new ArrayList<>();
        room.put("history", historyList);
        room.put("updatedAt", Instant.now().toString());

        mongoTemplate.insert(room, "rooms");

        // update user document to track created rooms and count
        if (!"anonymous".equals(createdBy)) {
            Query uq = new Query(Criteria.where("_id").is(createdBy));
            Update uupdate = new Update().inc("roomsCreated", 1).push("createdRooms", roomId);
            mongoTemplate.upsert(uq, uupdate, "users");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("roomCode", roomCode);
        response.put("roomName", roomName);
        response.put("language", room.get("language"));
        response.put("visibility", room.get("visibility"));
        response.put("createdBy", createdBy);
        response.put("createdAt", room.get("createdAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private User authenticatedUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }
        String userId = authorization.substring(7).trim();
        return userId.isEmpty() ? null : userService.findById(userId);
    }

    @PostMapping("/api/rooms/join")
    public ResponseEntity<Map<String, Object>> joinRoom(@RequestBody Map<String, String> requestBody,
                                                        @RequestHeader(value = "Authorization", required = false) String authorization) {
        String roomCode = requestBody.get("roomCode");
        if (roomCode == null || roomCode.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Room code is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Query query = new Query();
        query.addCriteria(Criteria.where("roomCode").is(roomCode));
        Map room = mongoTemplate.findOne(query, Map.class, "rooms");
        if (room == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Room not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }


        String userIdentifier = "guest";
        if (authorization != null && authorization.startsWith("Bearer ")) {
            userIdentifier = authorization.substring(7);
        }

        // participants are list of objects { userId, joinedAt }
        List<Map<String, Object>> participants = (List<Map<String, Object>>) room.get("participants");
        if (participants == null) {
            participants = new ArrayList<>();
        }

        boolean alreadyJoined = false;
        for (Map p : participants) {
            if (userIdentifier.equals(p.get("userId"))) {
                alreadyJoined = true;
                break;
            }
        }

        if (!alreadyJoined) {
            // enforce maximum 5 participants
            if (participants.size() >= 5) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Room is full (max 5 participants)");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Map<String, Object> participantObj = new HashMap<>();
            participantObj.put("userId", userIdentifier);
            participantObj.put("joinedAt", Instant.now().toString());
            participants.add(participantObj);
        }

        String videoCallId = UUID.randomUUID().toString();
        String videoCallUrl = String.format("https://videocall.example.com/%s", videoCallId);
        Map<String, Object> videoCall = new HashMap<>();
        videoCall.put("videoCallId", videoCallId);
        videoCall.put("url", videoCallUrl);
        videoCall.put("startedAt", Instant.now().toString());
        videoCall.put("participants", participants);

        Update update = new Update();
        update.set("participants", participants);
        update.set("participantsCount", participants.size());
        update.set("activeVideoCall", videoCall);
        mongoTemplate.upsert(query, update, "rooms");

        // update user's joined rooms and count
        if (!"guest".equals(userIdentifier)) {
            Query uq = new Query(Criteria.where("_id").is(userIdentifier));
            Update uup = new Update().inc("roomsJoined", alreadyJoined ? 0 : 1).push("joinedRooms", room.get("roomId"));
            mongoTemplate.upsert(uq, uup, "users");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", room.get("roomId"));
        response.put("roomName", room.get("roomName"));
        response.put("roomCode", room.get("roomCode"));
        response.put("language", room.get("language"));
        response.put("visibility", room.get("visibility"));
        response.put("participants", participants);
        response.put("videoCall", videoCall);

        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.GetMapping("/api/dashboard/stats")
    public ResponseEntity<Map<String, Object>> dashboardStats(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String userIdentifier = "guest";
        if (authorization != null && authorization.startsWith("Bearer ")) {
            userIdentifier = authorization.substring(7);
        }

        // rooms created by this user
        Query createdQuery = new Query();
        createdQuery.addCriteria(Criteria.where("createdBy").is(userIdentifier));
        List<Map> createdRooms = mongoTemplate.find(createdQuery, Map.class, "rooms");
        long createdCount = createdRooms != null ? createdRooms.size() : 0;

        // rooms joined by this user (search inside participants.userId)
        Query joinedQuery = new Query();
        joinedQuery.addCriteria(Criteria.where("participants.userId").is(userIdentifier));
        List<Map> joinedRooms = mongoTemplate.find(joinedQuery, Map.class, "rooms");
        long joinedCount = joinedRooms != null ? joinedRooms.size() : 0;

        Map<String, Object> resp = new HashMap<>();
        resp.put("roomsCreated", createdCount);
        resp.put("roomsJoined", joinedCount);

        // total participants across all rooms
        Query allRoomsQuery = new Query();
        List<Map> allRooms = mongoTemplate.find(allRoomsQuery, Map.class, "rooms");
        long totalParticipants = 0;
        if (allRooms != null) {
            for (Map r : allRooms) {
                List parts = (List) r.get("participants");
                if (parts != null) totalParticipants += parts.size();
            }
        }
        resp.put("totalParticipants", totalParticipants);

        // normalize room objects for frontend
        List<Map<String, Object>> createdList = new ArrayList<>();
        if (createdRooms != null) {
            for (Map r : createdRooms) {
                Map<String, Object> obj = new HashMap<>();
                obj.put("id", r.get("roomId"));
                obj.put("name", r.get("roomName"));
                obj.put("code", r.get("roomCode"));
                obj.put("language", r.get("language"));
                obj.put("visibility", r.get("visibility"));
                obj.put("members", r.get("participants") != null ? ((List) r.get("participants")).size() : 0);
                createdList.add(obj);
            }
        }

        List<Map<String, Object>> joinedList = new ArrayList<>();
        if (joinedRooms != null) {
            for (Map r : joinedRooms) {
                Map<String, Object> obj = new HashMap<>();
                obj.put("id", r.get("roomId"));
                obj.put("name", r.get("roomName"));
                obj.put("code", r.get("roomCode"));
                obj.put("language", r.get("language"));
                obj.put("owner", r.get("createdBy"));
                List<Map<String, Object>> parts = (List<Map<String, Object>>) r.get("participants");
                obj.put("members", parts != null ? parts.size() : 0);

                // find joinedAt for this user
                String joinedAt = null;
                if (parts != null) {
                    for (Map p : parts) {
                        if (userIdentifier.equals(p.get("userId"))) {
                            joinedAt = (String) p.get("joinedAt");
                            break;
                        }
                    }
                }
                obj.put("joinedAt", joinedAt);
                joinedList.add(obj);
            }
        }

        resp.put("createdRooms", createdList);
        resp.put("joinedRooms", joinedList);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomById(@PathVariable String roomId) {
        Query q = new Query(Criteria.where("roomId").is(roomId));
        Map room = mongoTemplate.findOne(q, Map.class, "rooms");
        if (room == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Room not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(room);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        Query q = new Query(Criteria.where("_id").is(id));
        Map user = mongoTemplate.findOne(q, Map.class, "users");
        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> profile,
                                                               @RequestHeader(value = "Authorization", required = false) String authorization) {
        User authenticatedUser = authenticatedUser(authorization);
        Map<String, Object> response = new HashMap<>();
        if (authenticatedUser == null) {
            response.put("message", "Please log in before editing your profile");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String fullName = profile.get("fullName");
        if (fullName == null || fullName.isBlank()) {
            response.put("message", "Full name is required");
            return ResponseEntity.badRequest().body(response);
        }

        authenticatedUser.setFullName(fullName.trim());
        User savedUser = userService.saveUser(authenticatedUser);
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        response.put("user", savedUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/code/execute")
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, String> codePayload,
                                                            @RequestHeader(value = "Authorization", required = false) String authorization) {
        Map<String, Object> response = new HashMap<>();
        if (authenticatedUser(authorization) == null) {
            response.put("message", "Please log in before running code");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String language = codePayload.get("language");
        String code = codePayload.get("code");
        String stdin = codePayload.getOrDefault("stdin", "");
        Map<String, String> runtime = runtimeFor(language);

        if (runtime == null) {
            response.put("message", "Unsupported language. Choose JavaScript, TypeScript, Python, Java, or Go.");
            return ResponseEntity.badRequest().body(response);
        }
        if (code == null || code.isBlank()) {
            response.put("message", "Write some code before running it");
            return ResponseEntity.badRequest().body(response);
        }
        if (code.length() > 20000 || stdin.length() > 5000) {
            response.put("message", "Code is limited to 20,000 characters and input to 5,000 characters");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("source_code", code);
            requestBody.put("language_id", Integer.parseInt(runtime.get("languageId")));
            requestBody.put("stdin", stdin);

            ObjectMapper objectMapper = new ObjectMapper();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://ce.judge0.com/submissions?base64_encoded=false&wait=true"))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody), StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> execution = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            Map<String, Object> judgeResult = objectMapper.readValue(execution.body(), Map.class);
            if (execution.statusCode() >= 400) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(judgeResult);
            }

            Map<String, Object> run = new HashMap<>();
            run.put("stdout", judgeResult.get("stdout"));
            run.put("stderr", judgeResult.get("stderr"));
            run.put("code", judgeResult.get("exit_code"));

            Map<String, Object> normalizedResult = new HashMap<>();
            normalizedResult.put("language", language);
            normalizedResult.put("run", run);
            normalizedResult.put("status", judgeResult.get("status"));
            if (judgeResult.get("compile_output") != null) {
                Map<String, Object> compile = new HashMap<>();
                compile.put("stderr", judgeResult.get("compile_output"));
                normalizedResult.put("compile", compile);
            }
            return ResponseEntity.ok(normalizedResult);
        } catch (Exception exception) {
            response.put("message", "The code runner is unavailable right now");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        }
    }

    private Map<String, String> runtimeFor(String language) {
        if (language == null) {
            return null;
        }

        Map<String, String> runtime = new HashMap<>();
        switch (language.trim().toLowerCase()) {
            case "javascript" -> {
                runtime.put("languageId", "63");
            }
            case "typescript" -> {
                runtime.put("languageId", "74");
            }
            case "python" -> {
                runtime.put("languageId", "71");
            }
            case "java" -> {
                runtime.put("languageId", "62");
            }
            case "go" -> {
                runtime.put("languageId", "60");
            }
            default -> {
                return null;
            }
        }
        return runtime;
    }

    @PatchMapping("/api/rooms/{roomId}/content")
    public ResponseEntity<Map<String, Object>> saveRoomContent(@PathVariable String roomId,
                                                               @RequestBody Map<String, String> contentPayload,
                                                               @RequestHeader(value = "Authorization", required = false) String authorization) {
        String editorContent = contentPayload.get("editorContent");
        if (editorContent == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "editorContent is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Query q = new Query(Criteria.where("roomId").is(roomId));
        Map room = mongoTemplate.findOne(q, Map.class, "rooms");
        if (room == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Room not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        // save editorContent and append a history entry with author and timestamp
        String author = "anonymous";
        if (authorization != null && authorization.startsWith("Bearer ")) {
            author = authorization.substring(7);
        }

        Update update = new Update();
        update.set("editorContent", editorContent);
        update.set("updatedAt", Instant.now().toString());
        // build history entry
        Map<String, Object> historyEntry = new HashMap<>();
        historyEntry.put("author", author);
        historyEntry.put("editorContent", editorContent);
        historyEntry.put("at", Instant.now().toString());
        update.push("history", historyEntry);

        mongoTemplate.upsert(q, update, "rooms");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("roomId", roomId);
        response.put("editorContent", editorContent);
        response.put("historyEntry", historyEntry);
        return ResponseEntity.ok(response);
    }

    private String generateRoomCode(String roomName) {
        String prefix = roomName.trim().replaceAll("[^A-Za-z0-9]", "");
        if (prefix.length() < 3) {
            prefix = "ROOM";
        } else {
            prefix = prefix.substring(0, Math.min(prefix.length(), 3)).toUpperCase();
        }
        return String.format("%s-%04d", prefix, (int) (Math.random() * 9000) + 1000);
    }
}
