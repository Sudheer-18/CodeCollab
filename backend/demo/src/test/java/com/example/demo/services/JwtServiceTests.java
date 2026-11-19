package com.example.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private final JwtService jwtService = new JwtService("test-secret-with-at-least-32-characters-long", 60000);

    @Test
    void acceptsValidTokenAndRejectsTamperedSignature() {
        String token = jwtService.issueToken("user-123");
        String tamperedToken = token.substring(0, token.length() - 1)
                + (token.endsWith("a") ? "b" : "a");

        assertEquals("user-123", jwtService.getUserId(token));
        assertNull(jwtService.getUserId(tamperedToken));
    }
}