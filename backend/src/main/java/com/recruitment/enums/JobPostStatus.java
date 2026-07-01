package com.recruitment.enums;

public enum JobPostStatus {
    OPEN("Open"),
    CLOSED("Closed");

    private final String displayName;

    JobPostStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}