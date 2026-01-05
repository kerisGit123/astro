-- Migration: Add 'wczodiac' to predictions analysis_type constraint
-- This allows Western & Chinese Zodiac Analysis to be stored in predictions table

-- Drop the existing constraint
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_analysis_type_check;

-- Add new constraint with 'wczodiac' included
ALTER TABLE predictions 
ADD CONSTRAINT predictions_analysis_type_check 
CHECK (analysis_type IN ('monthly', 'yearly', 'wczodiac'));

-- Add comment for documentation
COMMENT ON COLUMN predictions.analysis_type IS 'Type of analysis: monthly, yearly, or wczodiac (Western & Chinese Zodiac)';
