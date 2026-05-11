-- ============================================================
-- SURVEY RESPONSES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_email TEXT, -- NULL if anonymous
    answers JSONB NOT NULL, -- Stores { question_id: answer_value }
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically increment response_count in surveys table
CREATE OR REPLACE FUNCTION increment_survey_response_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surveys 
    SET response_count = response_count + 1 
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_survey_response_count ON survey_responses;
CREATE TRIGGER tr_increment_survey_response_count
AFTER INSERT ON survey_responses
FOR EACH ROW EXECUTE FUNCTION increment_survey_response_count();

-- RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert for responses" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select for responses" ON survey_responses FOR SELECT USING (true);
