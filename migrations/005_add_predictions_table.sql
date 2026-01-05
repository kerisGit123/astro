-- Migration: Add predictions table for monthly and yearly predictions
-- This table stores personal predictions (monthly/yearly) for individual users

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  
  -- Analysis type: 'monthly' or 'yearly'
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('monthly', 'yearly')),
  
  -- Time period
  target_month TEXT, -- Format: 'YYYY-MM' for monthly predictions
  target_year TEXT,  -- Format: 'YYYY' for yearly predictions
  
  -- Optional focus areas
  life_focus TEXT CHECK (life_focus IN ('family', 'team', 'friend', 'career', 'finance', 'health')),
  current_concern TEXT,
  
  -- Language for analysis
  language TEXT DEFAULT 'zh',
  
  -- Prediction results (JSONB for flexibility)
  result_data JSONB NOT NULL DEFAULT '{"status": "pending"}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT unique_monthly_prediction UNIQUE (user_id, person_id, target_month, analysis_type),
  CONSTRAINT unique_yearly_prediction UNIQUE (user_id, person_id, target_year, analysis_type)
);

-- Create indexes for faster queries
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_person_id ON predictions(person_id);
CREATE INDEX idx_predictions_analysis_type ON predictions(analysis_type);
CREATE INDEX idx_predictions_target_month ON predictions(target_month);
CREATE INDEX idx_predictions_target_year ON predictions(target_year);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_predictions_updated_at();

-- Comments for documentation
COMMENT ON TABLE predictions IS 'Stores monthly and yearly predictions for individual users';
COMMENT ON COLUMN predictions.analysis_type IS 'Type of prediction: monthly or yearly';
COMMENT ON COLUMN predictions.target_month IS 'Target month in YYYY-MM format for monthly predictions';
COMMENT ON COLUMN predictions.target_year IS 'Target year in YYYY format for yearly predictions';
COMMENT ON COLUMN predictions.life_focus IS 'Optional focus area: family, team, friend, career, finance, health';
COMMENT ON COLUMN predictions.result_data IS 'JSONB containing prediction results from n8n';
