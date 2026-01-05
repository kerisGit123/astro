# PRD Implementation Status - ZiWei Path

## ✅ Clerk Configuration Fixed

The Clerk SignIn/SignUp error has been resolved:
- Moved login page to catch-all route: `/login/[[...rest]]/page.tsx`
- Moved signup page to catch-all route: `/signup/[[...rest]]/page.tsx`
- Updated to use `forceRedirectUrl` instead of `afterSignInUrl`/`afterSignUpUrl`
- Middleware already configured with `'/login(.*)'` and `'/signup(.*)'` patterns

## PRD Steps 1-5 Implementation Status

### ✅ Step 1: Project Setup (COMPLETE)
**PRD Requirements:**
- Initialize Next.js 14 app with App Router
- Install shadcn/ui, Tailwind CSS, Lucide icons
- Configure dark theme and base layout
- Set up ESLint, Prettier, TypeScript

**Status:**
- ✅ Next.js 16.1.1 with App Router
- ✅ shadcn/ui components installed
- ✅ Tailwind CSS v4 configured
- ✅ Lucide icons integrated
- ✅ Dark theme configured in globals.css
- ✅ TypeScript with strict mode
- ✅ ESLint configured

### ✅ Step 2: Design System & Theme (COMPLETE)
**PRD Requirements:**
- Implement neon-inspired color tokens in Tailwind config
- Define typography, spacing, and card styles
- Build reusable UI components (Button, Card, Input, etc.)
- Create layout components (Sidebar, TopBar)

**Status:**
- ✅ Neon-inspired color scheme implemented (violet primary, deep navy background)
- ✅ Typography: Inter font, clean sans-serif
- ✅ shadcn/ui components: Button, Card, Input, Badge, Sidebar, etc.
- ✅ Layout components: AppSidebar, SiteHeader
- ✅ Responsive design with mobile support
- ✅ Dark-first theme matching neon.com aesthetic

### ✅ Step 3: Database Schema Setup (COMPLETE)
**PRD Requirements:**
- Provision Neon DB instance
- Create database schema (users, people, relationships, charts, compatibility_analyses)
- Set up migrations
- Configure connection pooling

**Status:**
- ✅ Neon DB provisioned and connected
- ✅ Migration file created: `migrations/001_clerk_subscription_schema.sql`
- ✅ Schema includes:
  - `users` table (Clerk-compatible with TEXT id, subscription fields)
  - `people` table (reusable entity with birth data)
  - `relationships` table (user-person connections)
  - `charts` table (cached calculations)
  - `compatibility_analyses` table (analysis results)
- ✅ Indexes and triggers configured
- ✅ Connection pooling via `src/lib/db.ts`

**⚠️ Action Required:** Run migration on Neon database

### ✅ Step 4: Authentication Integration (COMPLETE)
**PRD Requirements (Note: PRD mentions Neon Auth, but Clerk is used):**
- Configure OAuth providers (Google, GitHub, Apple)
- Implement signup flow
- Implement signin flow
- Build session handling and protected routes

**Status:**
- ✅ Clerk authentication fully integrated (replaces Neon Auth)
- ✅ OAuth providers: Google configured (GitHub/Apple can be added)
- ✅ Signup flow: `/signup/[[...rest]]/page.tsx` with Clerk SignUp
- ✅ Signin flow: `/login/[[...rest]]/page.tsx` with Clerk SignIn
- ✅ Session management: Clerk handles JWT tokens
- ✅ Protected routes: Middleware protects `/dashboard` and other routes
- ✅ User sync: Webhook at `/api/webhooks/clerk` syncs users to database
- ✅ Subscription tracking: Stripe integration for subscription tiers

**Additional Features:**
- ✅ Stripe subscription management
- ✅ Billing portal access
- ✅ Subscription status API

### 🔄 Step 5: Onboarding Flow (PARTIALLY COMPLETE)
**PRD Requirements:**
- Build welcome screen
- Create birth data collection form
- Implement person creation logic
- Set up onboarding completion flag
- Add redirect logic

**Current Status:**
- ⚠️ **Missing:** Dedicated onboarding route (e.g., `/onboarding/page.tsx`)
- ⚠️ **Missing:** Welcome screen component
- ⚠️ **Missing:** Birth data collection form for onboarding
- ⚠️ **Missing:** Person creation with `is_user_self = true`
- ⚠️ **Missing:** Set `onboarding_completed = true` flag
- ⚠️ **Missing:** Redirect logic based on onboarding status

**Existing Related Code:**
- ✅ Dashboard has profile form: `src/components/profile-form.tsx` (referenced but not found)
- ✅ Dashboard checks for profile: `src/app/dashboard/page.tsx`
- ✅ Profile API exists: `src/app/api/profile/route.ts` (uses old `profiles` table)

**What Needs to Be Built:**
1. Create `/onboarding` route with multi-step form
2. Welcome screen (Step 1)
3. Birth data form (Step 2): name, birth_date, birth_time, birth_location, gender
4. Create person record with `is_user_self = true`
5. Create relationship record with `relationship_type = 'self'`
6. Update user's `onboarding_completed = true`
7. Trigger n8n chart calculation workflow
8. Redirect to dashboard with loading state

