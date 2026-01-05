-- Migration: Add personal info fields to people table
-- These fields store additional context for deeper analysis

ALTER TABLE people
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS family_zodiac TEXT,
ADD COLUMN IF NOT EXISTS current_business TEXT;

-- Add index for faster queries on user's self profile
CREATE INDEX IF NOT EXISTS idx_people_user_self ON people(created_by_user_id, is_user_self) WHERE is_user_self = true;

-- Create personal_analysis table to store n8n analysis results
CREATE TABLE IF NOT EXISTS personal_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  overall_structure TEXT,
  five_elements JSONB,
  energy_chart TEXT,
  major_luck_cycles JSONB,
  career_direction JSONB,
  risk_periods JSONB,
  future_5_years JSONB,
  future_10_years JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(person_id)
);

-- Create index for personal analysis
CREATE INDEX IF NOT EXISTS idx_personal_analysis_person_id ON personal_analysis(person_id);

COMMENT ON TABLE personal_analysis IS 'Stores detailed personal analysis results from n8n workflow';
COMMENT ON COLUMN people.additional_info IS 'Life events and milestones (e.g., "1992-1995 bullied, 1999-2000 study turning point")';
COMMENT ON COLUMN people.family_zodiac IS 'Family members zodiac animals (e.g., "father tiger, mother rabbit, wife ox")';
COMMENT ON COLUMN people.current_business IS 'Current business ventures (e.g., "drink retail, software service")';
