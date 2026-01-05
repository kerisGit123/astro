import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and tables...\n');
    
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables in database:');
    tablesResult.rows.forEach((row: any) => console.log('  ✓', row.table_name));
    
    // Check users table
    const usersExists = tablesResult.rows.some((r: any) => r.table_name === 'users');
    console.log('\n👥 Users Table:', usersExists ? '✓ EXISTS' : '✗ MISSING');
    
    if (usersExists) {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('   Count:', usersCount.rows[0].count);
      
      const usersSample = await pool.query('SELECT id, email, onboarding_completed FROM users LIMIT 3');
      console.log('   Sample:', usersSample.rows);
    } else {
      console.log('   ⚠️  Users table not found - migration may have failed');
    }
    
    // Check people table
    const peopleExists = tablesResult.rows.some((r: any) => r.table_name === 'people');
    console.log('\n👤 People Table:', peopleExists ? '✓ EXISTS' : '✗ MISSING');
    
    if (peopleExists) {
      const peopleCount = await pool.query('SELECT COUNT(*) FROM people');
      console.log('   Count:', peopleCount.rows[0].count);
      
      const peopleSample = await pool.query('SELECT id, name, is_user_self FROM people LIMIT 3');
      console.log('   Sample:', peopleSample.rows);
    }
    
    // Check relationships table
    const relationshipsExists = tablesResult.rows.some((r: any) => r.table_name === 'relationships');
    console.log('\n🔗 Relationships Table:', relationshipsExists ? '✓ EXISTS' : '✗ MISSING');
    
    // Check charts table
    const chartsExists = tablesResult.rows.some((r: any) => r.table_name === 'charts');
    console.log('📈 Charts Table:', chartsExists ? '✓ EXISTS' : '✗ MISSING');
    
    console.log('\n✅ Database check complete!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

checkDatabase();
