import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_DfeFzaj1Pk5T@ep-snowy-hat-a4e2ccy0.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function checkDatabase() {
  try {
    console.log('Checking database tables...\n');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tables found:');
    tablesResult.rows.forEach(row => console.log('  ✓', row.table_name));
    
    // Check users table
    const usersExists = tablesResult.rows.some(r => r.table_name === 'users');
    console.log('\n--- Users Table ---');
    console.log('Exists:', usersExists);
    
    if (usersExists) {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('Count:', usersCount.rows[0].count);
      
      const usersSample = await pool.query('SELECT id, email, onboarding_completed FROM users LIMIT 5');
      console.log('Sample data:', usersSample.rows);
    }
    
    // Check people table
    const peopleExists = tablesResult.rows.some(r => r.table_name === 'people');
    console.log('\n--- People Table ---');
    console.log('Exists:', peopleExists);
    
    if (peopleExists) {
      const peopleCount = await pool.query('SELECT COUNT(*) FROM people');
      console.log('Count:', peopleCount.rows[0].count);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

checkDatabase();
