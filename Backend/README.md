# Project Tracker Backend

Express + TypeScript API with JWT auth, rate limiting, and in-memory caching.

## Setup

1. Copy `.env.example` to `.env` and fill in values:
   - `DATABASE_URL`: Supabase PostgreSQL connection string (pooler)
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Min 32 chars each
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: From Supabase Dashboard → Settings → API

2. Run database migrations (see `../Database/README.md`)

3. Install and run:

```bash
npm install
npm run dev
```

## API

- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/login` - Login (email, password) → JWT
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/roles` - List roles (requires JWT)
