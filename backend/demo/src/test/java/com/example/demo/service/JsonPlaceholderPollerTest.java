package com.example.demo.service;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JsonPlaceholderPollerTest {

    @Test
    void pollUsersRequestsTheConfiguredEndpoint() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        AtomicInteger requestCount = new AtomicInteger();
        server.createContext("/users", exchange -> {
            requestCount.incrementAndGet();
            byte[] body = "[{\"id\":1}]".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            try (var responseBody = exchange.getResponseBody()) {
                responseBody.write(body);
            }
        });
        server.start();

        try {
            URI usersUri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/users");
            JsonPlaceholderPoller poller = new JsonPlaceholderPoller(usersUri);

            poller.pollUsers();

            assertEquals(1, requestCount.get());
        } finally {
            server.stop(0);
        }
    }
}
