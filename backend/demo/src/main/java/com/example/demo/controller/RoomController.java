package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import com.example.demo.dto.ApiResult;
import com.example.demo.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class RoomController {
    private final RoomService rooms;

    public RoomController(RoomService rooms) {
        this.rooms = rooms;
    }

    @PostMapping("/api/rooms/create")
    public ResponseEntity<?> create(@RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return response(rooms.createRoom(request, authorization));
    }

    @PostMapping("/api/rooms/join")
    public ResponseEntity<?> join(@RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return response(rooms.joinRoom(request, authorization));
    }

    @GetMapping("/api/rooms/available")
    public List<Map<String, Object>> available() {
        return rooms.availableRooms();
    }

    @GetMapping("/api/rooms/{roomId}")
    public ResponseEntity<?> find(@PathVariable String roomId) {
        return response(rooms.findRoom(roomId));
    }

    @PatchMapping("/api/rooms/{roomId}/content")
    public ResponseEntity<?> saveContent(@PathVariable String roomId,
            @RequestBody Map<String, String> content,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return response(rooms.saveContent(roomId, content, authorization));
    }

    private ResponseEntity<?> response(ApiResult<?> result) {
        return ResponseEntity.status(result.status()).body(result.body());
    }
}
