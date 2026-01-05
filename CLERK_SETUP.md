# Clerk Authentication Setup Guide

## Overview
This project uses Clerk for authentication with Stripe subscription management.

## 1. Clerk Dashboard Setup

### Create Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Enable the following OAuth providers:
   - Google
   - GitHub (optional)
   - Apple (optional)

### Get API Keys
From your Clerk Dashboard:
1. Go to **API Keys**
2. Copy the following values to your `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_ISSUER_DOMAIN`

## 2. Configure Clerk Webhook

### Create Webhook Endpoint
1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** to `.env.local` as `CLERK_WEBHOOK_SECRET`

### Testing Webhooks Locally
Use ngrok to expose your local server:
```bash
ngrok http 3000
```
Then update the webhook URL in Clerk Dashboard with the ngrok URL.

## 3. Database Setup

### Run Migration
Execute the migration SQL file in your Neon database:
```bash
psql $DATABASE_URL -f migrations/001_clerk_subscription_schema.sql
```

Or manually run the SQL in Neon Console.

## 4. Stripe Setup

### Create Stripe Products
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a product (e.g., "Pro Plan")
3. Add a recurring price (e.g., $29/month)
4. Copy the Price ID for your checkout flow

### Configure Stripe Webhook
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - Production: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 5. Environment Variables

Your `.env.local` should contain:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 6. Testing the Integration

### Test Authentication
1. Start your dev server: `npm run dev`
2. Navigate to `/signup`
3. Sign up with Google or email
4. Verify user is created in database
5. Check that you're redirected to `/dashboard`

### Test Sign Out
1. Click the logout button in the sidebar
2. Verify you're redirected to home page
3. Try accessing `/dashboard` - should redirect to `/login`

### Test Subscription Flow
1. Navigate to `/pricing`
2. Click "Subscribe" button
3. Complete Stripe checkout
4. Verify subscription is updated in database
5. Check subscription status in dashboard

## 7. Customizing Clerk Appearance

The Clerk components are already styled to match your theme. To customize further:

```tsx
<SignIn 
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-none bg-card",
      headerTitle: "text-foreground",
      // Add more customizations
    }
  }}
/>
```

## 8. Troubleshooting

### Webhook not receiving events
- Check that ngrok is running (for local development)
- Verify webhook URL is correct in Clerk/Stripe dashboard
- Check webhook signing secret matches `.env.local`

### User not created in database
- Check database connection
- Verify migration was run successfully
- Check webhook logs in Clerk Dashboard

### Subscription not updating
- Verify Stripe webhook is configured correctly
- Check that `userId` is passed in checkout session metadata
- Review webhook logs in Stripe Dashboard

## 9. Production Deployment

Before deploying:
1. Update Clerk webhook URL to production domain
2. Update Stripe webhook URL to production domain
3. Set all environment variables in production
4. Test the complete flow in production
5. Enable Stripe production mode

## 10. Security Checklist

- ✅ Webhook secrets are stored securely
- ✅ API keys are not committed to git
- ✅ Database uses SSL connections
- ✅ Protected routes use Clerk middleware
- ✅ Stripe webhooks verify signatures
- ✅ User data is properly sanitized
