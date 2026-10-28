package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;
import com.example.demo.dto.ApiResult;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.http.HttpStatus;
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
public class UserController {
    private final UserService users;

    public UserController(UserService users) {
        this.users = users;
    }

    @PostMapping("/users/add")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getFullName() == null || user.getFullName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            return response(ApiResult.error(HttpStatus.BAD_REQUEST, "Full name, email, and password are required"));
        }
        if (users.emailExists(user.getEmail().trim().toLowerCase())) {
            return response(ApiResult.error(HttpStatus.CONFLICT, "An account with this email already exists"));
        }
        user.setEmail(user.getEmail().trim().toLowerCase());
        User saved = users.saveUser(user);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Account created successfully");
        result.put("user", saved);
        return response(new ApiResult<>(HttpStatus.CREATED, result));
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials == null ? null : credentials.get("email");
        String password = credentials == null ? null : credentials.get("password");
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(result);
        }
        User user = users.login(email.trim().toLowerCase(), password);
        if (user == null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Login successful");
        result.put("user", user);
        result.put("token", user.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> findUser(@PathVariable String id) {
        User user = users.findById(id);
        if (user == null) return response(ApiResult.error(HttpStatus.NOT_FOUND, "User not found"));
        Map<String, Object> result = new HashMap<>();
        result.put("_id", user.getId());
        result.put("fullName", user.getFullName());
        result.put("email", user.getEmail());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/users/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profile,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        User user = authenticatedUser(authorization);
        if (user == null) return response(ApiResult.error(HttpStatus.UNAUTHORIZED, "Please log in before editing your profile"));
        String fullName = profile == null ? null : profile.get("fullName");
        if (fullName == null || fullName.isBlank()) return response(ApiResult.error(HttpStatus.BAD_REQUEST, "Full name is required"));
        user.setFullName(fullName.trim());
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Profile updated successfully");
        result.put("user", users.saveUser(user));
        return ResponseEntity.ok(result);
    }

    private User authenticatedUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String id = authorization.substring(7).trim();
        return id.isEmpty() ? null : users.findById(id);
    }

    private ResponseEntity<?> response(ApiResult<?> result) {
        return ResponseEntity.status(result.status()).body(result.body());
    }
}
