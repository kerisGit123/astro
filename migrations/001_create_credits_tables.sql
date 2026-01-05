-- Transaction ledger (immutable audit log)
CREATE TABLE IF NOT EXISTS credits_ledger (
  id SERIAL PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL,
  tokens INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  amount_paid INTEGER,
  currency VARCHAR(10),
  reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ledger_company_id ON credits_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_ledger_payment_intent ON credits_ledger(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_ledger_checkout_session ON credits_ledger(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON credits_ledger(created_at DESC);

-- Current balance (denormalized for fast reads)
CREATE TABLE IF NOT EXISTS credits_balance (
  id SERIAL PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_balance_company_id ON credits_balance(company_id);

-- Add comments for documentation
COMMENT ON TABLE credits_ledger IS 'Complete transaction history - never delete records';
COMMENT ON TABLE credits_balance IS 'Current credit balance per company - single row per company';
COMMENT ON COLUMN credits_ledger.tokens IS 'Positive = purchase, Negative = usage';
COMMENT ON COLUMN credits_ledger.amount_paid IS 'Amount in cents (smallest currency unit)';

-- Additional optimized indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ledger_company_created ON credits_ledger(company_id, created_at DESC);
