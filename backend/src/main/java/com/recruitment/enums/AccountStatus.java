package com.recruitment.enums;

public enum AccountStatus {
    ACTIVE("Active"),
    LOCKED("Locked"),
    UNVERIFIED("Unverified");

    private final String displayName;

    AccountStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}