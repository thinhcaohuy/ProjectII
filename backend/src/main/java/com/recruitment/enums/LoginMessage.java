package com.recruitment.enums;

public enum LoginMessage {

    SUCCESS("Login successful"),

    WRONG_PASSWORD("Wrong password"),

    ACCOUNT_NOT_FOUND("Account does not exist"),

    EMAIL_ALREADY_EXISTS("Email already exists"),

    ACCOUNT_LOCKED("Account is locked"),

    INVALID_REQUEST("Invalid request");

    private final String message;

    LoginMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}