-- Create subscription transactions table to track billing history
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'myr',
  status VARCHAR(50) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscription_transactions_user_id ON subscription_transactions(user_id);
CREATE INDEX idx_subscription_transactions_created_at ON subscription_transactions(created_at DESC);
CREATE INDEX idx_subscription_transactions_status ON subscription_transactions(status);

-- Add comment
COMMENT ON TABLE subscription_transactions IS 'Tracks all subscription billing transactions and invoices';
