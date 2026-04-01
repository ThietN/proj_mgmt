-- ============================================================
-- ESAT Platform Migration
-- Run this in your Supabase SQL Editor
-- NOTE: Drop old tables first if you already ran an earlier version
-- ============================================================
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS org_events CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;

-- ============================================================
-- 1. POLLS TABLE
-- ============================================================
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Closed')),
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    audience TEXT NOT NULL DEFAULT 'All' CHECK (audience IN ('All', 'Department', 'Team', 'Role')),
    audience_value TEXT,
    deadline DATE,
    created_by TEXT NOT NULL,
    total_votes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON polls
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. SURVEYS TABLE
-- ============================================================
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Active', 'Closed')),
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    audience TEXT NOT NULL DEFAULT 'All' CHECK (audience IN ('All', 'Department', 'Team', 'Role')),
    audience_value TEXT,
    start_date DATE,
    end_date DATE,
    created_by TEXT NOT NULL,
    response_count INTEGER NOT NULL DEFAULT 0,
    participation_rate NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON surveys
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. ORG_EVENTS TABLE
-- ============================================================
CREATE TABLE org_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    meeting_link TEXT,
    organizer TEXT NOT NULL DEFAULT '',
    capacity INTEGER,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
    rsvp_count INTEGER NOT NULL DEFAULT 0,
    attended_count INTEGER,
    feedback_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE org_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON org_events
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. FEEDBACK TABLE
-- ============================================================
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Workplace', 'Management', 'Tools', 'Culture', 'Benefits', 'Other')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Review', 'Resolved', 'Closed')),
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    submitted_by TEXT,
    assigned_to TEXT,
    admin_response TEXT,
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON feedback
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER polls_updated_at
    BEFORE UPDATE ON polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER org_events_updated_at
    BEFORE UPDATE ON org_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. SEED DATA (optional — comment out if not needed)
-- ============================================================

-- Sample active poll
INSERT INTO polls (title, question, options, status, is_anonymous, created_by, total_votes)
VALUES (
    'Remote Work Preference',
    'How many days per week do you prefer to work remotely?',
    '[
        {"id": "opt1", "label": "Full Remote (5 days)", "votes": 12},
        {"id": "opt2", "label": "Hybrid (3-4 days)", "votes": 25},
        {"id": "opt3", "label": "Hybrid (1-2 days)", "votes": 8},
        {"id": "opt4", "label": "Fully On-site", "votes": 3}
    ]'::jsonb,
    'Active',
    true,
    'admin@company.com',
    48
);

-- Sample survey
INSERT INTO surveys (title, description, questions, status, is_anonymous, created_by, response_count)
VALUES (
    'Q2 2025 Employee Engagement Survey',
    'Help us understand your experience and satisfaction at work.',
    '[
        {"id": "q1", "order_index": 0, "type": "rating", "question": "How satisfied are you with your current role?", "required": true},
        {"id": "q2", "order_index": 1, "type": "nps", "question": "How likely are you to recommend this company as a great place to work?", "required": true},
        {"id": "q3", "order_index": 2, "type": "multiple_choice", "question": "What is your biggest challenge at work?", "required": false, "options": ["Workload", "Communication", "Tools & Tech", "Career Growth", "Work-Life Balance"]}
    ]'::jsonb,
    'Active',
    true,
    'admin@company.com',
    34
);

-- Sample upcoming event
INSERT INTO org_events (title, description, event_date, location, organizer, capacity, status, feedback_enabled)
VALUES (
    'Q2 2025 Town Hall',
    'Quarterly all-hands meeting to discuss company updates, goals, and recognition.',
    NOW() + INTERVAL '7 days',
    'Main Conference Room + Online',
    'HR Team',
    150,
    'Upcoming',
    true
);

-- Sample feedback
INSERT INTO feedback (title, message, category, priority, status, is_anonymous)
VALUES (
    'Better ergonomic equipment needed',
    'Many team members are experiencing back pain due to inadequate chairs and monitors. We need height-adjustable desks and ergonomic chairs.',
    'Workplace',
    'High',
    'In Review',
    true
);
