-- ==============================================
-- APEX TRACKER - Initial Schema
-- Uses auth.users for passwords; public.users extends auth identity
-- ==============================================

-- 1. Roles
CREATE TYPE app_role AS ENUM ('ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE');

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name app_role NOT NULL UNIQUE
);

-- 2. Departments (dept_head_id added via ALTER after users table)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept_head_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users - references auth.users for password/identity
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    manager_id INT REFERENCES users(id) ON DELETE SET NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    avatar VARCHAR(255) NULL,
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

-- 6. KPIs
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

-- Indexes
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_auth ON users(auth_user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_kpis_user ON kpis(user_id);
CREATE INDEX idx_kpis_period ON kpis(period_year, period_month);
