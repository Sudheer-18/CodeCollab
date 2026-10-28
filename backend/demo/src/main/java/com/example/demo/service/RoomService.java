package com.example.demo.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.demo.dto.ApiResult;
import com.example.demo.model.User;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.UserActivityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private static final int MAX_ROOM_PARTICIPANTS = 5;
    private final RoomRepository rooms;
    private final UserActivityRepository userActivity;
    private final UserService users;

    public RoomService(RoomRepository rooms, UserActivityRepository userActivity, UserService users) {
        this.rooms = rooms;
        this.userActivity = userActivity;
        this.users = users;
    }

    public ApiResult<Map<String, Object>> createRoom(Map<String, String> request, String authorization) {
        String roomName = request == null ? null : request.get("roomName");
        if (roomName == null || roomName.isBlank()) return error(HttpStatus.BAD_REQUEST, "Room name is required");
        User user = authenticatedUser(authorization);
        if (user == null) return error(HttpStatus.UNAUTHORIZED, "Please log in before creating a room");

        String roomId = UUID.randomUUID().toString();
        String roomCode = generateRoomCode(roomName);
        String createdAt = Instant.now().toString();
        Map<String, Object> room = new HashMap<>();
        room.put("roomId", roomId);
        room.put("roomCode", roomCode);
        room.put("roomName", roomName);
        room.put("language", request.get("language") == null ? "JavaScript" : request.get("language"));
        room.put("visibility", request.get("visibility") == null ? "public" : request.get("visibility"));
        room.put("createdBy", user.getId());
        room.put("createdAt", createdAt);
        room.put("participants", new ArrayList<>());
        room.put("participantsCount", 0);
        room.put("activeVideoCall", null);
        room.put("editorContent", "");
        room.put("history", new ArrayList<>());
        room.put("updatedAt", Instant.now().toString());
        rooms.insert(room);
        if (!"anonymous".equals(user.getId())) userActivity.recordRoomCreated(user.getId(), roomId);

        Map<String, Object> response = new HashMap<>();
        for (String key : List.of("roomId", "roomCode", "roomName", "language", "visibility", "createdBy", "createdAt")) {
            response.put(key, room.get(key));
        }
        return new ApiResult<>(HttpStatus.CREATED, response);
    }

    public ApiResult<Map<String, Object>> joinRoom(Map<String, String> request, String authorization) {
        String roomCode = request == null ? null : request.get("roomCode");
        if (roomCode == null || roomCode.isBlank()) return error(HttpStatus.BAD_REQUEST, "Room code is required");
        Map<String, Object> room = rooms.findByRoomCode(roomCode);
        if (room == null) return error(HttpStatus.NOT_FOUND, "Room not found");

        String userId = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7) : "guest";
        List<Map<String, Object>> participants = participants(room.get("participants"));
        boolean alreadyJoined = participants.stream().anyMatch(participant -> userId.equals(participant.get("userId")));
        if (!alreadyJoined && participants.size() >= MAX_ROOM_PARTICIPANTS) {
            return error(HttpStatus.FORBIDDEN, "Room is full (max " + MAX_ROOM_PARTICIPANTS + " participants)");
        }
        if (!alreadyJoined) {
            Map<String, Object> participant = new HashMap<>();
            participant.put("userId", userId);
            participant.put("joinedAt", Instant.now().toString());
            participants.add(participant);
        }

        String callId = UUID.randomUUID().toString();
        Map<String, Object> videoCall = new HashMap<>();
        videoCall.put("videoCallId", callId);
        videoCall.put("url", "https://videocall.example.com/" + callId);
        videoCall.put("startedAt", Instant.now().toString());
        videoCall.put("participants", participants);
        Update update = new Update().set("participants", participants)
                .set("participantsCount", participants.size()).set("activeVideoCall", videoCall);
        rooms.updateByRoomCode(roomCode, update);
        if (!"guest".equals(userId)) userActivity.recordRoomJoined(userId, room.get("roomId"), alreadyJoined);

        Map<String, Object> response = new HashMap<>();
        for (String key : List.of("roomId", "roomName", "roomCode", "language", "visibility")) {
            response.put(key, room.get(key));
        }
        response.put("participants", participants);
        response.put("videoCall", videoCall);
        return ApiResult.ok(response);
    }

    public List<Map<String, Object>> availableRooms() {
        List<Map<String, Object>> available = new ArrayList<>();
        for (Map<String, Object> room : rooms.findPublicRooms()) {
            List<Map<String, Object>> participants = participants(room.get("participants"));
            if (participants.size() >= MAX_ROOM_PARTICIPANTS) continue;
            Map<String, Object> item = new HashMap<>();
            for (String key : List.of("roomId", "roomName", "roomCode", "language", "createdAt")) {
                item.put(key, room.get(key));
            }
            item.put("participantsCount", participants.size());
            available.add(item);
        }
        return available;
    }

    public ApiResult<Map<String, Object>> findRoom(String roomId) {
        Map<String, Object> room = rooms.findByRoomId(roomId);
        return room == null ? error(HttpStatus.NOT_FOUND, "Room not found") : ApiResult.ok(room);
    }

    public ApiResult<Map<String, Object>> saveContent(String roomId, Map<String, String> payload, String authorization) {
        String content = payload == null ? null : payload.get("editorContent");
        if (content == null) return error(HttpStatus.BAD_REQUEST, "editorContent is required");
        if (rooms.findByRoomId(roomId) == null) return error(HttpStatus.NOT_FOUND, "Room not found");
        String author = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7) : "anonymous";
        Map<String, Object> historyEntry = new HashMap<>();
        historyEntry.put("author", author);
        historyEntry.put("editorContent", content);
        historyEntry.put("at", Instant.now().toString());
        Update update = new Update().set("editorContent", content).set("updatedAt", Instant.now().toString())
                .push("history", historyEntry);
        rooms.updateByRoomId(roomId, update);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("roomId", roomId);
        response.put("editorContent", content);
        response.put("historyEntry", historyEntry);
        return ApiResult.ok(response);
    }

    private User authenticatedUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String userId = authorization.substring(7).trim();
        return userId.isEmpty() ? null : users.findById(userId);
    }

    private List<Map<String, Object>> participants(Object value) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    Map<String, Object> participant = new HashMap<>();
                    map.forEach((key, entry) -> participant.put(String.valueOf(key), entry));
                    result.add(participant);
                }
            }
        }
        return result;
    }

    private String generateRoomCode(String roomName) {
        String prefix = roomName.trim().replaceAll("[^A-Za-z0-9]", "");
        prefix = prefix.length() < 3 ? "ROOM" : prefix.substring(0, Math.min(prefix.length(), 3)).toUpperCase();
        return String.format("%s-%04d", prefix, (int) (Math.random() * 9000) + 1000);
    }

    private ApiResult<Map<String, Object>> error(HttpStatus status, String message) {
        return ApiResult.error(status, message);
    }
}
