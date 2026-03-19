-- ==============================================
-- APEX TRACKER - SQL SCHEMA
-- Enterprise Project & KPI Tracker
-- ==============================================

-- 1. Roles Definition
CREATE TYPE app_role AS ENUM ('ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE');

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name app_role NOT NULL UNIQUE
);

-- 2. Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept_head_id INT, -- References users.id (added via ALTER after users table)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    manager_id INT REFERENCES users(id) ON DELETE SET NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add FK for dept_head after users table exists
ALTER TABLE departments 
    ADD CONSTRAINT fk_dept_head 
    FOREIGN KEY (dept_head_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Projects
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD');

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    status project_status DEFAULT 'PLANNING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tasks
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE task_status AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    priority task_priority DEFAULT 'MEDIUM',
    status task_status DEFAULT 'BACKLOG',
    due_date DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. KPI Metrics
CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_month SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL,
    tasks_completed INT DEFAULT 0,
    on_time_percentage DECIMAL(5,2),
    manager_rating DECIMAL(3,2) CHECK (manager_rating BETWEEN 1.0 AND 5.0),
    UNIQUE (user_id, period_month, period_year)
);

-- ==============================================
-- INDEXES
-- ==============================================
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_kpis_user ON kpis(user_id);
CREATE INDEX idx_kpis_period ON kpis(period_year, period_month);

-- ==============================================
-- SEED DATA
-- ==============================================

-- Roles
INSERT INTO roles (name) VALUES ('ADMIN'), ('DEPT_HEAD'), ('MANAGER'), ('SUPERVISOR'), ('EMPLOYEE');

-- Departments (dept_head_id set later)
INSERT INTO departments (id, name) VALUES (1, 'Engineering'), (2, 'Marketing'), (3, 'Operations');

-- Users
INSERT INTO users (id, full_name, email, role_id, manager_id, department_id) VALUES
(1, 'Sarah Chen', 'sarah.admin@corp.com', 1, NULL, NULL),
(2, 'Marcus Wright', 'marcus.head@corp.com', 2, NULL, 1),
(3, 'Elena Rodriguez', 'elena.mgr@corp.com', 3, 2, 1),
(4, 'David Park', 'david.sup@corp.com', 4, 3, 1),
(5, 'Alex Rivera', 'alex.emp@corp.com', 5, 4, 1),
(6, 'Jessica Liu', 'jessica.head@corp.com', 2, NULL, 2),
(7, 'Tom Bradley', 'tom.mgr@corp.com', 3, 6, 2),
(8, 'Nina Patel', 'nina.sup@corp.com', 4, 7, 2),
(9, 'Carlos Mendez', 'carlos.emp@corp.com', 5, 8, 2),
(10, 'Robert Kim', 'robert.head@corp.com', 2, NULL, 3),
(11, 'Amanda Foster', 'amanda.mgr@corp.com', 3, 10, 3),
(12, 'James Wilson', 'james.sup@corp.com', 4, 11, 3),
(13, 'Priya Sharma', 'priya.emp@corp.com', 5, 12, 3),
(14, 'Mike Johnson', 'mike.emp@corp.com', 5, 4, 1),
(15, 'Lisa Wang', 'lisa.emp@corp.com', 5, 8, 2);

-- Set department heads
UPDATE departments SET dept_head_id = 2 WHERE id = 1;
UPDATE departments SET dept_head_id = 6 WHERE id = 2;
UPDATE departments SET dept_head_id = 10 WHERE id = 3;

-- Projects
INSERT INTO projects (id, name, department_id, status) VALUES
(1, 'Q4 API Refactor', 1, 'ACTIVE'),
(2, 'Mobile App v2', 1, 'PLANNING'),
(3, 'Brand Refresh 2024', 2, 'ACTIVE'),
(4, 'Social Media Campaign', 2, 'ACTIVE'),
(5, 'Supply Chain Optimization', 3, 'ACTIVE'),
(6, 'Warehouse Automation', 3, 'PLANNING'),
(7, 'CI/CD Pipeline', 1, 'COMPLETED'),
(8, 'Q1 Launch Event', 2, 'ON_HOLD');

-- Tasks
INSERT INTO tasks (project_id, title, description, assigned_to, created_by, priority, status, due_date, completed_at) VALUES
(1, 'Optimize Database Indices', 'Review and optimize slow queries', 5, 3, 'HIGH', 'IN_PROGRESS', '2024-11-30', NULL),
(1, 'API Rate Limiting', 'Implement rate limiting middleware', 14, 3, 'MEDIUM', 'TODO', '2024-12-05', NULL),
(1, 'Auth Token Refresh', 'Fix token refresh flow', 5, 4, 'URGENT', 'REVIEW', '2024-11-25', NULL),
(2, 'Wireframe Mobile Screens', 'Create wireframes for new flow', 14, 3, 'MEDIUM', 'DONE', '2024-11-20', '2024-11-18 10:00:00'),
(2, 'Setup React Native Project', 'Init project and configure build', 5, 3, 'HIGH', 'TODO', '2024-12-01', NULL),
(3, 'Design New Logo Variants', 'Create 3 logo concepts', 9, 7, 'HIGH', 'IN_PROGRESS', '2024-11-28', NULL),
(3, 'Brand Guidelines Document', 'Write comprehensive brand guide', 15, 7, 'MEDIUM', 'BACKLOG', '2024-12-15', NULL),
(4, 'Q4 Content Calendar', 'Plan social posts for Q4', 9, 8, 'HIGH', 'DONE', '2024-11-10', '2024-11-09 16:30:00'),
(4, 'Influencer Outreach', 'Contact top 20 influencers', 15, 7, 'MEDIUM', 'IN_PROGRESS', '2024-12-01', NULL),
(5, 'Vendor Audit', 'Audit top 10 vendor contracts', 13, 11, 'HIGH', 'IN_PROGRESS', '2024-11-30', NULL),
(5, 'Logistics Dashboard', 'Build real-time tracking dashboard', 13, 12, 'URGENT', 'TODO', '2024-12-10', NULL),
(6, 'RFP for Robotics', 'Draft RFP for automation vendors', 13, 11, 'LOW', 'BACKLOG', '2025-01-15', NULL),
(7, 'Setup GitHub Actions', 'Configure CI/CD pipeline', 5, 3, 'HIGH', 'DONE', '2024-10-15', '2024-10-14 09:00:00'),
(7, 'Docker Multi-stage Build', 'Optimize docker images', 14, 4, 'MEDIUM', 'DONE', '2024-10-20', '2024-10-19 14:00:00'),
(1, 'GraphQL Schema Migration', 'Migrate REST endpoints to GraphQL', 14, 3, 'LOW', 'BACKLOG', '2025-01-10', NULL);

-- KPIs
INSERT INTO kpis (user_id, period_month, period_year, tasks_completed, on_time_percentage, manager_rating) VALUES
(5, 10, 2024, 14, 92.50, 4.80),
(5, 9, 2024, 11, 85.00, 4.20),
(14, 10, 2024, 12, 88.00, 4.50),
(14, 9, 2024, 9, 78.00, 3.80),
(9, 10, 2024, 10, 95.00, 4.90),
(15, 10, 2024, 8, 62.50, 3.20),
(13, 10, 2024, 7, 71.00, 3.50),
(9, 9, 2024, 13, 91.00, 4.70),
(13, 9, 2024, 6, 66.00, 3.00),
(15, 9, 2024, 5, 55.00, 2.80);
