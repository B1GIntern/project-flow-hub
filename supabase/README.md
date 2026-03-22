# Supabase Edge Functions

## seed-database

Seeds the database with mock users (auth.users + public.users), departments, projects, tasks, and KPIs.

### Prerequisites

- Run `Database/migrations/001_initial_schema.sql` and `002_seed_roles.sql` against your Supabase project first.
- Supabase CLI: `npm install -g supabase`

### Deploy

Authentication is disabled for this function (see config.toml) so you can seed without credentials:

```bash
supabase functions deploy seed-database --project-ref gprlkjsbxqpawcqpssgx
```

Or with explicit flag: `supabase functions deploy seed-database --no-verify-jwt --project-ref gprlkjsbxqpawcqpssgx`

Set secrets (Dashboard → Project Settings → Edge Functions, or CLI):

```bash
supabase secrets set SUPABASE_URL=https://gprlkjsbxqpawcqpssgx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set DATABASE_URL=postgresql://postgres.gprlkjsbxqpawcqpssgx:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Important:** `DATABASE_URL` is required because the Data API (PostgREST) is disabled. The function uses direct PostgreSQL instead.

### Invoke

From the frontend Login page, click "Seed Database". Or via curl:

```bash
curl -X POST https://gprlkjsbxqpawcqpssgx.supabase.co/functions/v1/seed-database \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```
