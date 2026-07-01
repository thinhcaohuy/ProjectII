package com.recruitment.enums;

public enum SkillLevel {
    BEGINNER(1),
    ELEMENTARY(2),
    INTERMEDIATE(3),
    ADVANCED(4),
    EXPERT(5);

    private final int value;

    SkillLevel(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static SkillLevel fromValue(int value) {
        for (SkillLevel level : SkillLevel.values()) {
            if (level.value == value) {
                return level;
            }
        }
        throw new IllegalArgumentException("Invalid skill level: " + value);
    }
}