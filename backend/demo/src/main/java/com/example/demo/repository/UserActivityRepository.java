package com.example.demo.repository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@Repository
public class UserActivityRepository {
    private final MongoTemplate mongoTemplate;

    public UserActivityRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public void recordRoomCreated(String userId, String roomId) {
        Update update = new Update().inc("roomsCreated", 1).push("createdRooms", roomId);
        mongoTemplate.upsert(userQuery(userId), update, "users");
    }

    public void recordRoomJoined(String userId, Object roomId, boolean alreadyJoined) {
        Update update = new Update().inc("roomsJoined", alreadyJoined ? 0 : 1).push("joinedRooms", roomId);
        mongoTemplate.upsert(userQuery(userId), update, "users");
    }

    private Query userQuery(String userId) {
        return new Query(Criteria.where("_id").is(userId));
    }
}
