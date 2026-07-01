/**
 * Enums copied from backend (com.recruitment.enums)
 * Synchronized: 2026-04-30
 */

// UserType.java
export const UserType = {
    EMPLOYER: "EMPLOYER",
    CANDIDATE: "CANDIDATE",
    
    getDisplayName(value) {
        const names = {
            EMPLOYER: "Employer",
            CANDIDATE: "Candidate"
        };
        return names[value] || value;
    }
};

// AccountStatus.java
export const AccountStatus = {
    ACTIVE: "ACTIVE",
    LOCKED: "LOCKED",
    UNVERIFIED: "UNVERIFIED",
    
    getDisplayName(value) {
        const names = {
            ACTIVE: "Active",
            LOCKED: "Locked",
            UNVERIFIED: "Unverified"
        };
        return names[value] || value;
    }
};

// LoginMessage.java
export const LoginMessage = {
    SUCCESS: "Login successful",
    WRONG_PASSWORD: "Wrong password",
    ACCOUNT_NOT_FOUND: "Account does not exist",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    ACCOUNT_LOCKED: "Account is locked",
    INVALID_REQUEST: "Invalid request",
    
    getMessage(key) {
        const messages = {
            SUCCESS: "Login successful",
            WRONG_PASSWORD: "Wrong password",
            ACCOUNT_NOT_FOUND: "Account does not exist",
            EMAIL_ALREADY_EXISTS: "Email already exists",
            ACCOUNT_LOCKED: "Account is locked",
            INVALID_REQUEST: "Invalid request"
        };
        return messages[key] || key;
    }
};

// ApplicationStatus.java
export const ApplicationStatus = {
    SUBMITTED: "SUBMITTED",
    IN_PROGRESS: "IN_PROGRESS",
    REJECTED: "REJECTED",
    ACCEPTED: "ACCEPTED",
    
    getDisplayName(value) {
        const names = {
            SUBMITTED: "Submitted",
            IN_PROGRESS: "In Progress",
            REJECTED: "Rejected",
            ACCEPTED: "Accepted"
        };
        return names[value] || value;
    }
};

// JobPostStatus.java
export const JobPostStatus = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    
    getDisplayName(value) {
        const names = {
            OPEN: "Open",
            CLOSED: "Closed"
        };
        return names[value] || value;
    }
};

// JobSeekingStatus.java
export const JobSeekingStatus = {
    SEEKING_JOB: "SEEKING_JOB",
    EMPLOYED: "EMPLOYED",
    PAUSED: "PAUSED",
    
    getDisplayName(value) {
        const names = {
            SEEKING_JOB: "Seeking Job",
            EMPLOYED: "Employed",
            PAUSED: "Paused"
        };
        return names[value] || value;
    }
};

// SkillLevel.java
export const SkillLevel = {
    BEGINNER: "BEGINNER",
    ELEMENTARY: "ELEMENTARY",
    INTERMEDIATE: "INTERMEDIATE",
    ADVANCED: "ADVANCED",
    EXPERT: "EXPERT",
    
    getDisplayName(value) {
        const names = {
            BEGINNER: "Beginner",
            ELEMENTARY: "Elementary",
            INTERMEDIATE: "Intermediate",
            ADVANCED: "Advanced",
            EXPERT: "Expert"
        };
        return names[value] || value;
    }
};

export default {
    UserType,
    AccountStatus,
    LoginMessage,
    ApplicationStatus,
    JobPostStatus,
    JobSeekingStatus,
    SkillLevel
};
