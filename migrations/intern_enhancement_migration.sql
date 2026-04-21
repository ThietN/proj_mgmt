
-- Intern Pipeline Enhancement Migration

-- 1. Add university, GPA, and english_score to interns table
ALTER TABLE interns ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS gpa NUMERIC;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS english_score INTEGER;
