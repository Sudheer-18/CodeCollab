package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.example.demo.dto.ApiResult;
import com.example.demo.model.User;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.UserActivityRepository;
import com.example.demo.services.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class RoomServiceTest {
    private final RoomRepository roomRepository = mock(RoomRepository.class);
    private final UserActivityRepository userActivity = mock(UserActivityRepository.class);
    private final UserService users = mock(UserService.class);
    private final JwtService jwtService = new JwtService("test-secret-with-at-least-32-characters-long", 60000);
    private final RoomService rooms = new RoomService(roomRepository, userActivity, users, jwtService);

    @Test
    void createRoomRequiresNameBeforeAuthentication() {
        ApiResult<Map<String, Object>> result = rooms.createRoom(Map.of(), null);

        assertEquals(HttpStatus.BAD_REQUEST, result.status());
        assertEquals("Room name is required", result.body().get("message"));
    }

    @Test
    void createRoomRequiresAuthenticatedUser() {
        ApiResult<Map<String, Object>> result = rooms.createRoom(Map.of("roomName", "pairing"), null);

        assertEquals(HttpStatus.UNAUTHORIZED, result.status());
        assertEquals("Please log in before creating a room", result.body().get("message"));
    }

    @Test
    void joinRoomRequiresRoomCode() {
        ApiResult<Map<String, Object>> result = rooms.joinRoom(Map.of(), null);

        assertEquals(HttpStatus.BAD_REQUEST, result.status());
        assertEquals("Room code is required", result.body().get("message"));
    }

    @Test
    void createRoomResolvesUserFromBearerJwt() {
        User user = new User("Test User", "test@example.com", "password");
        user.setId("user-123");
        when(users.findById("user-123")).thenReturn(user);

        ApiResult<Map<String, Object>> result = rooms.createRoom(
                Map.of("roomName", "pairing"),
                "Bearer " + jwtService.issueToken("user-123"));

        assertEquals(HttpStatus.CREATED, result.status());
        verify(users).findById("user-123");
        verify(roomRepository).insert(anyMap());
    }

    @Test
    void joinRoomResolvesUserFromBearerJwt() {
        User user = new User("Test User", "test@example.com", "password");
        user.setId("user-123");
        when(users.findById("user-123")).thenReturn(user);

        Map<String, Object> room = new HashMap<>();
        room.put("roomId", "room-123");
        room.put("roomCode", "PAIR-1234");
        room.put("roomName", "pairing");
        room.put("language", "JavaScript");
        room.put("visibility", "public");
        room.put("participants", new ArrayList<>());
        when(roomRepository.findByRoomCode("PAIR-1234")).thenReturn(room);

        ApiResult<Map<String, Object>> result = rooms.joinRoom(
                Map.of("roomCode", "PAIR-1234"),
                "Bearer " + jwtService.issueToken("user-123"));

        assertEquals(HttpStatus.OK, result.status());
        verify(users).findById("user-123");
        verify(roomRepository).updateByRoomCode(org.mockito.ArgumentMatchers.eq("PAIR-1234"),
                org.mockito.ArgumentMatchers.any());
    }
}
