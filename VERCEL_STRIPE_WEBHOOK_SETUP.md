# Stripe Webhook Setup for Vercel Deployment

## Problem
Credits aren't being added after Stripe checkout because the webhook isn't configured for your Vercel deployment.

## Solution: Set Up Stripe Webhook

### Step 1: Go to Stripe Dashboard

1. Open [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**

### Step 2: Configure Webhook Endpoint

**Endpoint URL:**
```
https://astro-ten-sandy.vercel.app/api/stripe/webhook
```

**Events to listen for:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`

### Step 3: Copy Webhook Signing Secret

After creating the webhook, Stripe will show you a **Signing secret** (starts with `whsec_`).

**Copy this secret** - you'll need it for the next step.

### Step 4: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **astro-ten-sandy**
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxx` (paste the signing secret from Step 3)
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 5: Redeploy Your Application

After adding the environment variable, you need to redeploy:

**Option A: Trigger from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

**Option B: Push a commit to GitHub**
```bash
git commit --allow-empty -m "Trigger redeploy for webhook config"
git push origin master
```

### Step 6: Test the Webhook

1. Make a test purchase on your site
2. Check Stripe Dashboard → **Developers** → **Webhooks** → Click your endpoint
3. Look at the **Recent events** section
4. You should see successful deliveries (200 status code)

### Step 7: Verify Credits Were Added

1. After successful payment, check your database
2. Query the `credits_ledger` table to see if the transaction was recorded
3. Check `credits_balance` table to see if balance increased

## Troubleshooting

### Webhook Returns 400 Error
- **Cause:** `STRIPE_WEBHOOK_SECRET` is missing or incorrect
- **Fix:** Double-check the environment variable in Vercel settings

### Webhook Returns 500 Error
- **Cause:** Database connection issue or code error
- **Fix:** Check Vercel function logs for error details

### Credits Still Not Adding
1. Check Stripe webhook logs for delivery status
2. Check Vercel function logs: `vercel logs --follow`
3. Verify `DATABASE_URL` environment variable is set in Vercel
4. Verify `STRIPE_SECRET_KEY` environment variable is set in Vercel

## Required Environment Variables in Vercel

Make sure ALL these are set in Vercel:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx (or sk_test_xxxxx for testing)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx (or pk_test_xxxxx)

# Database
DATABASE_URL=postgresql://user:password@host/database

# App
NEXT_PUBLIC_APP_URL=https://astro-ten-sandy.vercel.app

# Clerk (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx
CLERK_SECRET_KEY=sk_xxxxx
```

## How the Webhook Works

```
1. User completes checkout on Stripe
   ↓
2. Stripe sends webhook event to your endpoint
   ↓
3. Your app verifies the webhook signature
   ↓
4. Your app extracts payment details from the event
   ↓
5. Your app calls addCredits() function
   ↓
6. Credits are added to database
   ↓
7. User sees updated balance
```

## Next Steps

1. ✅ Set up webhook endpoint in Stripe Dashboard
2. ✅ Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
3. ✅ Redeploy your application
4. ✅ Test with a real purchase
5. ✅ Verify credits are added correctly
