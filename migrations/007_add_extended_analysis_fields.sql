-- Migration: Add extended analysis fields for 20-year predictions and timing opportunities
-- These fields provide longer-term forecasts and specific timing windows

ALTER TABLE personal_analysis
ADD COLUMN IF NOT EXISTS future_20 JSONB,
ADD COLUMN IF NOT EXISTS chance_prediction JSONB,
ADD COLUMN IF NOT EXISTS risk_prediction JSONB,
ADD COLUMN IF NOT EXISTS timing_opportunities JSONB;

COMMENT ON COLUMN personal_analysis.future_20 IS 'Future 20 years predictions (wealth, career, relationship, health)';
COMMENT ON COLUMN personal_analysis.chance_prediction IS 'Upcoming opportunity predictions with timing and focus areas';
COMMENT ON COLUMN personal_analysis.risk_prediction IS 'Upcoming risk predictions with timing and mitigation strategies';
COMMENT ON COLUMN personal_analysis.timing_opportunities IS 'Detailed timing windows for opportunities and risks with element influences';
