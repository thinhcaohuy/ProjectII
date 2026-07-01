package com.recruitment.enums;

public enum JobSeekingStatus {
    SEEKING_JOB("Seeking Job"),
    EMPLOYED("Employed"),
    PAUSED("Paused");

    private final String displayName;

    JobSeekingStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}