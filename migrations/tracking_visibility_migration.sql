
-- Tracking Workspaces Visibility & Sharing Migration

-- 1. Add created_by and shared_with columns to tracking_workspaces
ALTER TABLE tracking_workspaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE tracking_workspaces ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}';

-- 2. Optional: Set existing workspaces to be owned by the first SuperAdmin or a default user
-- DO NOT run this automatically unless you know the default user ID
-- UPDATE tracking_workspaces SET created_by = (SELECT id FROM users WHERE role = 'SuperAdmin' LIMIT 1) WHERE created_by IS NULL;
