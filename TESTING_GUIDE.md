# Testing Guide - Stripe Credit System with Ngrok

## Quick Start

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Start Ngrok
```bash
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 3. Configure Stripe Webhook

Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)

**Add endpoint:**
- URL: `https://YOUR_NGROK_URL.ngrok.io/api/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `payment_intent.succeeded`

**Copy the webhook signing secret** and update your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Restart your dev server** after updating the webhook secret.

---

## Testing the Credit Purchase Flow

### Step 1: Open Test Page

Navigate to: `http://localhost:3000/test-credits`

You'll see a test interface with:
- Company ID input (default: `test_company_123`)
- Tokens amount
- Price in RM
- Currency selector

### Step 2: Make a Test Purchase

1. Keep the default values or customize:
   - Company ID: `test_company_123`
   - Tokens: `300`
   - Amount: `50` RM
   - Currency: `myr`

2. Click **"Buy 300 Credits for MYR 50.00"**

3. You'll be redirected to Stripe Checkout

4. Use test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

5. Complete the payment

### Step 3: Verify the Purchase

After payment, you'll be redirected back to your app.

**Check via Test Page:**
- Click **"Check Balance"** button
- Click **"Check Ledger"** button (opens console)

**Check via Database Script:**
```bash
# Windows PowerShell
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js test_company_123

# Or with different company ID
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js YOUR_COMPANY_ID
```

---

## What to Look For

### ✅ Successful Purchase Indicators

1. **Stripe Dashboard**
   - Payment shows as "Succeeded"
   - Webhook event shows as "Succeeded"

2. **Database Verification Script Output**
   ```
   📊 CURRENT BALANCE
   Balance: 300 credits
   Last Updated: 1/2/2026, 9:30:00 PM

   📝 TRANSACTION LEDGER
   1. Transaction ID: 1
      Tokens: +300
      Type: PURCHASE
      Amount Paid: MYR 50.00
      Payment Intent: pi_xxxxx
      Session ID: cs_xxxxx
      Reason: token_purchase
      Date: 1/2/2026, 9:30:00 PM

   📈 STATISTICS
   Total Transactions: 1
   Total Purchased: 300 credits (1 purchases)
   Total Used: 0 credits (0 usages)
   Net Balance: 300 credits

   🔒 IDEMPOTENCY CHECK
   ✅ No duplicate transactions
   ```

3. **Test Page**
   - "Check Balance" shows correct amount
   - "Check Ledger" shows transaction in console

---

## Testing Idempotency

To test that duplicate webhooks don't create duplicate credits:

1. Go to Stripe Dashboard → Webhooks
2. Find your recent webhook event
3. Click **"Resend"** multiple times
4. Run verification script
5. Should still show only 1 transaction (no duplicates)

```bash
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js test_company_123
```

Expected output:
```
🔒 IDEMPOTENCY CHECK
✅ No duplicate transactions (idempotency working correctly)
```

---

## Testing Credit Consumption

You can test using credits by calling the consume function:

```typescript
// In your code
import { consumeCredits } from "@/lib/credits";

const result = await consumeCredits("test_company_123", 50, "ocr_scan");

if (result.success) {
  console.log("Credits consumed. New balance:", result.balance);
} else {
  console.log("Error:", result.error);
}
```

Then verify:
```bash
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js test_company_123
```

You should see:
- Balance reduced by 50
- New ledger entry with negative tokens (-50)
- Statistics showing usage count

---

## API Testing with cURL

### Create Checkout Session
```bash
curl -X POST http://localhost:3000/api/stripe/credits \
  -H "Content-Type: application/json" \
  -d "{\"companyId\":\"test_company_123\",\"tokens\":300,\"amount\":5000,\"currency\":\"myr\"}"
```

### Check Balance
```bash
curl http://localhost:3000/api/credits/balance?companyId=test_company_123
```

### Check Ledger
```bash
curl http://localhost:3000/api/credits/ledger?companyId=test_company_123&limit=10
```

---

## Troubleshooting

### Issue: Webhook Not Received

**Check:**
1. Ngrok is running and URL is correct
2. Webhook endpoint in Stripe Dashboard matches ngrok URL
3. Dev server is running
4. Webhook secret in `.env.local` matches Stripe Dashboard

**Debug:**
- Check Stripe Dashboard → Webhooks → View logs
- Check your dev server console for errors
- Check ngrok web interface at `http://localhost:4040`

### Issue: Credits Not Added

**Check:**
1. Webhook signature verification passed
2. Metadata is attached to checkout session
3. Database connection is working

**Debug:**
```bash
# Check server logs
# Look for: "Credits added via new system for: test_company_123"

# Verify database directly
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js test_company_123
```

### Issue: Duplicate Credits

**This should NOT happen** due to idempotency checks.

If it does:
1. Check verification script output
2. Review webhook logs in Stripe Dashboard
3. Check if `stripe_payment_intent_id` is being stored correctly

---

## Production Deployment

When ready for production:

1. **Update Stripe Keys**
   - Replace test keys with live keys in production environment
   - Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. **Configure Production Webhook**
   - Add production URL to Stripe Dashboard
   - Use production webhook secret
   - Configure same events: `checkout.session.completed`, `payment_intent.succeeded`

3. **Test with Real Card**
   - Use a real card with small amount first
   - Verify credits are added correctly
   - Check for any errors

4. **Monitor**
   - Watch first few transactions closely
   - Set up error monitoring (Sentry, LogRocket)
   - Monitor database for any issues

---

## Quick Reference

### Test Page
```
http://localhost:3000/test-credits
```

### Verification Script
```bash
$env:DATABASE_URL = (Get-Content .env.local | Select-String "^DATABASE_URL=" | ForEach-Object { $_ -replace "^DATABASE_URL=", "" } | ForEach-Object { $_ -replace '"', '' }); node scripts/verify-credits.js COMPANY_ID
```

### Test Card
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### API Endpoints
- Create checkout: `POST /api/stripe/credits`
- Check balance: `GET /api/credits/balance?companyId=X`
- Check ledger: `GET /api/credits/ledger?companyId=X&limit=10`
- Webhook: `POST /api/stripe/webhook`

---

## Success Checklist

After a test purchase, verify:

- [ ] Payment succeeded in Stripe Dashboard
- [ ] Webhook event shows as succeeded
- [ ] Balance shows correct amount
- [ ] Ledger shows transaction with all details
- [ ] No duplicate transactions
- [ ] Statistics are accurate
- [ ] Test page shows updated balance

**Your credit system is working correctly!** 🎉
