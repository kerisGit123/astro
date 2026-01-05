-- Manually set your user to Starter plan
-- Replace user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a with your actual Clerk user ID if different

INSERT INTO subscriptions (user_id, plan_name, status, created_at, updated_at)
VALUES ('user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a', 'starter', 'active', NOW(), NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  plan_name = 'starter',
  status = 'active',
  updated_at = NOW();
