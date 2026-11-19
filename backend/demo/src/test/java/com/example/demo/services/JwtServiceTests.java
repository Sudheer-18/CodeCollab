package com.example.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private final JwtService jwtService = new JwtService("test-secret-with-at-least-32-characters-long", 60000);

    @Test
    void acceptsValidTokenAndRejectsTamperedSignature() {
        String token = jwtService.issueToken("user-123");
        String[] parts = token.split("\\.");
        String signature = parts[2];
        String replacement = signature.charAt(0) == 'a' ? "b" : "a";
        String tamperedToken = parts[0] + "." + parts[1] + "." + replacement + signature.substring(1);

        assertEquals("user-123", jwtService.getUserId(token));
        assertNull(jwtService.getUserId(tamperedToken));
    }
}