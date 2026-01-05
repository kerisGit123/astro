import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_DfeFzaj1Pk5T@ep-snowy-hat-a4e2ccy0.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function verifyAndFixDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Existing tables:');
    const tableNames = tablesResult.rows.map((r: { table_name: string }) => r.table_name);
    tableNames.forEach((name: string) => console.log('  ✓', name));
    
    const hasUsers = tableNames.includes('users');
    const hasPeople = tableNames.includes('people');
    const hasRelationships = tableNames.includes('relationships');
    const hasCharts = tableNames.includes('charts');
    
    console.log('\n📋 Required tables:');
    console.log('  users:', hasUsers ? '✓' : '✗ MISSING');
    console.log('  people:', hasPeople ? '✓' : '✗ MISSING');
    console.log('  relationships:', hasRelationships ? '✓' : '✗ MISSING');
    console.log('  charts:', hasCharts ? '✓' : '✗ MISSING');
    
    if (!hasUsers || !hasPeople || !hasRelationships || !hasCharts) {
      console.log('\n⚠️  Some tables are missing. Running migration...\n');
      
      // Run migration
      const fs = await import('fs');
      const path = await import('path');
      const migrationSQL = fs.readFileSync(
        path.join(process.cwd(), 'migrations', '001_clerk_subscription_schema.sql'),
        'utf-8'
      );
      
      await pool.query(migrationSQL);
      console.log('✅ Migration executed successfully!\n');
      
      // Verify again
      const verifyResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      console.log('📊 Tables after migration:');
      verifyResult.rows.forEach((r: { table_name: string }) => console.log('  ✓', r.table_name));
    }
    
    // Check data
    if (hasUsers) {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('\n👥 Users in database:', usersCount.rows[0].count);
      
      if (parseInt(usersCount.rows[0].count) > 0) {
        const users = await pool.query('SELECT id, email, onboarding_completed FROM users LIMIT 5');
        console.log('Sample users:');
        users.rows.forEach((u: any) => {
          console.log(`  - ${u.email} (onboarding: ${u.onboarding_completed})`);
        });
      }
    }
    
    if (hasPeople) {
      const peopleCount = await pool.query('SELECT COUNT(*) FROM people');
      console.log('\n👤 People in database:', peopleCount.rows[0].count);
      
      if (parseInt(peopleCount.rows[0].count) > 0) {
        const people = await pool.query('SELECT id, name, is_user_self FROM people LIMIT 5');
        console.log('Sample people:');
        people.rows.forEach((p: any) => {
          console.log(`  - ${p.name} (is_user_self: ${p.is_user_self})`);
        });
      }
    }
    
    console.log('\n✅ Database verification complete!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
  } finally {
    await pool.end();
  }
}

verifyAndFixDatabase();
