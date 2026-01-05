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
            // Remove quotes if present
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
        console.log('Running migration...');
        
        await client.query(`
            ALTER TABLE people
            ADD COLUMN IF NOT EXISTS selected_topic TEXT,
            ADD COLUMN IF NOT EXISTS topic_prompt TEXT,
            ADD COLUMN IF NOT EXISTS analysis_language TEXT DEFAULT 'en';
        `);
        console.log('✓ Added columns');

        await client.query(`
            ALTER TABLE people
            ADD CONSTRAINT check_selected_topic 
            CHECK (selected_topic IS NULL OR selected_topic IN ('career', 'marriage', 'health', 'education', 'general'));
        `);
        console.log('✓ Added topic constraint');

        await client.query(`
            ALTER TABLE people
            ADD CONSTRAINT check_analysis_language 
            CHECK (analysis_language IN ('en', 'zh', 'ms', 'ja'));
        `);
        console.log('✓ Added language constraint');

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
