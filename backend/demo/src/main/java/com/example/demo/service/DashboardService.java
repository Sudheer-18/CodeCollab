package com.example.demo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.repository.RoomRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final RoomRepository rooms;

    public DashboardService(RoomRepository rooms) {
        this.rooms = rooms;
    }

    public Map<String, Object> stats(String authorization) {
        String userId = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7) : "guest";
        List<Map<String, Object>> created = rooms.findCreatedBy(userId);
        List<Map<String, Object>> joined = rooms.findJoinedBy(userId);
        long totalParticipants = rooms.findAllRooms().stream()
                .mapToLong(room -> participants(room.get("participants")).size()).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("roomsCreated", created.size());
        response.put("roomsJoined", joined.size());
        response.put("totalParticipants", totalParticipants);
        response.put("createdRooms", created.stream().map(this::createdRoom).toList());
        response.put("joinedRooms", joined.stream().map(room -> joinedRoom(room, userId)).toList());
        return response;
    }

    private Map<String, Object> createdRoom(Map<String, Object> room) {
        Map<String, Object> result = baseRoom(room);
        result.put("visibility", room.get("visibility"));
        result.put("members", participants(room.get("participants")).size());
        return result;
    }

    private Map<String, Object> joinedRoom(Map<String, Object> room, String userId) {
        Map<String, Object> result = baseRoom(room);
        result.put("owner", room.get("createdBy"));
        List<Map<String, Object>> participants = participants(room.get("participants"));
        result.put("members", participants.size());
        result.put("joinedAt", participants.stream()
                .filter(item -> userId.equals(item.get("userId")))
                .map(item -> item.get("joinedAt")).findFirst().orElse(null));
        return result;
    }

    private Map<String, Object> baseRoom(Map<String, Object> room) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", room.get("roomId"));
        result.put("name", room.get("roomName"));
        result.put("code", room.get("roomCode"));
        result.put("language", room.get("language"));
        return result;
    }

    private List<Map<String, Object>> participants(Object value) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> participant) {
                    Map<String, Object> normalized = new HashMap<>();
                    participant.forEach((key, entry) -> normalized.put(String.valueOf(key), entry));
                    result.add(normalized);
                }
            }
        }
        return result;
    }
}
