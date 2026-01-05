-- Find the actual prediction UUID for a specific person and month
-- Replace the values below with your actual data

-- For MONTHLY prediction:
SELECT 
    id as prediction_id,
    user_id,
    person_id,
    analysis_type,
    target_month,
    result_data->>'status' as status,
    created_at
FROM predictions
WHERE person_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84'
  AND target_month = '2026-01'
  AND analysis_type = 'monthly'
ORDER BY created_at DESC
LIMIT 1;

-- For YEARLY prediction:
SELECT 
    id as prediction_id,
    user_id,
    person_id,
    analysis_type,
    target_year,
    result_data->>'status' as status,
    created_at
FROM predictions
WHERE person_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84'
  AND target_year = '2026'
  AND analysis_type = 'yearly'
ORDER BY created_at DESC
LIMIT 1;

-- List all predictions for this person
SELECT 
    id as prediction_id,
    analysis_type,
    target_month,
    target_year,
    result_data->>'status' as status,
    created_at
FROM predictions
WHERE person_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84'
ORDER BY created_at DESC;
