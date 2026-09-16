-- Wiki Pages Migration
-- Single wiki page per project (MVP: one global page)

CREATE TABLE IF NOT EXISTS wiki_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Project Notes',
    content TEXT NOT NULL DEFAULT '',
    project_id TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_by_user_id TEXT,
    locked_by_user_name TEXT,
    locked_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for project scoping (future use)
CREATE INDEX IF NOT EXISTS idx_wiki_pages_project_id ON wiki_pages(project_id);
