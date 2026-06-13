package com.example.demo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
public class User {

    @Id
    private String Gmail;
    private String Password;
    private String id;

    public User () {}

    public User(String Gmail , String Password) {
        this.Gmail = Gmail;
        this.Password = Password;
    }

    public String getGmail() {
        return Gmail;
    }

    public String getPassword() {
        return Password;
    }
    public String getId() {
        return id;
    }
    public void setGmail(String Gmail) {
        this.Gmail = Gmail;
    }

    public void setPassword(String Password) {
        this.Password = Password;
    }





}
