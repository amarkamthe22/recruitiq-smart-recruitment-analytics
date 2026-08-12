-- ============================================================
-- RecruitIQ - Database Schema
-- Database: recruitiq
-- ============================================================

CREATE DATABASE IF NOT EXISTS recruitiq;

USE recruitiq;

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Recruiter',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    auth_token VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY email (email)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- JOBS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    experience VARCHAR(50) DEFAULT NULL,
    skills TEXT,
    salary VARCHAR(50) DEFAULT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'Open',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    minimum_experience VARCHAR(50) DEFAULT '0',
    education VARCHAR(100) DEFAULT 'Any',
    minimum_ats_score INT DEFAULT '0',
    required_skills TEXT,

    PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CANDIDATES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS candidates (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    position VARCHAR(100) DEFAULT NULL,
    experience VARCHAR(50) DEFAULT NULL,
    education VARCHAR(100) DEFAULT NULL,
    skills TEXT,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    resume_text TEXT,
    ats_score INT NOT NULL DEFAULT '0',
    ats_label VARCHAR(30) DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    qualification VARCHAR(100) DEFAULT NULL,
    aptitude_score INT DEFAULT '0',
    interview_score INT DEFAULT '0',
    job_id INT DEFAULT NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- INTERVIEWS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS interviews (
    id INT NOT NULL AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT DEFAULT NULL,
    interview_date DATE DEFAULT NULL,
    interview_time TIME DEFAULT NULL,
    interviewer VARCHAR(100) DEFAULT NULL,
    interview_type VARCHAR(50) DEFAULT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    meeting_link TEXT,
    interview_score INT DEFAULT '0',
    notes TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;