const { Pool } = require('@neondatabase/serverless');

async function verifyCredits() {
  const companyId = process.argv[2] || 'test_company_123';
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Verifying Credits System');
    console.log('═══════════════════════════════════════\n');
    console.log(`Company ID: ${companyId}\n`);
    
    // Check balance
    console.log('📊 CURRENT BALANCE');
    console.log('───────────────────────────────────────');
    const balanceResult = await client.query(
      'SELECT * FROM credits_balance WHERE company_id = $1',
      [companyId]
    );
    
    if (balanceResult.rows.length > 0) {
      const balance = balanceResult.rows[0];
      console.log(`Balance: ${balance.balance} credits`);
      console.log(`Last Updated: ${new Date(balance.updated_at).toLocaleString()}`);
    } else {
      console.log('No balance record found (user has not purchased credits yet)');
    }
    
    // Check ledger
    console.log('\n📝 TRANSACTION LEDGER (Last 10)');
    console.log('───────────────────────────────────────');
    const ledgerResult = await client.query(
      `SELECT * FROM credits_ledger 
       WHERE company_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [companyId]
    );
    
    if (ledgerResult.rows.length > 0) {
      ledgerResult.rows.forEach((tx, index) => {
        console.log(`\n${index + 1}. Transaction ID: ${tx.id}`);
        console.log(`   Tokens: ${tx.tokens > 0 ? '+' : ''}${tx.tokens}`);
        console.log(`   Type: ${tx.tokens > 0 ? 'PURCHASE' : 'USAGE'}`);
        if (tx.amount_paid) {
          console.log(`   Amount Paid: ${tx.currency?.toUpperCase()} ${(tx.amount_paid / 100).toFixed(2)}`);
        }
        if (tx.stripe_payment_intent_id) {
          console.log(`   Payment Intent: ${tx.stripe_payment_intent_id}`);
        }
        if (tx.stripe_checkout_session_id) {
          console.log(`   Session ID: ${tx.stripe_checkout_session_id}`);
        }
        console.log(`   Reason: ${tx.reason || 'N/A'}`);
        console.log(`   Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    } else {
      console.log('No transactions found');
    }
    
    // Statistics
    console.log('\n📈 STATISTICS');
    console.log('───────────────────────────────────────');
    const statsResult = await client.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END) as total_purchased,
        SUM(CASE WHEN tokens < 0 THEN ABS(tokens) ELSE 0 END) as total_used,
        COUNT(CASE WHEN tokens > 0 THEN 1 END) as purchase_count,
        COUNT(CASE WHEN tokens < 0 THEN 1 END) as usage_count
       FROM credits_ledger 
       WHERE company_id = $1`,
      [companyId]
    );
    
    const stats = statsResult.rows[0];
    console.log(`Total Transactions: ${stats.total_transactions}`);
    console.log(`Total Purchased: ${stats.total_purchased} credits (${stats.purchase_count} purchases)`);
    console.log(`Total Used: ${stats.total_used} credits (${stats.usage_count} usages)`);
    console.log(`Net Balance: ${Number(stats.total_purchased) - Number(stats.total_used)} credits`);
    
    // Check for duplicates
    console.log('\n🔒 IDEMPOTENCY CHECK');
    console.log('───────────────────────────────────────');
    const duplicatesResult = await client.query(
      `SELECT stripe_payment_intent_id, COUNT(*) as count
       FROM credits_ledger
       WHERE company_id = $1 
       AND stripe_payment_intent_id IS NOT NULL
       GROUP BY stripe_payment_intent_id
       HAVING COUNT(*) > 1`,
      [companyId]
    );
    
    if (duplicatesResult.rows.length > 0) {
      console.log('⚠️  WARNING: Duplicate transactions found!');
      duplicatesResult.rows.forEach(dup => {
        console.log(`   Payment Intent ${dup.stripe_payment_intent_id}: ${dup.count} times`);
      });
    } else {
      console.log('✅ No duplicate transactions (idempotency working correctly)');
    }
    
    console.log('\n═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run verification
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

verifyCredits().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
