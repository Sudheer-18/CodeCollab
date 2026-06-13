package com.example.demo.services;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;

public class UserSeeervice {


    @autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        return  userRepository.save(user);
    }

}
