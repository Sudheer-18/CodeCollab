package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class JsonPlaceholderPoller {
    private static final Logger logger = LoggerFactory.getLogger(JsonPlaceholderPoller.class);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final URI usersUri;

    public JsonPlaceholderPoller(
            @Value("${jsonplaceholder.users-url:https://jsonplaceholder.typicode.com/users}") URI usersUri) {
        this.usersUri = usersUri;
    }

    @Scheduled(fixedDelayString = "${jsonplaceholder.poll-interval-ms:30000}")
    public void pollUsers() {
        HttpRequest request = HttpRequest.newBuilder(usersUri)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.error("User API request failed with HTTP status {}", response.statusCode());
                return;
            }

            JsonNode users = objectMapper.readTree(response.body());
            if (!users.isArray()) {
                logger.error("User API response was not a JSON array");
                return;
            }

            logger.info("Fetched {} users from {}", users.size(), usersUri);
        } catch (IOException e) {
            logger.error("Failed to fetch users from {}", usersUri, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("User API request was interrupted", e);
        }
    }
}
