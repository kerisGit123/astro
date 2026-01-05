# Stripe Credit System Setup Instructions

## Overview

This guide will help you set up the improved Neon DB Stripe credit system that replaces the previous implementation with better transaction safety, idempotency, and error handling.

---

## What's New

### **Key Improvements**
- ✅ **Transaction Safety**: PostgreSQL ACID transactions prevent partial data corruption
- ✅ **Idempotency**: Prevents duplicate credits if webhooks are sent multiple times
- ✅ **Row-Level Locking**: Prevents race conditions during credit consumption
- ✅ **Better Error Handling**: Automatic rollback on failures
- ✅ **Dual System**: New credit system works alongside legacy token system

---

## Step 1: Add DATABASE_URL to Environment

Add your Neon database connection string to `.env.local`:

```bash
# Add this line to your .env.local file
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**How to get your DATABASE_URL:**
1. Go to [neon.tech](https://neon.tech)
2. Log in or create an account
3. Create a new project (or use existing)
4. Copy the connection string from the dashboard
5. Paste it into `.env.local`

---

## Step 2: Run Database Migration

Run the SQL migration to create the new credits tables:

### **Option A: Using psql**
```bash
psql $DATABASE_URL -f migrations/001_create_credits_tables.sql
```

### **Option B: Using Neon SQL Editor**
1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Copy the contents of `migrations/001_create_credits_tables.sql`
4. Paste and execute

### **Option C: Using a migration tool**
If you're using a migration tool like `node-pg-migrate` or Drizzle, add the migration file to your migrations folder and run:
```bash
npm run migrate
```

---

## Step 3: Verify Environment Variables

Make sure your `.env.local` has all required variables:

```bash
# Stripe Configuration (already set)
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Neon Database (ADD THIS)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# App Configuration (already set)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credit Pricing (Optional - defaults shown)
CREDITS_BASE_TOKENS=100
CREDITS_BASE_AMOUNT=2000  # RM20 in cents
CREDITS_CURRENCY=myr
```

---

## Step 4: Test Locally with Stripe CLI

### **Install Stripe CLI**
```bash
# Windows (using Scoop)
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe
```

### **Login to Stripe**
```bash
stripe login
```

### **Forward Webhooks to Local Server**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret. **Copy it and update your `.env.local`:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### **Start Your Dev Server**
```bash
npm run dev
```

---

## Step 5: Test the Credit Purchase Flow

### **Create a Test Purchase**

Use the new credits endpoint:

```bash
curl -X POST http://localhost:3000/api/stripe/credits \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test_company_123",
    "tokens": 300,
    "amount": 5000,
    "currency": "myr"
  }'
```

Or from your frontend:
```typescript
const response = await fetch("/api/stripe/credits", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    companyId: "test_company_123",
    tokens: 300,
    amount: 5000,  // RM 50.00 in cents
    currency: "myr",
  }),
});

const data = await response.json();
window.location.href = data.url; // Redirect to Stripe Checkout
```

### **Use Stripe Test Card**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### **Watch the Stripe CLI Output**
You should see webhook events being received and processed.

---

## Step 6: Verify Database Updates

After completing a test purchase, check your database:

```sql
-- Check balance
SELECT * FROM credits_balance WHERE company_id = 'test_company_123';

-- Check ledger (transaction history)
SELECT * FROM credits_ledger 
WHERE company_id = 'test_company_123' 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify no duplicates (should return 0 rows)
SELECT stripe_payment_intent_id, COUNT(*) 
FROM credits_ledger 
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id 
HAVING COUNT(*) > 1;
```

---

## Step 7: Query Credits via API

### **Get Balance**
```bash
curl http://localhost:3000/api/credits/balance?companyId=test_company_123
```

Response:
```json
{
  "balance": 300
}
```

### **Get Transaction History**
```bash
curl http://localhost:3000/api/credits/ledger?companyId=test_company_123&limit=50
```

Response:
```json
{
  "ledger": [
    {
      "id": 1,
      "company_id": "test_company_123",
      "tokens": 300,
      "stripe_payment_intent_id": "pi_xxxxx",
      "amount_paid": 5000,
      "currency": "myr",
      "reason": "token_purchase",
      "created_at": "2026-01-02T13:19:00Z"
    }
  ]
}
```

---

## Step 8: Frontend Integration Example

### **Purchase Credits Button**
```typescript
const handleBuyCredits = async (tokens: number, price: number) => {
  if (!companyId) {
    alert("Please sign in to purchase credits");
    return;
  }
  
  setIsPurchasing(true);
  
  try {
    const response = await fetch("/api/stripe/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        tokens,
        amount: price * 100,  // Convert to cents
        currency: "myr",
      }),
    });
    
    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Purchase error:", error);
    setIsPurchasing(false);
  }
};
```

### **Display Balance**
```typescript
const [balance, setBalance] = useState<number>(0);

