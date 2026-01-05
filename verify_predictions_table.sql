-- Verify if predictions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'predictions'
);

-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('monthly', 'yearly')),
  
  target_month TEXT,
  target_year TEXT,
  
  life_focus TEXT CHECK (life_focus IN ('family', 'team', 'friend', 'career', 'finance', 'health')),
  current_concern TEXT,
  
  language TEXT DEFAULT 'zh',
  
  result_data JSONB NOT NULL DEFAULT '{"status": "pending"}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_monthly_prediction UNIQUE (user_id, person_id, target_month, analysis_type),
  CONSTRAINT unique_yearly_prediction UNIQUE (user_id, person_id, target_year, analysis_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_person_id ON predictions(person_id);
CREATE INDEX IF NOT EXISTS idx_predictions_analysis_type ON predictions(analysis_type);
CREATE INDEX IF NOT EXISTS idx_predictions_target_month ON predictions(target_month);
CREATE INDEX IF NOT EXISTS idx_predictions_target_year ON predictions(target_year);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS predictions_updated_at ON predictions;
CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_predictions_updated_at();

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;
