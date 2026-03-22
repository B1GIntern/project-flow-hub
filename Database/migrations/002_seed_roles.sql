-- Seed static roles (other data seeded via Edge Function)
INSERT INTO roles (name) VALUES ('ADMIN'), ('DEPT_HEAD'), ('MANAGER'), ('SUPERVISOR'), ('EMPLOYEE')
ON CONFLICT DO NOTHING;
