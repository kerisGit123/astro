-- Update personal_analysis table to match n8n output structure
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS overall_structure;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS five_elements;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS energy_chart;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS major_luck_cycles;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS career_direction;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS risk_periods;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS future_5_years;
ALTER TABLE personal_analysis DROP COLUMN IF EXISTS future_10_years;

-- Add new columns matching n8n output
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS overall_structure TEXT;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS five_elements JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS energy_chart TEXT;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS major_luck_cycles JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS career_direction JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS risk_periods JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS future_5 JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS future_10 JSONB;
ALTER TABLE personal_analysis ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';

COMMENT ON COLUMN personal_analysis.overall_structure IS 'Overall life structure analysis text';
COMMENT ON COLUMN personal_analysis.five_elements IS '5 Element balance: {wood, fire, earth, metal, water}';
COMMENT ON COLUMN personal_analysis.energy_chart IS 'Energy distribution chart text';
COMMENT ON COLUMN personal_analysis.major_luck_cycles IS 'Array of luck cycles with ageRange, luckType, keyEvents';
COMMENT ON COLUMN personal_analysis.career_direction IS 'Suitable and unsuitable careers';
COMMENT ON COLUMN personal_analysis.risk_periods IS 'Major, secondary risk periods and risk types';
COMMENT ON COLUMN personal_analysis.future_5 IS 'Future 5 years predictions (wealth, career, relationship, health)';
COMMENT ON COLUMN personal_analysis.future_10 IS 'Future 10 years predictions (wealth, career, relationship, health)';
COMMENT ON COLUMN personal_analysis.language IS 'Language of the analysis: zh, en, ms';
