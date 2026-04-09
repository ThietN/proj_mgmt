-- Attendance Records Table
CREATE TYPE attendance_status AS ENUM ('ON_TIME', 'LATE', 'NOT_ACCESS', 'INVALID');

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_name TEXT NOT NULL,
    username TEXT NOT NULL,
    badge_id TEXT,
    project TEXT,
    program TEXT,
    dc_name TEXT,
    bu_name TEXT,
    tracking_date DATE NOT NULL,
    check_in_time TEXT, -- Stored as text to handle "Not Access" and HH:mm
    status attendance_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_username ON attendance_records(username);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(tracking_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_project ON attendance_records(project);

-- Log table for uploads
CREATE TABLE IF NOT EXISTS attendance_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    rows_processed INTEGER NOT NULL,
    late_count INTEGER NOT NULL,
    not_access_count INTEGER NOT NULL,
    invalid_count INTEGER NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    upload_user TEXT NOT NULL,
    upload_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
