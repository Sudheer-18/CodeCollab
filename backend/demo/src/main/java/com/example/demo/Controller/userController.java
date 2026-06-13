package com.example.demo.Controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Model.User;
import com.example.demo.services.UserSeeervice;
import com.example.demo.services.autowired;

@RestController
@RequestMapping("/users")
public class userController {

    @autowired
    private UserSeeervice userService;
    @PostMapping
    public User saveUser(@RequestBody User user) {  
        return userService.saveUser(user);
    }
    
}