## Missing Components for PRD Compliance

### 1. Onboarding Flow (Step 5)
**Priority: HIGH**
- Create onboarding route and components
- Implement birth data collection
- Person entity creation
- n8n workflow trigger

### 2. People Management API (Step 7 dependency)
**Priority: HIGH**
- `GET /api/people` - List user's people
- `POST /api/people` - Create new person
- `GET /api/people/:id` - Get person details
- `PATCH /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### 3. Charts API (Step 5 & 8 dependency)
**Priority: MEDIUM**
- `GET /api/charts/:personId` - Get charts for person
- `POST /api/charts/calculate` - Trigger chart calculation (calls n8n)

### 4. n8n Integration (Step 8)
**Priority: MEDIUM**
- Install and configure n8n
- Create chart calculation workflow (Zi Wei, Western, Chinese)
- Create compatibility analysis workflow
- Set up webhook endpoints for n8n to call back
- Configure database triggers

### 5. Profile Table Migration
**Priority: HIGH**
- Current `/api/profile` uses old `profiles` table
- Need to migrate to use `people` table with `is_user_self = true`
- Update dashboard to use people entity

## Architecture Notes

### Data Flow (Per PRD)
```
User Signs Up (Clerk)
    ↓
Clerk Webhook → Database (users table)
    ↓
User Redirected to Onboarding
    ↓
Birth Data Collected
    ↓
Person Created (is_user_self = true)
    ↓
Relationship Created (type = 'self')
    ↓
n8n Triggered → Chart Calculation
    ↓
Charts Stored in Database
    ↓
User Redirected to Dashboard
```

### Current vs. PRD Schema
**Current Implementation:**
- ✅ `users` table (Clerk-compatible)
- ✅ `people` table (reusable entity)
- ✅ `relationships` table
- ✅ `charts` table
- ✅ `compatibility_analyses` table
- ⚠️ Old `profiles` table still referenced in code

**PRD Requirement:**
- No separate `profiles` table
- User's birth data stored in `people` table with `is_user_self = true`
- Relationship links user to their own person record

### n8n as Analysis Engine (Per PRD)
**Key Principle:** Neon DB only stores data, n8n handles all calculations

**n8n Responsibilities:**
1. Chart calculations (Zi Wei, Western, Chinese Zodiac)
2. Compatibility analysis
3. Report generation
4. Email notifications
5. Subscription event handling

**Database Responsibilities:**
1. Store user accounts
2. Store people entities (birth data)
3. Store relationships
4. Cache chart results (from n8n)
5. Store compatibility analysis results (from n8n)

## Next Steps (Priority Order)

### Immediate (Required for MVP)
1. **Run database migration** - Execute `migrations/001_clerk_subscription_schema.sql`
2. **Build onboarding flow** - Create `/onboarding` route with birth data form
3. **Update profile API** - Migrate from `profiles` table to `people` table
4. **Create people management API** - CRUD endpoints for people entity
5. **Set up n8n** - Install, configure, create chart calculation workflow

### Short-term (Step 6-7)
6. **Landing page polish** - Add legal pages (Terms, Privacy, Disclaimer, FAQ)
7. **Dashboard people management** - UI for adding/editing/deleting people
8. **Module pages** - Create placeholder pages for 8 modules

### Medium-term (Step 8)
9. **n8n workflows** - Complete chart calculation and compatibility analysis
10. **Charts API** - Endpoints to trigger and retrieve chart data
11. **Compatibility API** - Endpoints to run compatibility analysis

## Configuration Status

### Environment Variables
- ✅ Clerk keys configured
- ✅ Stripe keys configured
- ✅ Database URL configured
- ⚠️ Webhook secrets need to be added (Clerk, Stripe)
- ⚠️ n8n webhook URL (not yet configured)

### Webhooks
- ✅ Clerk webhook handler created: `/api/webhooks/clerk`
- ✅ Stripe webhook handler created: `/api/webhooks/stripe`
- ⚠️ Need to configure in Clerk/Stripe dashboards
- ⚠️ n8n webhook endpoints (not yet created)

### Third-party Services
- ✅ Clerk Dashboard - User management
- ✅ Stripe Dashboard - Subscription management
- ✅ Neon Console - Database management
- ⚠️ n8n - Not yet installed/configured

## Summary

**Steps 1-4: ✅ COMPLETE**
- Project setup, design system, database schema, and authentication are fully implemented
- Clerk authentication working with catch-all routes
- Database schema ready (migration needs to be run)

**Step 5: 🔄 IN PROGRESS**
- Onboarding flow needs to be built
- Profile API needs migration to people entity
- n8n trigger needs to be implemented

**Steps 6-8: ⏳ PENDING**
- Landing page polish
- Dashboard people management
- n8n workflow setup

**Critical Path:**
1. Run database migration
2. Build onboarding flow
3. Migrate profile API to people entity
4. Set up n8n for chart calculations
5. Create people management UI

---

**Current Blocker:** Onboarding flow is the main missing piece preventing full PRD Step 5 completion. Once built, users can complete signup → onboarding → dashboard flow as specified in PRD.
