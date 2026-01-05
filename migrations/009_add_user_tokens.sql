-- Add token system for users to purchase prediction credits

-- Create tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    token_balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create token transactions table for tracking purchases and usage
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
    amount INTEGER NOT NULL, -- positive for purchase/bonus, negative for usage
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_id VARCHAR(255), -- stripe payment ID, prediction ID, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create token packages table for different purchase options
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_amount INTEGER NOT NULL,
    price_cents INTEGER NOT NULL, -- price in cents (e.g., 1000 = RM 10.00)
    currency VARCHAR(3) DEFAULT 'MYR',
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    bonus_tokens INTEGER DEFAULT 0, -- extra tokens given as bonus
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default token packages
INSERT INTO token_packages (name, description, token_amount, price_cents, bonus_tokens) VALUES
('Basic Pack', '100 prediction tokens', 100, 1000, 0),
('Value Pack', '400 prediction tokens', 400, 3000, 0)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_packages_active ON token_packages(is_active);

-- Add comments
COMMENT ON TABLE user_tokens IS 'Stores user token balances for purchasing predictions';
COMMENT ON TABLE token_transactions IS 'Tracks all token purchases and usage';
COMMENT ON TABLE token_packages IS 'Available token packages for purchase';
