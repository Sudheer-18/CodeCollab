package com.example.demo.services;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserSeeervice {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User login(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password);
    }
}
