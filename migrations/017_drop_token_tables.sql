-- Migration: Drop token-related tables
-- The application now uses the credit system exclusively
-- Token tables are no longer needed

-- Drop token_transactions table
DROP TABLE IF EXISTS token_transactions CASCADE;

-- Drop token_packages table
DROP TABLE IF EXISTS token_packages CASCADE;

-- Drop user_tokens table
DROP TABLE IF EXISTS user_tokens CASCADE;

-- Add comment for documentation
COMMENT ON DATABASE CURRENT_DATABASE() IS 'Token tables removed - application uses credit system (credits_balance and credits_ledger tables)';
