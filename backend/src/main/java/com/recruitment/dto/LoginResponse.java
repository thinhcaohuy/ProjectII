package com.recruitment.dto;

public class LoginResponse {

    private String id;
    private String message;
    private String email;
    private String userType;

    public LoginResponse() {}

    public LoginResponse(String id, String message, String email, String userType) {
        this.id = id;
        this.message = message;
        this.email = email;
        this.userType = userType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}