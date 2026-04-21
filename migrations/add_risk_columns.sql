-- Add Risk Flag to Resources table
-- (Using existing 'notes' column for risk reasons as per user request)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS risk_flag TEXT;

-- Optional: Update the Audit log or comments
COMMENT ON COLUMN resources.risk_flag IS 'Type of risk: Low performance, Resign risk, etc.';
COMMENT ON COLUMN resources.notes IS 'Used for general notes and risk reasons/mitigation plans';
