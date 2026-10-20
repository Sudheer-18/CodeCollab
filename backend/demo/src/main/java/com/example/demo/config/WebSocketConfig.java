package com.example.demo.config;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.example.demo.services.JwtService;
import com.example.demo.services.UserSeeervice;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserSeeervice userService;
    private final MongoTemplate mongoTemplate;
    private final String allowedOrigins;

    public WebSocketConfig(JwtService jwtService, UserSeeervice userService, MongoTemplate mongoTemplate,
                           @Value("${app.websocket.allowed-origins:http://localhost:5173}") String allowedOrigins) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.mongoTemplate = mongoTemplate;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toArray(String[]::new);
        registry.addEndpoint("/ws").setAllowedOriginPatterns(origins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authorization = accessor.getFirstNativeHeader("Authorization");
                    if (authorization == null || !authorization.startsWith("Bearer ")) {
                        throw new IllegalArgumentException("A bearer token is required");
                    }

                    String userId = jwtService.getUserId(authorization.substring(7).trim());
                    if (userId == null || userService.findById(userId) == null) {
                        throw new IllegalArgumentException("The bearer token is invalid or expired");
                    }

                    Principal principal = () -> userId;
                    accessor.setUser(principal);
                } else if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    Principal principal = accessor.getUser();
                    String roomId = roomIdFromDestination(accessor.getDestination());
                    if (principal == null || roomId == null || !isRoomMember(roomId, principal.getName())) {
                        throw new IllegalArgumentException("You are not a participant in this room");
                    }
                }
                return message;
            }
        });
    }

    private String roomIdFromDestination(String destination) {
        if (destination == null || !destination.startsWith("/topic/rooms/")) {
            return null;
        }
        String[] parts = destination.split("/");
        return parts.length >= 5 ? parts[3] : null;
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