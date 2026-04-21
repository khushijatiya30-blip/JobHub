-- ============================================================
-- Student Skill Tracking & Placement System — Database Schema
-- ============================================================
-- Run this in MySQL Workbench or CLI before starting the app
-- The app also auto-creates tables via spring.jpa.hibernate.ddl-auto=update

CREATE DATABASE IF NOT EXISTS placement_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE placement_db;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('STUDENT','COMPANY','ADMIN') NOT NULL,
    enabled    TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Students ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE,
    name              VARCHAR(100) NOT NULL,
    phone             VARCHAR(15),
    branch            VARCHAR(100),
    college           VARCHAR(200),
    graduation_year   INT,
    cgpa              DECIMAL(4,2),
    resume_path       VARCHAR(500),
    profile_photo     VARCHAR(500),
    address           TEXT,
    linkedin_url      VARCHAR(255),
    github_url        VARCHAR(255),
    placement_status  ENUM('NOT_PLACED','APPLIED','SHORTLISTED','PLACED') DEFAULT 'NOT_PLACED',
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Skills ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(100),
    description TEXT
);

-- ── Student ↔ Skills (many-to-many) ───────────────────────
CREATE TABLE IF NOT EXISTS student_skills (
    student_id BIGINT NOT NULL,
    skill_id   BIGINT NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id)   REFERENCES skills(id)   ON DELETE CASCADE
);

-- ── Companies ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE,
    company_name      VARCHAR(200) NOT NULL,
    gst_number        VARCHAR(15)  NOT NULL UNIQUE,
    cin_number        VARCHAR(21),
    certificate_path  VARCHAR(500),
    industry          VARCHAR(100),
    website           VARCHAR(255),
    phone             VARCHAR(15),
    address           TEXT,
    current_address   TEXT,
    city              VARCHAR(100),
    state             VARCHAR(100),
    logo_path         VARCHAR(500),
    description       TEXT,
    approval_status   ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    rejection_reason  TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Jobs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id     BIGINT NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    location       VARCHAR(200),
    job_type       VARCHAR(50),
    work_mode      VARCHAR(50),
    salary_min     DECIMAL(12,2),
    salary_max     DECIMAL(12,2),
    min_cgpa       DECIMAL(4,2),
    min_experience INT DEFAULT 0,
    deadline       DATE,
    openings       INT DEFAULT 1,
    status         ENUM('ACTIVE','CLOSED','DRAFT') DEFAULT 'ACTIVE',
    posted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ── Job ↔ Required Skills (many-to-many) ──────────────────
CREATE TABLE IF NOT EXISTS job_required_skills (
    job_id   BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id)   REFERENCES jobs(id)   ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ── Applications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id       BIGINT NOT NULL,
    job_id           BIGINT NOT NULL,
    status           ENUM('APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEWED','SELECTED','REJECTED')
                     DEFAULT 'APPLIED',
    match_score      DECIMAL(5,2),
    cover_letter     TEXT,
    company_feedback TEXT,
    applied_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id)     REFERENCES jobs(id)     ON DELETE CASCADE
);

-- ── Sample Data ────────────────────────────────────────────

-- Admin user (password: admin123)
INSERT IGNORE INTO users (email, password, role) VALUES
('admin@placement.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'ADMIN');

-- Sample skills
INSERT IGNORE INTO skills (name, category) VALUES
('Java','Programming Language'),('Python','Programming Language'),
('JavaScript','Programming Language'),('React','Framework'),
('Spring Boot','Framework'),('MySQL','Database'),('MongoDB','Database'),
('AWS','Cloud'),('Docker','DevOps'),('Git','DevOps'),
('Machine Learning','Data Science'),('HTML/CSS','Web Development'),
('Node.js','Framework'),('TypeScript','Programming Language'),
('REST APIs','Web Development');

-- ── Useful Queries ─────────────────────────────────────────

-- Top skill demand
-- SELECT s.name, COUNT(ss.student_id) as demand
-- FROM skills s LEFT JOIN student_skills ss ON s.id = ss.skill_id
-- GROUP BY s.name ORDER BY demand DESC LIMIT 10;

-- Placement rate
-- SELECT
--   COUNT(*) as total,
--   SUM(placement_status = 'PLACED') as placed,
--   ROUND(SUM(placement_status = 'PLACED') * 100.0 / COUNT(*), 1) as rate_pct
-- FROM students;
