-- ============================================
-- SQL Queries for Finding Correct User IDs
-- ============================================
-- This file contains helpful SQL queries for debugging and finding
-- correct user IDs and record IDs for compatibility analyses and predictions

-- ============================================
-- COMPATIBILITY ANALYSES QUERIES
-- ============================================

-- Step 1: Find which user owns these people
SELECT 
    p.id as person_id,
    p.name as person_name,
    p.created_by_user_id as user_id
FROM people p
WHERE p.id IN (
    '1716e5d0-285f-40bd-bf98-bb09d746a2d6',  -- tang shang wey
    'fc9ec249-b485-445c-a7c9-24ec0e8aad84'   -- ng lee peng
);

-- Step 2: Find compatibility analyses for these people
SELECT 
    ca.id as compatibility_id,
    ca.user_id,
    ca.person_a_id,
    ca.person_b_id,
    ca.analysis_type,
    ca.created_at,
    pa.name as person_a_name,
    pb.name as person_b_name
FROM compatibility_analyses ca
LEFT JOIN people pa ON ca.person_a_id = pa.id
LEFT JOIN people pb ON ca.person_b_id = pb.id
WHERE 
    (ca.person_a_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6' 
     AND ca.person_b_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84')
    OR
    (ca.person_a_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84' 
     AND ca.person_b_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6')
ORDER BY ca.created_at DESC
LIMIT 5;

-- Step 3: Find the most recent pending compatibility analysis
SELECT 
    ca.id as compatibility_id,
    ca.user_id,
    ca.person_a_id,
    ca.person_b_id,
    ca.result_data->>'status' as status,
    ca.created_at
FROM compatibility_analyses ca
WHERE 
    (ca.person_a_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6' 
     AND ca.person_b_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84')
    OR
    (ca.person_a_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84' 
     AND ca.person_b_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6')
ORDER BY ca.created_at DESC
LIMIT 1;

-- ============================================
-- PREDICTION QUERIES
-- ============================================

-- Find all predictions for a specific person
SELECT 
    pr.id as prediction_id,
    pr.user_id,
    pr.person_id,
    pr.analysis_type,
    pr.target_month,
    pr.target_year,
    pr.life_focus,
    pr.result_data->>'status' as status,
    pr.created_at,
    p.name as person_name
FROM predictions pr
JOIN people p ON pr.person_id = p.id
WHERE pr.person_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6'
ORDER BY pr.created_at DESC
LIMIT 10;

-- Find all monthly predictions for a user
SELECT 
    pr.id as prediction_id,
    pr.person_id,
    pr.target_month,
    pr.life_focus,
    pr.result_data->>'status' as status,
    pr.created_at,
    p.name as person_name
FROM predictions pr
JOIN people p ON pr.person_id = p.id
WHERE pr.user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'
  AND pr.analysis_type = 'monthly'
ORDER BY pr.target_month DESC, pr.created_at DESC;

-- Find all yearly predictions for a user
SELECT 
    pr.id as prediction_id,
    pr.person_id,
    pr.target_year,
    pr.life_focus,
    pr.result_data->>'status' as status,
    pr.created_at,
    p.name as person_name
FROM predictions pr
JOIN people p ON pr.person_id = p.id
WHERE pr.user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'
  AND pr.analysis_type = 'yearly'
ORDER BY pr.target_year DESC, pr.created_at DESC;

-- Find pending predictions (waiting for n8n callback)
SELECT 
    pr.id as prediction_id,
    pr.user_id,
    pr.person_id,
    pr.analysis_type,
    pr.target_month,
    pr.target_year,
    pr.created_at,
    p.name as person_name
FROM predictions pr
JOIN people p ON pr.person_id = p.id
WHERE pr.result_data->>'status' = 'pending'
ORDER BY pr.created_at DESC;

-- Find a specific prediction by month and person
SELECT 
    pr.id as prediction_id,
    pr.user_id,
    pr.person_id,
    pr.target_month,
    pr.result_data->>'status' as status,
    pr.created_at
FROM predictions pr
WHERE pr.person_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6'
  AND pr.target_month = '2026-01'
  AND pr.analysis_type = 'monthly'
ORDER BY pr.created_at DESC
LIMIT 1;

-- ============================================
-- GENERAL UTILITY QUERIES
-- ============================================

-- List all people for a user
SELECT 
    id,
    name,
    birth_date,
    gender,
    created_at
FROM people
WHERE created_by_user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'
ORDER BY created_at DESC;

-- Count analyses by type
SELECT 
    analysis_type,
    COUNT(*) as count,
    COUNT(CASE WHEN result_data->>'status' = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN result_data->>'status' = 'completed' THEN 1 END) as completed_count
FROM compatibility_analyses
WHERE user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'
GROUP BY analysis_type;

-- Count predictions by type
SELECT 
    analysis_type,
    COUNT(*) as count,
    COUNT(CASE WHEN result_data->>'status' = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN result_data->>'status' = 'completed' THEN 1 END) as completed_count
FROM predictions
WHERE user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'
GROUP BY analysis_type;
