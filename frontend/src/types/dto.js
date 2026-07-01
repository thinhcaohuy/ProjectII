/**
 * Data Transfer Objects (DTOs) copied from backend (com.recruitment.dto)
 * Synchronized: 2026-04-30
 * 
 * These are TypeScript-style interfaces representing the Java DTOs.
 * Use them to ensure type safety and consistency with backend.
 */

/**
 * AccountDTO - Base account information
 * extends from: Java public class AccountDTO
 */
export class AccountDTO {
    accountId = null;      // String
    email = null;          // String
    userType = null;       // UserType enum (EMPLOYER, CANDIDATE)

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * LoginResponse - Response after login/registration
 */
export class LoginResponse {
    id = null;             // String (accountId)
    message = null;        // String (LoginMessage)
    email = null;          // String
    userType = null;       // String (EMPLOYER, CANDIDATE)

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * LoginRequest - Request for login
 */
export class LoginRequest {
    email = null;          // String
    password = null;       // String

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * RegisterRequest - Base registration request (abstract in Java)
 */
export class RegisterRequest {
    email = null;          // String
    password = null;       // String
    userType = null;       // String (EMPLOYER, CANDIDATE)

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * CandidateRegisterRequest - extends RegisterRequest
 */
export class CandidateRegisterRequest extends RegisterRequest {
    fullName = null;       // String
    phoneNumber = null;    // String

    constructor(data = {}) {
        super(data);
        Object.assign(this, data);
    }
}

/**
 * EmployerRegisterRequest - extends RegisterRequest
 */
export class EmployerRegisterRequest extends RegisterRequest {
    companyName = null;    // String
    address = null;        // String
    companySize = null;    // Integer
    website = null;        // String
    description = null;    // String

    constructor(data = {}) {
        super(data);
        Object.assign(this, data);
    }
}

/**
 * CandidateDTO - extends AccountDTO
 */
export class CandidateDTO extends AccountDTO {
    fullName = null;       // String
    phoneNumber = null;    // String
    address = null;        // String
    avatarUrl = null;      // String
    jobSeekingStatus = null; // JobSeekingStatus enum

    constructor(data = {}) {
        super(data);
        Object.assign(this, data);
    }
}

/**
 * EmployerDTO - extends AccountDTO
 */
export class EmployerDTO extends AccountDTO {
    companyName = null;    // String
    address = null;        // String
    companySize = null;    // int
    website = null;        // String
    description = null;    // String

    constructor(data = {}) {
        super(data);
        Object.assign(this, data);
    }
}

/**
 * JobPostDTO - Job posting information
 */
export class JobPostDTO {
    jobPostId = null;      // String
    title = null;          // String
    industry = null;       // String
    description = null;    // String
    requiredSkills = null; // String
    salary = null;         // double
    location = null;       // String
    applicationDeadline = null; // LocalDateTime (ISO string)
    status = null;         // JobPostStatus enum (OPEN, CLOSED)
    employerId = null;     // String (for backend reference)

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * JobApplicationDTO - Job application information
 */
export class JobApplicationDTO {
    applicationId = null;  // String
    coverLetter = null;    // String
    appliedAt = null;      // LocalDateTime (ISO string)
    status = null;         // ApplicationStatus enum
    candidateId = null;    // String
    jobPostId = null;      // String

    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/**
 * Quick factory functions for common DTOs
 */
export const DTOFactory = {
    createLoginRequest: (email, password) =>
        new LoginRequest({ email, password }),

    createCandidateRegisterRequest: (email, password, fullName, phoneNumber) =>
        new CandidateRegisterRequest({ email, password, fullName, phoneNumber, userType: 'CANDIDATE' }),

    createEmployerRegisterRequest: (email, password, companyName, address, companySize, website, description) =>
        new EmployerRegisterRequest({
            email,
            password,
            companyName,
            address,
            companySize,
            website,
            description,
            userType: 'EMPLOYER'
        }),

    createJobPostDTO: (title, industry, description, requiredSkills, salary, location, applicationDeadline, employerId) =>
        new JobPostDTO({
            title,
            industry,
            description,
            requiredSkills,
            salary,
            location,
            applicationDeadline,
            employerId
        }),

    createJobApplicationDTO: (coverLetter, candidateId, jobPostId) =>
        new JobApplicationDTO({
            coverLetter,
            candidateId,
            jobPostId,
            status: 'SUBMITTED',
            appliedAt: new Date().toISOString()
        })
};

export default {
    AccountDTO,
    LoginResponse,
    LoginRequest,
    RegisterRequest,
    CandidateRegisterRequest,
    EmployerRegisterRequest,
    CandidateDTO,
    EmployerDTO,
    JobPostDTO,
    JobApplicationDTO,
    DTOFactory
};
