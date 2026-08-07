-- File Locking & Version Control Schema Migration

-- 1. Managed Documents Table
CREATE TABLE IF NOT EXISTS managed_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('WEEKLY_REPORT', 'PROJECT_DOC', 'GENERAL')),
    project_id TEXT,
    content TEXT DEFAULT '',
    draft_content TEXT DEFAULT '',
    current_version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'EXPIRED', 'RELEASED')),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Exclusive Document Locks Table
CREATE TABLE IF NOT EXISTS document_locks (
    document_id TEXT PRIMARY KEY REFERENCES managed_documents(id) ON DELETE CASCADE,
    locked_by_user_id TEXT NOT NULL,
    locked_by_user_name TEXT NOT NULL,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 minutes'),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    lock_token TEXT NOT NULL
);

-- 3. Document Versions Table (Immutable Version Control Snapshots)
CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES managed_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT DEFAULT '',
    created_by_user_id TEXT NOT NULL,
    created_by_user_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

-- 4. Enhance Audit Log Columns
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_version INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_version INTEGER;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_document_locks_expires_at ON document_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON document_versions(document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_managed_documents_category ON managed_documents(category, updated_at DESC);
