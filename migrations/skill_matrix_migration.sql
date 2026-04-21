
-- Skill Matrix Migration

-- 1. Skill Definitions (Columns)
CREATE TABLE IF NOT EXISTS skill_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Skill Matrix (Cell Data)
CREATE TABLE IF NOT EXISTS skill_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL, -- Logical link to resources table (employee_id column)
    skill_id UUID REFERENCES skill_definitions(id) ON DELETE CASCADE,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, skill_id)
);

-- Note: We use TEXT for employee_id instead of a hard FK 
-- if the resources table might have string IDs (e.g. EMP001).
-- If resources table uses UUID, change to UUID and add REFERENCES.
