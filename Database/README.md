# Database Migrations

## Option A: UUID schema (recommended – non-guessable IDs)

1. `003_uuid_schema.sql` – Drops old tables, creates schema with UUID primary keys
2. `004_seed_roles_uuid.sql` – Seeds roles
3. Run the `seed-database` Edge Function to populate all data

## Option B: Legacy integer IDs

1. `001_initial_schema.sql` – Creates tables with SERIAL IDs
2. `002_seed_roles.sql` – Seeds roles
3. Run the `seed-database` Edge Function

**Note:** 003/004 replace 001/002. Use one set or the other. If you already ran 001/002, run 003 to migrate to UUID (this drops all data).
