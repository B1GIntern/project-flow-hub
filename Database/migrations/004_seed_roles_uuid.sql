-- Seed roles (UUID schema)
INSERT INTO roles (id, name) VALUES
  (gen_random_uuid(), 'ADMIN'),
  (gen_random_uuid(), 'DEPT_HEAD'),
  (gen_random_uuid(), 'MANAGER'),
  (gen_random_uuid(), 'SUPERVISOR'),
  (gen_random_uuid(), 'EMPLOYEE')
ON CONFLICT (name) DO NOTHING;
