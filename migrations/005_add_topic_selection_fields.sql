-- Migration: Add topic selection and language preference fields
-- These fields store user's analysis preferences from onboarding

ALTER TABLE people
ADD COLUMN IF NOT EXISTS selected_topic TEXT,
ADD COLUMN IF NOT EXISTS topic_prompt TEXT,
ADD COLUMN IF NOT EXISTS analysis_language TEXT DEFAULT 'en';

-- Add check constraint for valid topics
ALTER TABLE people
ADD CONSTRAINT check_selected_topic 
CHECK (selected_topic IS NULL OR selected_topic IN ('career', 'marriage', 'health', 'education', 'general'));

-- Add check constraint for valid languages
ALTER TABLE people
ADD CONSTRAINT check_analysis_language 
CHECK (analysis_language IN ('en', 'zh', 'ms', 'ja'));

COMMENT ON COLUMN people.selected_topic IS 'User selected analysis topic (career, marriage, health, education, general)';
COMMENT ON COLUMN people.topic_prompt IS 'Localized prompt text for the selected topic';
COMMENT ON COLUMN people.analysis_language IS 'Preferred language for analysis (en, zh, ms, ja)';
