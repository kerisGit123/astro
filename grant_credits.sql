-- SQL script to grant 30 initial credits to a user
-- Run this in your PostgreSQL database

-- First, check current balance
SELECT u.id, u.email, cb.balance 
FROM users u 
LEFT JOIN credits_balance cb ON u.id = cb.company_id 
WHERE u.email = 'shangwey123@gmail.com';

-- Grant 30 credits if balance is 0 or missing
BEGIN;

-- Add ledger entry
INSERT INTO credits_ledger (company_id, tokens, reason)
SELECT id, 30, 'manual_initial_grant'
FROM users 
WHERE email = 'shangwey123@gmail.com';

-- Update or create balance
INSERT INTO credits_balance (company_id, balance, updated_at)
SELECT id, 30, NOW()
FROM users 
WHERE email = 'shangwey123@gmail.com'
ON CONFLICT (company_id) 
DO UPDATE SET 
  balance = credits_balance.balance + 30,
  updated_at = NOW();

COMMIT;

-- Verify the new balance
SELECT u.id, u.email, cb.balance 
FROM users u 
LEFT JOIN credits_balance cb ON u.id = cb.company_id 
WHERE u.email = 'shangwey123@gmail.com';
