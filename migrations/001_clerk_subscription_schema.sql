-- Migration: Clerk Authentication and Subscription Support
-- This migration updates the users table to support Clerk authentication and Stripe subscriptions

-- Drop existing auth tables if they exist from better-auth
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS verification CASCADE;

-- Update users table for Clerk
ALTER TABLE IF EXISTS users 
  DROP COLUMN IF EXISTS password,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS image;

-- Recreate users table with Clerk-compatible schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'clerk',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create people table (reusable entity for birth data)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  birth_timezone TEXT,
  gender TEXT,
  is_user_self BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, person_id, relationship_type)
);

-- Create charts table (cached calculations)
CREATE TABLE IF NOT EXISTS charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL,
  chart_data JSONB NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Create compatibility analyses table
CREATE TABLE IF NOT EXISTS compatibility_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  person_a_id UUID REFERENCES people(id) ON DELETE CASCADE,
  person_b_id UUID REFERENCES people(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_people_is_user_self ON people(is_user_self);
CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_id ON relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_charts_person_id ON charts(person_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_user_id ON compatibility_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
