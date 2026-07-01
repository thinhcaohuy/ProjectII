package com.recruitment.enums;

public enum ApplicationStatus {
    SUBMITTED("Submitted"),
    IN_PROGRESS("In Progress"),
    REJECTED("Rejected"),
    ACCEPTED("Accepted");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}