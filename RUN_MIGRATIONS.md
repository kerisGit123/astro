# Database Migration Instructions

## Prerequisites
- PostgreSQL client installed
- Access to your Neon database

## Step 1: Get Database Connection String
Your database URL should be in `.env.local` as `DATABASE_URL`

## Step 2: Run Migrations

### Option A: Using psql command line

```bash
# Navigate to your project directory
cd d:\gemini\astro

# Run people management migration
psql "YOUR_DATABASE_URL_HERE" -f migrations/008_add_people_management_fields.sql

# Run token system migration
psql "YOUR_DATABASE_URL_HERE" -f migrations/009_add_user_tokens.sql
```

### Option B: Using Neon Dashboard SQL Editor

1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Copy and paste the contents of each migration file:
   - First: `migrations/008_add_people_management_fields.sql`
   - Then: `migrations/009_add_user_tokens.sql`
5. Click "Run" for each

### Option C: Using Node.js Script

Create a file `run-migrations.js`:

```javascript
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Running migration 008...');
  const migration008 = fs.readFileSync('./migrations/008_add_people_management_fields.sql', 'utf8');
  await sql(migration008);
  console.log('✅ Migration 008 complete');
  
  console.log('Running migration 009...');
  const migration009 = fs.readFileSync('./migrations/009_add_user_tokens.sql', 'utf8');
  await sql(migration009);
  console.log('✅ Migration 009 complete');
  
  console.log('All migrations complete!');
}

runMigrations().catch(console.error);
```

Then run:
```bash
node run-migrations.js
```

## Verify Migrations

After running, verify the tables exist:

```sql
-- Check people table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'people' 
AND column_name IN ('is_active', 'category', 'notes');

-- Check token tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_tokens', 'token_transactions', 'token_packages');

-- Check token packages were inserted
SELECT * FROM token_packages;
```

You should see:
- `people` table with `is_active`, `category`, `notes` columns
- `user_tokens`, `token_transactions`, `token_packages` tables
- 2 token packages: Basic Pack (RM 10, 100 tokens) and Value Pack (RM 30, 400 tokens)

## Troubleshooting

**Error: "relation already exists"**
- This is OK, it means the table already exists
- The migrations use `IF NOT EXISTS` so they're safe to re-run

**Error: "permission denied"**
- Make sure your database user has CREATE TABLE permissions
- Check your DATABASE_URL is correct

**Error: "syntax error"**
- Make sure you're using PostgreSQL (not MySQL or other databases)
- Check the migration file wasn't corrupted
