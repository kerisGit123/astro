-- Migration: Add selected topic and question fields to personal_analysis table
-- These fields store the user's topic selection and custom question from re-analysis

ALTER TABLE personal_analysis
ADD COLUMN IF NOT EXISTS selected_topic TEXT,
ADD COLUMN IF NOT EXISTS question TEXT;

COMMENT ON COLUMN personal_analysis.selected_topic IS 'Analysis focus from n8n (e.g., marriage, career, health analysis)';
COMMENT ON COLUMN personal_analysis.question IS 'Custom question or prompt from user for focused analysis';
