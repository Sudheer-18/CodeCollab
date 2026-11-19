package com.example.demo.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.Model.User;

public interface UserRepository extends MongoRepository<User,String> {
    User findByEmail(String email);
    User findByEmailAndPassword(String email, String password);
}
