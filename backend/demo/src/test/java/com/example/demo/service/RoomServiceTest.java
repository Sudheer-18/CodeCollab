package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import com.example.demo.dto.ApiResult;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class RoomServiceTest {
    private final RoomService rooms = new RoomService(null, null, null);

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
}
