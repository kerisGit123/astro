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

async function verifyMigration() {
    const client = await pool.connect();
    try {
        console.log('Verifying migration...\n');
        
        const result = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'people' 
            AND column_name IN ('selected_topic', 'topic_prompt', 'analysis_language')
            ORDER BY column_name;
        `);

        if (result.rows.length === 3) {
            console.log('✅ All 3 columns found:');
            result.rows.forEach(row => {
                console.log(`  - ${row.column_name} (${row.data_type})${row.column_default ? ` DEFAULT ${row.column_default}` : ''}`);
            });
        } else {
            console.log('❌ Expected 3 columns, found:', result.rows.length);
        }
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyMigration();
