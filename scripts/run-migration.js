const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_credits_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('credits_ledger', 'credits_balance')
      ORDER BY table_name
    `);
    
    console.log('Created tables:', result.rows.map(t => t.table_name).join(', '));
    
    if (result.rows.length === 2) {
      console.log('\n✅ Both tables created successfully!');
      console.log('   - credits_balance');
      console.log('   - credits_ledger');
    } else {
      console.log('\n⚠️ Warning: Expected 2 tables, found', result.rows.length);
    }
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('\n⚠️ Tables may already exist. Checking...');
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('credits_ledger', 'credits_balance')
        ORDER BY table_name
      `);
      console.log('Existing tables:', result.rows.map(t => t.table_name).join(', '));
      if (result.rows.length === 2) {
        console.log('✅ Tables already exist - migration not needed!');
      }
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
