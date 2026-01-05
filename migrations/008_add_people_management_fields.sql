-- Add active/inactive status and team/worker category to people table

-- Add is_active column (default to true for existing records)
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add category column for organizing people (friend, partner, business, team, worker, etc.)
ALTER TABLE people ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'friend';

-- Add notes column for additional context
ALTER TABLE people ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster filtering by active status
CREATE INDEX IF NOT EXISTS idx_people_is_active ON people(is_active);

-- Create index for filtering by category
CREATE INDEX IF NOT EXISTS idx_people_category ON people(category);

-- Create index for filtering by user and active status
CREATE INDEX IF NOT EXISTS idx_people_user_active ON people(user_id, is_active);

-- Add comment
COMMENT ON COLUMN people.is_active IS 'Whether this person is currently active in the user''s network';
COMMENT ON COLUMN people.category IS 'Category: friend, partner, business, team, worker, family, etc.';
COMMENT ON COLUMN people.notes IS 'Additional notes about this person';
