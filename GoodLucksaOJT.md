# Goodluck on your OJT, I hope you learned alot from me kahit short period of time lang, all you need to know about this project is setup and this file will teach you set up this project


# Project Tracker — Complete Setup & Security Guide

**For:** New team members / collaborators  
**Last updated:** March 2026

This guide walks you through setting up the Apex Tracker project from scratch: database, backend, frontend, and security features. Follow the steps in order.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Setup](#3-step-by-step-setup)
4. [How I Implemented Seed Data](#4-how-i-implemented-seed-data)
5. [Security Features & Best Practices](#5-security-features--best-practices)
6. [Demo Credentials](#6-demo-credentials)
7. [Verification Checklist](#7-verification-checklist)
8. [What to Do Next](#8-what-to-do-next)

---

## 1. Project Overview

**Apex Tracker** is an enterprise project and KPI tracker with:

- **Database** — PostgreSQL (Supabase) with UUID primary keys (non-guessable)
- **Backend** — Express + TypeScript API (JWT auth, rate limiting, in-memory caching)
- **Frontend** — Vite + React app (port 8080)
- **Supabase** — Auth for passwords + Edge Function for seeding

### Project Structure

```
Project_Tracker/
├── Database/           # SQL migrations (run in Supabase SQL Editor)
├── Backend/            # Express API (port 3000)
├── Frontend/           # Vite + React app (port 8080)
└── supabase/           # Edge Functions (seed-database)
```

---

## 2. Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and npm
- **Supabase account** — [supabase.com](https://supabase.com)
- **Supabase project** — Create one if you don’t have it
- **Supabase CLI** (optional, for deploying Edge Functions): `npm install -g supabase`

### Supabase Dashboard Access

You’ll need:

- **Database URL** (connection string) — Project Settings → Database → Connection string (URI, pooler)
- **Service Role Key** — Project Settings → API → `service_role` (keep this secret)
- **Anon Key** — Project Settings → API → `anon` (public, for frontend)

---

## 3. Step-by-Step Setup

### Step 1: Clone & Install Dependencies

```bash
# If not already cloned
cd Project_Tracker

# Install root scripts (optional)
npm install

# Install Backend
cd Backend && npm install && cd ..

# Install Frontend
cd Frontend && npm install && cd ..
```

---

### Step 2: Database Setup

1. Open your **Supabase project** → **SQL Editor**.

2. **Run migrations in order** (recommended: UUID schema for secure, non-guessable IDs):

   | Order | File | Purpose |
   |-------|------|---------|
   | 1 | `Database/migrations/003_uuid_schema.sql` | Creates tables with UUID primary keys |
   | 2 | `Database/migrations/004_seed_roles_uuid.sql` | Seeds roles (ADMIN, DEPT_HEAD, etc.) |

   **Important:** If you previously ran `001_initial_schema.sql` or `002_seed_roles.sql`, run `003_uuid_schema.sql` first—it drops old tables and migrates to UUID.

3. After running migrations, the roles table will have 5 roles. User data is seeded via the Edge Function (Step 5).

---

### Step 3: Backend Setup

1. Copy the env template and edit:

   ```bash
   cd Backend
   cp .env.example .env
   ```

2. Fill in **Backend `.env`**:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `DATABASE_URL` | Supabase PostgreSQL pooler connection string | `postgresql://postgres.PROJECT:PASSWORD@...pooler.supabase.com:5432/postgres` |
   | `JWT_ACCESS_SECRET` | Min 32 chars, for access tokens | `a7f3c9e2b1d84f6a0e5c8b3d7a2f9e1c4b6a8d0f2e5c7b9a1d3f6e8c0b2a4d7` |
   | `JWT_REFRESH_SECRET` | Min 32 chars, different from access | `k2m9p4x7q1w5e8r0t3y6u9i2o5a8s1d4f7g0j3l6z9c2v5b8n1m4x7q0w3e6r` |
   | `SUPABASE_URL` | Your Supabase project URL | `https://YOUR_PROJECT.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase | From Dashboard → API |
   | `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:8080` |

3. Start the backend:

   ```bash
   npm run dev
   ```

   Backend runs on **http://localhost:3000**.

4. Verify: `curl http://localhost:3000/api/v1/health` → `{"ok":true,...}`

---

### Step 4: Frontend Setup

1. Copy the env template and edit:

   ```bash
   cd Frontend
   cp .env.example .env
   ```

2. Fill in **Frontend `.env`**:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |
   | `VITE_SUPABASE_URL` | Supabase project URL | `https://YOUR_PROJECT.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Anon key from Supabase | From Dashboard → API |

3. Start the frontend:

   ```bash
   npm run dev
   ```

   Frontend runs on **http://localhost:8080**.

---

### Step 5: Seed the Database

1. Deploy the Edge Function (one-time):

   ```bash
   supabase functions deploy seed-database --no-verify-jwt --project-ref YOUR_PROJECT_REF
   ```

2. Set Edge Function secrets (Dashboard → Project Settings → Edge Functions, or via CLI):

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (PostgreSQL connection string)

3. Seed the database:

   - Open **http://localhost:8080**
   - Click **Seed Database** on the Login page  
   - Or: `curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-database -H "Authorization: Bearer YOUR_ANON_KEY"`

4. Seed creates users in `auth.users` and inserts departments, projects, tasks, and KPIs.

---

### Step 6: Run Everything

From the project root:

```bash
# Terminal 1 – Backend
npm run dev:backend

# Terminal 2 – Frontend
npm run dev
```

Open **http://localhost:8080** and log in with demo credentials (see below).

---

## 4. How I Implemented Seed Data

The seed data is implemented as a **Supabase Edge Function** (`supabase/functions/seed-database/index.ts`) that runs on Deno. It uses **direct PostgreSQL** because the Supabase Data API (PostgREST) is disabled for this project.

### Architecture

1. **Edge Function** — Deno-based serverless function, deployed to Supabase.
2. **Direct PostgreSQL** — Uses `postgres` (postgres.js) to connect to the database. No Supabase JS client for database writes.
3. **Supabase Auth Admin** — Uses `@supabase/supabase-js` with service role key to create users in `auth.users` (where passwords are stored).
4. **Idempotent** — Can be run multiple times; skips existing users/departments/projects/tasks/KPIs.

### Seed Flow (in order)

| Step | What it does |
|------|--------------|
| 1 | Ensure roles exist. If empty, inserts ADMIN, DEPT_HEAD, MANAGER, SUPERVISOR, EMPLOYEE with UUIDs. |
| 2 | Insert departments (Engineering, Marketing, Operations) if empty. |
| 3 | For each mock user: create in `auth.users` via `supabase.auth.admin.createUser`, then insert into `public.users` with `auth_user_id`, `role_id`, `department_id`, `manager_id`. Handles "already registered" by looking up existing auth user. |
| 4 | Update department heads (dept_head_id) for each department. |
| 5 | Insert projects (linked to departments). |
| 6 | Insert tasks (linked to projects, assigned/created by users via email lookup). |
| 7 | Insert KPIs (linked to users by email). |

### Key design decisions

- **Passwords only in `auth.users`** — Never stored in `public.users`. Supabase Auth handles hashing.
- **UUID IDs** — All primary keys use `gen_random_uuid()` for non-guessable IDs.
- **Relationships by email** — Mock data references users by email (e.g. `managerEmail`, `assignedEmail`); we resolve to IDs at seed time.
- **`verify_jwt = false`** — Seed function is configured to allow calls without authentication (for the "Seed Database" button).

### Invoking the seed

- **From Login page** — Click "Seed Database"; frontend calls the Edge Function with the anon key.
- **Via curl** — `curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-database -H "Authorization: Bearer YOUR_ANON_KEY"`

---

## 5. Security Features & Best Practices

### Basic Security Features of the Application

| Feature | Implementation |
|---------|----------------|
| **JWT storage** | Access token in memory only; refresh token in HttpOnly cookie |
| **No client token storage** | No localStorage/sessionStorage for tokens |
| **UUID primary keys** | Non-guessable IDs (no sequential 1, 2, 3…) |
| **Passwords** | Stored only in Supabase `auth.users`, never in `public.users` |
| **CORS** | Restricted to `FRONTEND_URL` with `credentials: true` |
| **Helmet** | Security headers (XSS, clickjacking, etc.) |
| **Rate limiting** | In-memory, per-IP (configurable) |
| **Cookie attributes** | `httpOnly`, `sameSite` (Strict in prod, Lax in dev), `secure` in production |

### Auth Flow (Best Practice)

1. **Login** → `POST /api/v1/auth/login` with email/password.
2. Backend validates via Supabase Auth, returns access token in JSON, sets refresh token in HttpOnly cookie.
3. **Session restore** → On page load, `POST /api/v1/auth/refresh` with `credentials: 'include'` restores session.
4. **Logout** → `POST /api/v1/auth/logout` clears the refresh cookie.

### Security Best Practices Applied

- **Short-lived access tokens** (~15 min) — Limits exposure if leaked.
- **Longer-lived refresh tokens** (~7 days) — Stored in HttpOnly cookie, not accessible to JavaScript.
- **SameSite cookies** — Reduces CSRF risk.
- **CORS with explicit origin** — Only allows requests from the known frontend.
- **JWT secrets** — Minimum 32 characters; kept in environment variables.

---

## 6. Demo Credentials

After seeding:

| Email | Password | Role |
|-------|----------|------|
| sarah.admin@corp.com | admin123! | Admin |
| marcus.head@corp.com | tempPassword123! | Dept Head |
| elena.mgr@corp.com | tempPassword123! | Manager |
| david.sup@corp.com | tempPassword123! | Supervisor |
| alex.emp@corp.com | tempPassword123! | Employee |

---

## 7. Verification Checklist

Before handing off or going to production:

- [ ] Backend `curl http://localhost:3000/api/v1/health` returns OK
- [ ] Frontend loads at http://localhost:8080
- [ ] Login succeeds with `sarah.admin@corp.com` / `admin123!`
- [ ] Role displays as **ADMIN** in sidebar (not UNKNOWN)
- [ ] Dashboard shows seeded data (departments, projects, tasks)
- [ ] Logout works and returns to Login page
- [ ] Refresh token cookie is HttpOnly (check DevTools → Application → Cookies)
- [ ] No tokens in localStorage or sessionStorage

---

## 8. What to Do Next

### Immediate

1. Replace demo credentials in `.env.example` with placeholder values (no real keys).
2. Rotate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and Supabase keys if they were ever committed.
3. Add `.env` to `.gitignore` if not already.

### Short-Term

1. **Wire real data to the API** — Replace DataContext mock data with Backend API calls (departments, projects, tasks, users, KPIs).
2. **Protected routes** — Use `requireAuth` and `requireRole` middleware for role-based endpoints.
3. **Error handling** — Add global error boundary in the frontend and consistent API error shapes.
4. **Tests** — Add unit tests for auth flow and integration tests for critical endpoints.

### Medium-Term

1. **Production env** — Set `NODE_ENV=production`, use `FRONTEND_URL` to match your deployed frontend, ensure HTTPS.
2. **Refresh token rotation** — Consider rotating the refresh token on each use.
3. **Audit logging** — Log auth events (login, logout, failures) for security audits.
4. **API documentation** — Add OpenAPI/Swagger for the Backend.

### Long-Term

1. **Redis** — Replace in-memory rate limiting and caching with Redis for multi-instance deployments.
2. **Monitoring** — Add APM, error tracking, and health checks.
3. **CI/CD** — Automate tests, linting, and deployments.

---

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:8080 | 8080 |
| Backend | http://localhost:3000 | 3000 |
| Supabase Dashboard | https://supabase.com/dashboard | — |

| Endpoint | Method | Auth |
|----------|--------|------|
| /api/v1/health | GET | No |
| /api/v1/auth/login | POST | No |
| /api/v1/auth/refresh | POST | Cookie |
| /api/v1/auth/logout | POST | No |
| /api/v1/roles | GET | Bearer token |

---


.env backend
# Backend Environment
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Supabase PostgreSQL (pooler)
DATABASE_URL=postgresql://postgres.gprlkjsbxqpawcqpssgx:9AUxm2djiOIFnVUo@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
# JWT
JWT_ACCESS_SECRET=a7f3c9e2b1d84f6a0e5c8b3d7a2f9e1c4b6a8d0f2e5c7b9a1d3f6e8c0b2a4d7
JWT_REFRESH_SECRET=k2m9p4x7q1w5e8r0t3y6u9i2o5a8s1d4f7g0j3l6z9c2v5b8n1m4x7q0w3e6r
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - frontend origin (must match Vite dev server for local dev)
FRONTEND_URL=http://localhost:8080

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Supabase (Auth + Edge Function)
SUPABASE_URL=https://gprlkjsbxqpawcqpssgx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcmxranNieHFwYXdjcXBzc2d4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE1NDA2NSwiZXhwIjoyMDg5NzMwMDY1fQ.o0nbb0HFie8RmXVUCSYnVbSUfkbnncd61JiwLiv4vX4

#Frontend .ENV
.env frontend
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://gprlkjsbxqpawcqpssgx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcmxranNieHFwYXdjcXBzc2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTQwNjUsImV4cCI6MjA4OTczMDA2NX0.hpwpeBVsNXeS0wjKLDnlfE59o_kcLFdlF9zE1y51ZbU



