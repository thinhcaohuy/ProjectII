-- Create Database
DROP DATABASE IF EXISTS recruitment_db;
CREATE DATABASE recruitment_db;
USE recruitment_db;

-- ========================================
-- Base Account Table (JOINED Inheritance)
-- ========================================
CREATE TABLE account (
    account_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    dtype VARCHAR(31),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Employer Table
-- ========================================
CREATE TABLE employer (
    account_id VARCHAR(36) PRIMARY KEY,
    company_name VARCHAR(255),
    address VARCHAR(255),
    company_size INT,
    website VARCHAR(255),
    description LONGTEXT,
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    INDEX idx_company_name (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Candidate Table
-- ========================================
CREATE TABLE candidate (
    account_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    address VARCHAR(255),
    avatar_url LONGTEXT,
    job_seeking_status VARCHAR(50),
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
    INDEX idx_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Experience Table
-- ========================================
CREATE TABLE experience (
    experience_id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    job_description LONGTEXT,
    duration VARCHAR(255) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Education Table
-- ========================================
CREATE TABLE education (
    education_id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    graduation_year INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Skill Table
-- ========================================
CREATE TABLE skill (
    skill_id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    proficiency_level INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Project Table
-- ========================================
CREATE TABLE project (
    project_id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    technologies VARCHAR(255) NOT NULL,
    demo_link VARCHAR(255),
    FOREIGN KEY (account_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Supplementary Document Table
-- ========================================
CREATE TABLE supplementary_document (
    document_id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    drive_link VARCHAR(255) NOT NULL,
    description LONGTEXT,
    FOREIGN KEY (account_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Job Post Table
-- ========================================
CREATE TABLE job_post (
    job_post_id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    description LONGTEXT,
    required_skills LONGTEXT,
    salary DOUBLE NOT NULL,
    location VARCHAR(255) NOT NULL,
    posted_at DATETIME NOT NULL,
    application_deadline DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    FOREIGN KEY (employer_id) REFERENCES employer(account_id) ON DELETE CASCADE,
    INDEX idx_employer_id (employer_id),
    INDEX idx_status (status),
    INDEX idx_industry (industry),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Application Table (Job Applications)
-- ========================================
CREATE TABLE application (
    candidate_id VARCHAR(36) NOT NULL,
    job_post_id VARCHAR(36) NOT NULL,
    cover_letter LONGTEXT,
    applied_at DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    updated_at DATETIME,
    PRIMARY KEY (candidate_id, job_post_id),
    FOREIGN KEY (candidate_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    FOREIGN KEY (job_post_id) REFERENCES job_post(job_post_id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_job_post_id (job_post_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Report Table
-- ========================================
CREATE TABLE report (
    report_id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) NOT NULL,
    report_type VARCHAR(255) NOT NULL,
    generated_at DATETIME NOT NULL,
    file_format VARCHAR(255) NOT NULL,
    summary_data LONGTEXT,
    file_path VARCHAR(255),
    FOREIGN KEY (employer_id) REFERENCES employer(account_id) ON DELETE CASCADE,
    INDEX idx_employer_id (employer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Assessment Table
-- ========================================
CREATE TABLE assessment (
    assessment_id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    passing_score DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    rules LONGTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (employer_id) REFERENCES employer(account_id) ON DELETE CASCADE,
    INDEX idx_employer_id (employer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Assessment Question Table
-- ========================================
CREATE TABLE assessment_question (
    question_id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(36) NOT NULL,
    question_text LONGTEXT NOT NULL,
    correct_option_index INT NOT NULL,
    score_weight DOUBLE NOT NULL DEFAULT 1.0,
    order_index INT NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessment(assessment_id) ON DELETE CASCADE,
    INDEX idx_assessment_id (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Assessment Option Table
-- ========================================
CREATE TABLE assessment_option (
    option_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    option_text LONGTEXT NOT NULL,
    option_index INT NOT NULL,
    PRIMARY KEY (option_id, question_id),
    FOREIGN KEY (question_id) REFERENCES assessment_question(question_id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Assessment Assignment Table
-- ========================================
CREATE TABLE assessment_assignment (
    assessment_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    score DOUBLE,
    feedback LONGTEXT,
    PRIMARY KEY (assessment_id, candidate_id),
    FOREIGN KEY (candidate_id) REFERENCES candidate(account_id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessment(assessment_id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_assessment_id (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Assessment Attempt Table
-- ========================================
CREATE TABLE assessment_attempt (
    assessment_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    attempt_id VARCHAR(36) NOT NULL,
    attempt_number INT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    score DOUBLE,
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    PRIMARY KEY (assessment_id, candidate_id, attempt_id),
    FOREIGN KEY (assessment_id, candidate_id) REFERENCES assessment_assignment(assessment_id, candidate_id) ON DELETE CASCADE,
    INDEX idx_assignment (assessment_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Candidate Answer Table
-- ========================================
CREATE TABLE candidate_answer (
    candidate_answer_id VARCHAR(36) NOT NULL,
    assessment_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    attempt_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_index INT NOT NULL,
    PRIMARY KEY (candidate_answer_id, assessment_id, candidate_id, attempt_id, question_id),
    FOREIGN KEY (assessment_id, candidate_id, attempt_id) REFERENCES assessment_attempt(assessment_id, candidate_id, attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES assessment_question(question_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Sample Data for Testing
-- ========================================
INSERT INTO account (account_id, email, password, user_type, status, created_at, dtype)
VALUES 
('emp-001', 'employer@test.com', '{noop}password123', 'EMPLOYER', 'ACTIVE', NOW(), 'Employer'),
('cand-001', 'candidate@test.com', '{noop}password123', 'CANDIDATE', 'ACTIVE', NOW(), 'Candidate');

INSERT INTO employer (account_id, company_name, address, company_size, website, description)
VALUES ('emp-001', 'Tech Company', 'Hà Nội', 500, 'https://techcompany.com', 'Leading technology company');

INSERT INTO candidate (account_id, full_name, phone_number, address, avatar_url, job_seeking_status)
VALUES ('cand-001', 'Nguyễn Văn A', '0123456789', 'Hà Nội', 'https://avatar.url', 'SEEKING_JOB');

INSERT INTO job_post (job_post_id, employer_id, title, industry, description, required_skills, salary, location, posted_at, application_deadline, status)
VALUES 
('job-001', 'emp-001', 'Senior Java Developer', 'Information Technology', 'Looking for a Java developer with 5+ years of experience', 'Java, Spring Boot, SQL', 30000000, 'Hà Nội', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'OPEN');
