-- SQL script to delete user shangwey@yahoo.com
-- Run this in your PostgreSQL database

-- First, find the user ID
SELECT id, email, first_name, last_name FROM users WHERE email = 'shangwey123@gmail.com';

-- Delete related records (uncomment and run after confirming the user ID)
-- DELETE FROM credits_ledger WHERE company_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com');
-- DELETE FROM credits_balance WHERE company_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com');
-- DELETE FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com');
-- DELETE FROM predictions WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com');
-- DELETE FROM compatibility_analyses WHERE person_a_id IN (SELECT id FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com')) OR person_b_id IN (SELECT id FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey@yahoo.com'));
-- DELETE FROM users WHERE email = 'shangwey@yahoo.com';

-- Or delete everything in one transaction:
BEGIN;
DELETE FROM credits_ledger WHERE company_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com');
DELETE FROM credits_balance WHERE company_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com');
DELETE FROM compatibility_analyses WHERE person_a_id IN (SELECT id FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com')) OR person_b_id IN (SELECT id FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com'));
DELETE FROM predictions WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com');
DELETE FROM people WHERE user_id = (SELECT id FROM users WHERE email = 'shangwey123@gmail.com');
DELETE FROM users WHERE email = 'shangwey123@gmail.com';
COMMIT;
