package com.example.demo.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@Controller
public class RoomWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MongoTemplate mongoTemplate;
    private final ConcurrentMap<String, ConcurrentMap<String, String>> roomSessions = new ConcurrentHashMap<>();

    public RoomWebSocketController(SimpMessagingTemplate messagingTemplate, MongoTemplate mongoTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.mongoTemplate = mongoTemplate;
    }

    @MessageMapping("/rooms/{roomId}/join")
    public void joinRoom(@DestinationVariable String roomId, Principal principal,
                         @Header(SimpMessageHeaderAccessor.SESSION_ID_HEADER) String sessionId) {
        if (!isRoomMember(roomId, principal.getName())) {
            return;
        }
        roomSessions.computeIfAbsent(roomId, ignored -> new ConcurrentHashMap<>())
                .put(sessionId, principal.getName());
        publishParticipants(roomId);
    }

    @MessageMapping("/rooms/{roomId}/leave")
    public void leaveRoom(@DestinationVariable String roomId, Principal principal,
                          @Header(SimpMessageHeaderAccessor.SESSION_ID_HEADER) String sessionId) {
        if (!isJoined(roomId, sessionId, principal)) {
            return;
        }
        removeSession(roomId, sessionId);
    }

    @MessageMapping("/rooms/{roomId}/editor")
    public void editorChange(@DestinationVariable String roomId, Map<String, String> message, Principal principal,
                             @Header(SimpMessageHeaderAccessor.SESSION_ID_HEADER) String sessionId) {
        if (!isJoined(roomId, sessionId, principal)) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/editor", (Object) Map.of(
                "content", message.getOrDefault("content", ""),
                "author", principal.getName()));
    }

    @MessageMapping("/rooms/{roomId}/restore")
    public void restoreEditor(@DestinationVariable String roomId, Map<String, String> message, Principal principal,
                              @Header(SimpMessageHeaderAccessor.SESSION_ID_HEADER) String sessionId) {
        if (!isJoined(roomId, sessionId, principal)) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/restore", (Object) Map.of(
                "content", message.getOrDefault("content", ""),
                "author", principal.getName()));
    }

    @MessageMapping("/rooms/{roomId}/chat")
    public void chatMessage(@DestinationVariable String roomId, Map<String, String> message, Principal principal,
                            @Header(SimpMessageHeaderAccessor.SESSION_ID_HEADER) String sessionId) {
        if (!isJoined(roomId, sessionId, principal)) {
            return;
        }
        String text = message.getOrDefault("text", "").trim();
        if (text.isEmpty() || text.length() > 2000) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/chat", (Object) Map.of(
                "author", principal.getName(),
                "text", text,
                "at", Instant.now().toString()));
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        roomSessions.forEach((roomId, sessions) -> {
            if (sessions.containsKey(sessionId)) {
                removeSession(roomId, sessionId);
            }
        });
    }

    private void removeSession(String roomId, String sessionId) {
        ConcurrentMap<String, String> sessions = roomSessions.get(roomId);
        if (sessions != null && sessions.remove(sessionId) != null) {
            if (sessions.isEmpty()) {
                roomSessions.remove(roomId, sessions);
            }
            publishParticipants(roomId);
        }
    }

    private void publishParticipants(String roomId) {
        ConcurrentMap<String, String> sessions = roomSessions.get(roomId);
        List<Map<String, String>> participants = new ArrayList<>();
        if (sessions != null) {
            sessions.values().stream().distinct().forEach(userId -> participants.add(Map.of(
                    "userId", userId,
                    "joinedAt", "Online")));
        }
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/participants", participants);
    }

    private boolean isJoined(String roomId, String sessionId, Principal principal) {
        ConcurrentMap<String, String> sessions = roomSessions.get(roomId);
        return sessions != null && principal != null && principal.getName().equals(sessions.get(sessionId));
    }

    private boolean isRoomMember(String roomId, String userId) {
        Query query = new Query(new Criteria().andOperator(
                Criteria.where("roomId").is(roomId),
                new Criteria().orOperator(
                        Criteria.where("createdBy").is(userId),
                        Criteria.where("participants.userId").is(userId))));
        return mongoTemplate.exists(query, "rooms");
    }
}