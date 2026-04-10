
-- Intern Management Migration

-- Drop existing tables if they interfere (be careful in production, but here we are evolving)
-- DROP TABLE IF EXISTS interns CASCADE;
-- DROP TABLE IF EXISTS intern_evaluations CASCADE;
-- DROP TABLE IF EXISTS intern_status_history CASCADE;
-- DROP TABLE IF EXISTS billable_resources CASCADE;

-- 1. Interns Table
CREATE TABLE IF NOT EXISTS interns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    project TEXT,
    mentor TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Scheduled', -- Scheduled, Interview, Joined, In Progress, Completed
    completed_date DATE,
    is_billable BOOLEAN DEFAULT FALSE,
    billable_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Evaluation Table (BAP Assessment)
CREATE TABLE IF NOT EXISTS intern_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    technical_score INTEGER CHECK (technical_score >= 1 AND technical_score <= 10),
    technical_note TEXT,
    soft_skill_score INTEGER CHECK (soft_skill_score >= 1 AND soft_skill_score <= 10),
    soft_skill_note TEXT,
    attitude_score INTEGER CHECK (attitude_score >= 1 AND attitude_score <= 10),
    attitude_note TEXT,
    english_score INTEGER CHECK (english_score >= 1 AND english_score <= 10),
    final_grade TEXT, -- Excellent, Good, Fair, Average, Poor
    evaluated_by TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(intern_id)
);

-- 3. Status History Table (Audit History)
CREATE TABLE IF NOT EXISTS intern_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT,
    changed_by TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Billable Resources Table
CREATE TABLE IF NOT EXISTS billable_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    project TEXT,
    billing_rate NUMERIC,
    start_billable_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to handle status history
CREATE OR REPLACE FUNCTION handle_intern_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO intern_status_history (intern_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status history
CREATE TRIGGER tr_intern_status_history
AFTER UPDATE ON interns
FOR EACH ROW
EXECUTE FUNCTION handle_intern_status_change();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_interns_updated_at
BEFORE UPDATE ON interns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
