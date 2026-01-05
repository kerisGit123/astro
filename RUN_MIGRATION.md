# Run Database Migration

## Error
You're getting: `column "selected_topic" does not exist`

## Solution
Run this SQL migration to add the required columns:

```sql
-- Migration: Add topic selection and language preference fields
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
```

## How to Run

### Option 1: Using Neon Dashboard
1. Go to your Neon dashboard
2. Select your database
3. Open SQL Editor
4. Copy and paste the SQL above
5. Click "Run"

### Option 2: Using psql command line
```bash
psql "your_connection_string" -f migrations/005_add_topic_selection_fields.sql
```

### Option 3: Using any PostgreSQL client
Connect to your database and execute the SQL above.

## Verify
After running, verify with:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'people' 
AND column_name IN ('selected_topic', 'topic_prompt', 'analysis_language');
```

You should see 3 rows returned.
