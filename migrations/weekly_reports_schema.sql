-- Weekly Reports Table Schema
-- This table stores weekly snapshots of program updates

CREATE TABLE IF NOT EXISTS weekly_reports (
    id TEXT PRIMARY KEY, -- Format: WR_YYYY_WW (e.g., WR_2024_18)
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    resource_notes TEXT DEFAULT '',
    program_notes TEXT DEFAULT '',
    innovation_notes TEXT DEFAULT '',
    activities_notes TEXT DEFAULT '',
    hiring_notes TEXT DEFAULT '', -- New column for Hiring & Internships section
    other_notes TEXT DEFAULT '',
    effort_override NUMERIC, -- New column for custom effort display
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (for existing tables)
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS hiring_notes TEXT DEFAULT '';
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS effort_override NUMERIC;
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS activities_notes TEXT DEFAULT '';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_weekly_reports_year_week ON weekly_reports(year, week_number);
