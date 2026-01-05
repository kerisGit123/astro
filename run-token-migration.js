const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read DATABASE_URL from .env.local
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL="(.+)"/);
  
  if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const databaseUrl = dbUrlMatch[1].trim();
  const sql = neon(databaseUrl);

  console.log('🗑️  Dropping existing token tables...');
  
  try {
    await sql`DROP TABLE IF EXISTS token_transactions CASCADE`;
    console.log('✅ Dropped token_transactions');
  } catch (error) {
    console.log('ℹ️  token_transactions did not exist');
  }

  try {
    await sql`DROP TABLE IF EXISTS user_tokens CASCADE`;
    console.log('✅ Dropped user_tokens');
  } catch (error) {
    console.log('ℹ️  user_tokens did not exist');
  }

  try {
    await sql`DROP TABLE IF EXISTS token_packages CASCADE`;
    console.log('✅ Dropped token_packages');
  } catch (error) {
    console.log('ℹ️  token_packages did not exist');
  }

  console.log('\n📦 Creating token tables with UNIQUE constraint...');

  // Create user_tokens table with UNIQUE constraint
  await sql`
    CREATE TABLE user_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL UNIQUE,
      token_balance INTEGER DEFAULT 0,
      total_purchased INTEGER DEFAULT 0,
      total_used INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  console.log('✅ Created user_tokens table');

  // Create token_transactions table
  await sql`
    CREATE TABLE token_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      description TEXT,
      reference_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_token_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  console.log('✅ Created token_transactions table');

  // Create token_packages table
  await sql`
    CREATE TABLE token_packages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      token_amount INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      currency VARCHAR(3) DEFAULT 'MYR',
      stripe_price_id VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      bonus_tokens INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✅ Created token_packages table');

  console.log('\n📊 Inserting default token packages...');

  // Insert default packages
  await sql`
    INSERT INTO token_packages (name, description, token_amount, price_cents, bonus_tokens) 
    VALUES 
      ('Basic Pack', '100 prediction tokens', 100, 1000, 0),
      ('Value Pack', '400 prediction tokens', 400, 3000, 0)
  `;
  console.log('✅ Inserted token packages');

  console.log('\n🔍 Creating indexes...');

  await sql`CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id)`;
  await sql`CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id)`;
  await sql`CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at DESC)`;
  await sql`CREATE INDEX idx_token_packages_active ON token_packages(is_active)`;
  console.log('✅ Created all indexes');

  console.log('\n✨ Migration completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   - user_tokens table created with UNIQUE constraint on user_id');
  console.log('   - token_transactions table created');
  console.log('   - token_packages table created');
  console.log('   - 2 token packages inserted (RM 10 / RM 30)');
  console.log('   - All indexes created');
  console.log('\n🎉 You can now purchase tokens without errors!');
}

runMigration().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
