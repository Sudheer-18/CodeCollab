package com.example.demo.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@Repository
public class RoomRepository {
    private static final String COLLECTION = "rooms";
    private final MongoTemplate mongoTemplate;

    public RoomRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Map<String, Object> findByRoomId(String roomId) {
        return findOne(new Query(Criteria.where("roomId").is(roomId)));
    }

    public Map<String, Object> findByRoomCode(String roomCode) {
        return findOne(new Query(Criteria.where("roomCode").is(roomCode)));
    }

    public List<Map<String, Object>> findPublicRooms() {
        return findAll(new Query(Criteria.where("visibility").is("public")));
    }

    public List<Map<String, Object>> findCreatedBy(String userId) {
        return findAll(new Query(Criteria.where("createdBy").is(userId)));
    }

    public List<Map<String, Object>> findJoinedBy(String userId) {
        return findAll(new Query(Criteria.where("participants.userId").is(userId)));
    }

    public List<Map<String, Object>> findAllRooms() {
        return findAll(new Query());
    }

    public void insert(Map<String, Object> room) {
        mongoTemplate.insert(room, COLLECTION);
    }

    public void updateByRoomCode(String roomCode, Update update) {
        mongoTemplate.upsert(new Query(Criteria.where("roomCode").is(roomCode)), update, COLLECTION);
    }

    public void updateByRoomId(String roomId, Update update) {
        mongoTemplate.upsert(new Query(Criteria.where("roomId").is(roomId)), update, COLLECTION);
    }

    private Map<String, Object> findOne(Query query) {
        Map<?, ?> document = mongoTemplate.findOne(query, Map.class, COLLECTION);
        return document == null ? null : copy(document);
    }

    private List<Map<String, Object>> findAll(Query query) {
        List<Map> documents = mongoTemplate.find(query, Map.class, COLLECTION);
        List<Map<String, Object>> result = new ArrayList<>(documents.size());
        for (Map<?, ?> document : documents) {
            result.add(copy(document));
        }
        return result;
    }

    private Map<String, Object> copy(Map<?, ?> document) {
        Map<String, Object> result = new LinkedHashMap<>();
        document.forEach((key, value) -> result.put(String.valueOf(key), value));
        return result;
    }
}
