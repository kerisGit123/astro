# Quick Start Guide - ZiWei Path

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Run the migration in your Neon database:
```bash
psql $DATABASE_URL -f migrations/001_clerk_subscription_schema.sql
```

### 3. Configure Webhooks (Development)

**Start ngrok:**
```bash
ngrok http 3000
```

**Clerk Webhook:**
- URL: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`
- Copy signing secret to `.env.local` as `CLERK_WEBHOOK_SECRET`

**Stripe Webhook:**
- URL: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test the Flow
1. Visit `http://localhost:3000`
2. Click "Get Started" → Sign up with Google/Email
3. Complete onboarding (if prompted)
4. Access dashboard at `/dashboard`
5. Test sign out from sidebar

## ✅ What's Working

- **Authentication**: Clerk sign in/out with Google OAuth
- **User Sync**: Automatic database sync via webhooks
- **Protected Routes**: Dashboard requires authentication
- **Subscription**: Stripe integration ready (add Price IDs)
- **Theme**: Neon-inspired dark theme with violet accents
- **Landing Page**: Hero, features, pricing sections
- **Dashboard**: Overview with placeholder data

## 📝 Next Steps (PRD Steps 1-4)

### Step 1: Project Setup ✅
- Next.js 14+ with App Router ✅
- shadcn/ui components ✅
- Tailwind CSS with dark theme ✅
- Lucide icons ✅

### Step 2: Design System & Theme ✅
- Neon-inspired colors (violet primary) ✅
- Dark-first design ✅
- Professional mystic aesthetic ✅
- Responsive layout ✅

### Step 3: Database Schema Setup ✅
- Users table (Clerk-compatible) ✅
- People table (reusable entity) ✅
- Relationships table ✅
- Charts table ✅
- Compatibility analyses table ✅

### Step 4: Authentication Integration ✅
- Clerk OAuth (Google) ✅
- Sign up/in flows ✅
- Session management ✅
- Protected routes ✅
- User sync to database ✅

## 🎯 Implement Next (Steps 5-8)

### Step 5: Onboarding Flow
Create birth data collection form:
- Welcome screen
- Birth date, time, location inputs
- Create person record with `is_user_self = true`
- Set `onboarding_completed = true`

### Step 6: Landing Page Enhancement
- Verify hero section content
- Add testimonials (if available)
- Optimize conversion sections
- Add legal pages (Terms, Privacy, Disclaimer)

### Step 7: Dashboard & People Management
- Implement people CRUD operations
- Add person form
- List all people
- Relationship type selector
- Edit/delete functionality

### Step 8: n8n Workflow Setup
- Install n8n
- Create chart calculation workflow
- Set up compatibility analysis
- Configure database triggers

## 🔧 Configuration Files

### `.env.local` (Already Configured)
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev
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

## 📚 Documentation

- `README_CLERK_MIGRATION.md` - Complete migration details
- `CLERK_SETUP.md` - Detailed Clerk setup guide
- `PRD.md` - Full product requirements
- `SETUP.md` - Original setup instructions

## 🐛 Common Issues

**Webhook not working?**
- Check ngrok is running
- Verify webhook URL in dashboard
- Check signing secret matches

**User not in database?**
- Check webhook logs in Clerk Dashboard
- Verify migration ran successfully
- Check database connection

**TypeScript errors?**
- Run `npm install`
- Restart TypeScript server

## 🎨 Theme Colors

Your neon-inspired dark theme:
- Background: `oklch(0.05 0.01 260)` - Deep navy black
- Primary: `oklch(0.65 0.3 290)` - Vibrant violet
- Card: `oklch(0.1 0.03 260)` - Slightly lighter
- Border: `oklch(0.2 0.05 260)` - Subtle borders

## 🚢 Production Deployment

Before going live:
1. Update webhook URLs to production domain
2. Set all environment variables
3. Run database migration in production
4. Test complete user flow
5. Enable Stripe live mode
6. Add real Stripe Price IDs

## 💡 Tips

- Use Clerk Dashboard to manage users
- Monitor webhooks in Clerk/Stripe dashboards
- Check database for user sync issues
- Test subscription flow in Stripe test mode
- Keep ngrok running during local development

---

**You're all set!** Start building the onboarding flow and people management features next.
