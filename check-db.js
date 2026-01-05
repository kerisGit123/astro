const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_DfeFzaj1Pk5T@ep-snowy-hat-a4e2ccy0.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check if users table exists
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('\nUsers table exists:', usersCheck.rows[0].exists);
    
    if (usersCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) FROM users');
      console.log('Users count:', count.rows[0].count);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
