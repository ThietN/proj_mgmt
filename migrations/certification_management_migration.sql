-- Certification Catalog Table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    provider TEXT,
    category TEXT CHECK (category IN ('TECHNICAL', 'TESTING', 'CLOUD', 'SECURITY', 'AI', 'DEVOPS', 'MANAGEMENT', 'SOFT_SKILL')),
    level TEXT CHECK (level IN ('FOUNDATION', 'ASSOCIATE', 'PROFESSIONAL', 'EXPERT')),
    certificate_type TEXT CHECK (certificate_type IN ('INTERNAL', 'EXTERNAL')),
    validity_period_months INTEGER,
    cost DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    exam_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID -- Assuming FK to users.id if needed
);

-- Member Certifications Table
CREATE TABLE IF NOT EXISTS member_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT REFERENCES resources(employee_id),
    certification_id UUID REFERENCES certifications(id),
    status TEXT CHECK (status IN ('PLANNED', 'LEARNING', 'SCHEDULED', 'PASSED', 'FAILED', 'EXPIRED')),
    progress_percent INTEGER DEFAULT 0,
    start_date DATE,
    target_exam_date DATE,
    actual_exam_date DATE,
    expiry_date DATE,
    attempt_count INTEGER DEFAULT 0,
    score DECIMAL(10, 2),
    certificate_number TEXT,
    certificate_file TEXT,
    study_provider TEXT,
    learning_method TEXT CHECK (learning_method IN ('SELF_STUDY', 'COURSE', 'BOOTCAMP', 'MENTORING')),
    priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    manager_note TEXT,
    member_note TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    sponsor TEXT,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_member_certs_member_id ON member_certifications(member_id);
CREATE INDEX IF NOT EXISTS idx_member_certs_cert_id ON member_certifications(certification_id);
CREATE INDEX IF NOT EXISTS idx_member_certs_status ON member_certifications(status);

-- Seed some sample certifications
INSERT INTO certifications (name, code, provider, category, level, certificate_type, validity_period_months, cost, description)
VALUES 
('AWS Certified Solutions Architect – Associate', 'AWS-SAA', 'AWS', 'CLOUD', 'ASSOCIATE', 'EXTERNAL', 36, 150.00, 'The AWS Certified Solutions Architect - Associate examination is intended for individuals who perform a solutions architect role and have one or more years of hands-on experience designing available, cost-efficient, fault-tolerant, and scalable distributed systems on AWS.'),
('ISTQB Certified Tester Foundation Level', 'ISTQB-CTFL', 'ISTQB', 'TESTING', 'FOUNDATION', 'EXTERNAL', 0, 250.00, 'The Foundation Level qualification is aimed at professionals who need to demonstrate practical knowledge of the fundamental concepts of software testing.'),
('Certified Information Systems Security Professional', 'CISSP', 'ISC2', 'SECURITY', 'EXPERT', 'EXTERNAL', 36, 749.00, 'The CISSP is the most globally recognized certification in the information security market.'),
('Professional Scrum Master I', 'PSM-I', 'Scrum.org', 'MANAGEMENT', 'ASSOCIATE', 'EXTERNAL', 0, 150.00, 'PSM I highlights your skill in using the Scrum framework.');