useEffect(() => {
  const fetchBalance = async () => {
    const response = await fetch(`/api/credits/balance?companyId=${companyId}`);
    const data = await response.json();
    setBalance(data.balance);
  };
  
  fetchBalance();
  
  // Refresh every 30 seconds
  const interval = setInterval(fetchBalance, 30000);
  return () => clearInterval(interval);
}, [companyId]);
```

---

## API Endpoints Reference

### **New Credit System Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe/credits` | POST | Create checkout session for credit purchase |
| `/api/credits/balance` | GET | Get current credit balance |
| `/api/credits/ledger` | GET | Get transaction history |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks (improved) |

### **Legacy Token System Endpoints** (Still Active)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe/checkout` | POST | Create subscription checkout |
| `/api/tokens/balance` | GET | Get token balance (old system) |
| `/api/tokens/transactions` | GET | Get token transactions (old system) |

---

## Troubleshooting

### **Issue: Webhook Signature Verification Failed**

**Solution:**
1. Make sure you're using the webhook secret from Stripe CLI for local testing
2. For production, use the webhook secret from Stripe Dashboard
3. Verify the secret in `.env.local` matches

### **Issue: Credits Not Added After Payment**

**Debug Steps:**
1. Check Stripe CLI output for webhook events
2. Check your server logs for errors
3. Query database directly to see if transaction was recorded
4. Verify metadata is attached to the checkout session

### **Issue: Database Connection Error**

**Solution:**
1. Verify `DATABASE_URL` is correct in `.env.local`
2. Check Neon dashboard to ensure database is active
3. Verify SSL mode is set: `?sslmode=require`

### **Issue: Credits Added Twice**

**This should NOT happen** due to idempotency checks. If it does:
1. Check database for duplicate `stripe_payment_intent_id`
2. Review webhook logs
3. Verify idempotency check is working

---

## Production Deployment Checklist

Before going live:

- [ ] Replace test Stripe keys with live keys in production environment
- [ ] Update webhook endpoint URL in Stripe Dashboard
- [ ] Configure webhook events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Test with real card (small amount)
- [ ] Verify webhook signature validation works
- [ ] Monitor first few transactions closely
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure email receipts in Stripe Dashboard
- [ ] Set up database backups in Neon
- [ ] Test concurrent purchases
- [ ] Document customer support procedures

---

## Key Differences from Previous Implementation

| Feature | Old System | New System |
|---------|-----------|------------|
| **Transactions** | No transaction safety | PostgreSQL ACID transactions |
| **Idempotency** | Basic or missing | Strong idempotency with Stripe IDs |
| **Race Conditions** | Possible | Row-level locking prevents |
| **Error Handling** | Partial updates possible | Automatic rollback |
| **Debugging** | Limited visibility | Direct SQL queries available |
| **Webhook Events** | Single event | Dual events for redundancy |

---

## Support

If you encounter issues:

1. Check the logs in your terminal
2. Review Stripe Dashboard → Webhooks → Events
3. Query the database directly to verify data
4. Check `STRIPE_NEON.md` for detailed documentation

---

## Next Steps

1. Run the migration
2. Test locally with Stripe CLI
3. Verify database updates
4. Integrate into your frontend
5. Deploy to production

**Your improved Stripe credit system is now ready!** 🎉
