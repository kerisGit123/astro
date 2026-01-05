const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key.trim()] = value;
        }
    });
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running extended analysis fields migration...');
        
        await client.query(`
            ALTER TABLE personal_analysis
            ADD COLUMN IF NOT EXISTS future_20 JSONB,
            ADD COLUMN IF NOT EXISTS chance_prediction JSONB,
            ADD COLUMN IF NOT EXISTS risk_prediction JSONB,
            ADD COLUMN IF NOT EXISTS timing_opportunities JSONB;
        `);
        console.log('✓ Added extended analysis columns');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✓ Migration already applied');
        } else {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
