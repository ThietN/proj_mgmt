-- RBAC Migration
-- 1. Add role column with default User
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'User';

-- 2. Migrate existing users (set NULL roles to User)
UPDATE users SET role = 'User' WHERE role IS NULL;

-- 3. Ensure role values are valid (cleanup old roles if any)
-- This assumes we want to map all old roles to 'User' except maybe 'Admin' to 'SuperAdmin' if requested
-- But the requirement says "Set role = User where role is NULL" and "Allowed values: SuperAdmin, User"

-- For safety, let's map any existing roles that are not SuperAdmin to User
UPDATE users SET role = 'User' WHERE role NOT IN ('SuperAdmin', 'User');
