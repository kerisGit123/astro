# PRD.md

## ZiWei Path – Destiny, Timing & Compatibility SaaS

---

## 1. Product Brief

**ZiWei Path** is a modern SaaS platform that combines **紫微斗數 (Zi Wei Dou Shu)**, **Western Zodiac**, and **Chinese Zodiac (生肖 / 五行)** to help users understand:

* Their life direction and personal strengths
* Relationship, partner, and compatibility dynamics
* Career, wealth, and decision timing
* Risk patterns and recurring challenges

The platform transforms traditional metaphysical systems into **structured, explainable, and actionable insights**, presented with a modern SaaS experience.

---

## 2. Core Value Proposition

> Ancient destiny systems, explained with modern clarity — helping users make better life, career, and relationship decisions.

Key differentiation:

* Multi-system integration (not single astrology method)
* Focus on **timing, compatibility, and self-awareness**
* SaaS UX instead of traditional fortune-telling presentation
* **Reusable people profiles** for multi-scenario analysis (relationships, business, compatibility)

---

## 3. Target Users

* Young professionals (18–40)
* Career-focused individuals
* Relationship-conscious users
* Entrepreneurs & founders
* Users interested in astrology, destiny, or self-development

---

## 4. Feature Scope (MVP)

The MVP includes the following 8 modules:

1. **Life Destiny Reader** – overall life direction and themes
2. **Love & Marriage Analyzer** – emotional style and partner suitability
3. **Career & Wealth Forecaster** – work alignment and money patterns
4. **Timing & Opportunity Reader** – when to act or wait
5. **Compatibility & Conflict Detector** – harmony and friction analysis
6. **Business Partner Evaluator** – collaboration and trust alignment
7. **Personality & Behavior Profiler** – decision and communication style
8. **Risk & Warning System** – recurring pitfalls and caution periods

---

## 5. Data Architecture & People Entity

### 5.1 Core Concept

The system uses a **People Entity** as the foundation for all chart calculations and compatibility analysis.

**Key Design Principles:**

* **User** = authenticated account holder
* **Person** = any individual with birth data (including the user themselves)
* **Relationship** = connection between user and person (self, partner, friend, business associate)

### 5.2 Database Schema

#### **Users Table**
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  auth_provider TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  onboarding_completed BOOLEAN DEFAULT false
)
```

#### **People Table** (Reusable Entity)
```sql
people (
  id UUID PRIMARY KEY,
  created_by_user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  birth_timezone TEXT,
  gender TEXT,
  is_user_self BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Relationships Table**
```sql
relationships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  person_id UUID REFERENCES people(id),
  relationship_type TEXT NOT NULL, -- 'self', 'romantic_partner', 'business_partner', 'friend', 'family'
  label TEXT, -- custom label like "My spouse", "Co-founder"
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, person_id, relationship_type)
)
```

#### **Charts Table** (Cached Calculations)
```sql
charts (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  chart_type TEXT NOT NULL, -- 'ziwei', 'western', 'chinese'
  chart_data JSONB NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW()
)
```

#### **Compatibility Analysis Table**
```sql
compatibility_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  person_a_id UUID REFERENCES people(id),
  person_b_id UUID REFERENCES people(id),
  analysis_type TEXT NOT NULL, -- 'love', 'business', 'friendship'
  result_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 5.3 Benefits of People Entity

1. **Reusability**: Same person can be analyzed across multiple contexts
   - Partner in love analysis
   - Same partner in business evaluation
   - Same partner in compatibility detector

2. **Multi-Person Analysis**: Users can add multiple people
   - Compare multiple potential partners
   - Evaluate team members
   - Analyze family dynamics

3. **Data Efficiency**: Birth data and charts calculated once, reused everywhere

4. **Privacy**: Users control their own people database

---

## 6. Authentication & User Flows

### 6.1 Authentication System

**Provider**: Neon Auth

**Supported Methods** (MVP):
* Google OAuth
* GitHub OAuth
* Apple Sign-In

### 6.2 Signup Flow

1. **Landing Page** → User clicks "Get Started"
2. **Auth Selection** → Choose social provider
3. **OAuth Redirect** → Provider authentication
4. **Account Creation** → User record created in database
5. **Onboarding** → Redirect to onboarding flow

### 6.3 Signin Flow

1. **Landing Page** → User clicks "Sign In"
2. **Auth Selection** → Choose social provider
3. **OAuth Redirect** → Provider authentication
4. **Session Check**:
   - If `onboarding_completed = false` → redirect to onboarding
   - If `onboarding_completed = true` → redirect to dashboard

### 6.4 Onboarding Flow (First-Time Users)

**Step 1: Welcome Screen**
* Brief explanation of what happens next
* "Let's create your destiny profile"

**Step 2: Birth Data Collection**
* Name (pre-filled from OAuth if available)
* Birth date (required)
* Birth time (optional but recommended)
* Birth location (optional but recommended)
* Gender (optional)

**Step 3: Profile Creation**
* Create person record with `is_user_self = true`
* Create relationship record with `relationship_type = 'self'`
* Set `onboarding_completed = true`
* Trigger chart calculation via n8n

**Step 4: Redirect to Dashboard**
* Show loading state while charts calculate
* Display initial insights when ready

### 6.5 Session Management

* JWT tokens managed by Neon Auth
* Session expiry: 7 days (configurable)
* Refresh token rotation enabled
* Secure httpOnly cookies

---

## 7. Tech Stack

### 7.1 Frontend

* **Next.js 14+ (App Router)**
* **shadcn/ui**
* **Tailwind CSS**
* **Lucide Icons**
* Dark-theme-first design
* Responsive (desktop → mobile)

### 7.2 Backend

* **Neon DB (PostgreSQL)**
  * User accounts
  * People profiles
  * Relationships
  * Chart cache
  * Compatibility results
  * Subscription state

* **Neon Auth**
  * Social OAuth (Google, GitHub, Apple)
  * Session management
  * JWT token handling

### 7.3 Automation & Integration

* **n8n**
  * Chart calculation workflows
  * Report generation pipelines
  * Compatibility analysis triggers
  * Email & notification flows
  * Subscription event handling

### 7.4 Future-Ready (Not MVP)

* AI interpretation layer
* API access for partners
* Multi-language support
* Mobile apps (React Native)

---

## 8. Design System & Color Scheme

### 8.1 Visual Direction

Inspired by **neon.com**, adapted for metaphysical content.

Design goals:

* Mystic but professional
* Calm, premium, trustworthy
* Data-driven rather than "fortune-teller"

### 8.2 Color Scheme (Neon-Inspired)

**Base Colors**

* Background: `#0a0a0f` (near-black)
* Surface cards: `#1a1a24` (slightly lighter)
* Borders: `#2a2a3a` (soft, low-contrast)

**Accent Colors**

* Primary: `#6366f1` (indigo)
* Secondary: `#06b6d4` (cyan)
* Emphasis: `#f59e0b` (amber, used sparingly)
* Success: `#10b981` (emerald)
* Warning: `#f59e0b` (amber)

**Usage Rules**

* No harsh reds
* No loud gradients
* Glow effects only on CTAs and focus states
* Text clarity > mystic aesthetics

### 8.3 Typography

* **Font**: Inter or similar clean sans-serif
* High readability
* Avoid calligraphy or decorative fonts
* Font sizes: 14px base, 12px small, 16px+ for headings

---

## 9. Front Page Requirements

### 9.1 Hero Section

* Clear headline explaining value
* Subheadline mentioning 紫微斗數 + Western + Chinese Zodiac
* Primary CTA: "Get Your Free Destiny Overview"
* Secondary CTA: "How It Works"
* Background: Subtle animated gradient or particle effect

### 9.2 Educational Sections

* **Why Choose This System**
* **What Can I Expect**
* **How It Works (3 steps)**
  1. Sign up & add your birth data
  2. Get your personalized charts
  3. Explore insights & compatibility

Tone:

* Informative
* Non-fatalistic
* Confidence without exaggeration

### 9.3 Conversion Sections

* Feature grid (8 modules with icons)
* Sample insights (non-personalized examples)
* Social proof (testimonials if available)
* Final CTA block with pricing preview

---

## 10. Dashboard & User Experience

### 10.1 Dashboard Layout (shadcn-based)

**Sidebar Navigation:**
* Overview
* My Profile
* Love & Marriage
* Career & Wealth
* Timing & Opportunities
* Compatibility Checker
* Business Partners
* Risk & Warnings
* Settings

**Top Bar:**
* User avatar & name
* Subscription tier badge
* Notifications icon
* Logout

### 10.2 Overview Page

* Welcome message with user's name
* Quick stats (charts calculated, people added, analyses run)
* Recent insights carousel
* Quick actions:
  - Add new person
  - Run compatibility check
  - View latest timing insights

### 10.3 Module Pages

Each module includes:

* **Summary Card**: Key insight at a glance
* **Visual Chart**: Interactive visualization
* **Detailed Explanation**: Structured breakdown
* **Action Guidance**: Practical next steps
* **Share/Export**: PDF or link sharing

### 10.4 People Management

**My People Page:**
* List of all people added by user
* Quick actions: View, Edit, Delete
* Add new person button
* Relationship type badges

**Add Person Flow:**
1. Name input
2. Birth data collection (same as onboarding)
3. Relationship type selection
4. Optional label/note
5. Save & trigger chart calculation

---

## 11. Legal & Compliance Pages

Required pages:

* **Terms of Use**
* **Privacy Policy**
* **Disclaimer** (no medical/legal/financial advice)
* **FAQ**

Key principles:

* No medical, legal, or financial claims
* Interpretative, educational positioning
* User data protection clarity
* GDPR compliance (data export, deletion)

---

## 12. Implementation Plan (8 Steps)

### Step 1: Project Setup
* Initialize Next.js 14 app with App Router
* Install shadcn/ui, Tailwind CSS, Lucide icons
* Configure dark theme and base layout
* Set up ESLint, Prettier, TypeScript

### Step 2: Design System & Theme
* Implement neon-inspired color tokens in Tailwind config
* Define typography, spacing, and card styles
* Build reusable UI components (Button, Card, Input, etc.)
* Create layout components (Sidebar, TopBar)

### Step 3: Database & Schema Setup
* Provision Neon DB instance
* Create database schema (users, people, relationships, charts, compatibility_analyses)
* Set up migrations
* Configure connection pooling

### Step 4: Authentication Integration
* Provision Neon Auth
* Configure OAuth providers (Google, GitHub, Apple)
* Implement signup flow
* Implement signin flow
* Build session handling and protected routes

### Step 5: Onboarding Flow
* Build welcome screen
* Create birth data collection form
* Implement person creation logic
* Set up onboarding completion flag
* Add redirect logic

### Step 6: Landing Page Development
* Hero section with CTAs
* Feature sections (8 modules)
* Educational content
* Conversion sections
* Footer with legal links

### Step 7: Dashboard & People Management
* Build sidebar navigation
* Create overview page
* Implement people management (list, add, edit, delete)
* Build relationship type selector
* Add placeholder module pages

### Step 8: n8n Workflow Setup
* Install and configure n8n
* Create chart calculation workflow (stubbed)
* Set up compatibility analysis workflow (stubbed)
* Configure database triggers
* Test end-to-end flow

### Step 9: MVP Polish & Launch Prep
* Content refinement
* Legal pages (Terms, Privacy, Disclaimer, FAQ)
* Performance optimization
* Mobile responsiveness check
* Security audit
* Deploy to production

---

## 13. Success Metrics (MVP)

* **Acquisition**: Landing page → signup conversion rate
* **Activation**: Signup → onboarding completion rate
* **Engagement**: 
  - People added per user
  - Compatibility analyses run
  - Time spent per module
* **Retention**: Return visits within 7 days
* **Revenue**: Free → paid interest signals

---

## 14. Product Philosophy

ZiWei Path is not about predicting fate —
it is about **understanding patterns, timing, and alignment**, empowering users to make better choices with clarity and confidence.

By creating reusable people profiles, we enable users to explore multiple life scenarios and relationships with the same foundational data, making insights more accessible and actionable.

---

## 15. API Endpoints (Reference)

### Authentication
* `POST /api/auth/signup` - Initiate OAuth signup
* `POST /api/auth/signin` - Initiate OAuth signin
* `POST /api/auth/signout` - End session
* `GET /api/auth/session` - Get current session

### People Management
* `GET /api/people` - List user's people
* `POST /api/people` - Create new person
* `GET /api/people/:id` - Get person details
* `PATCH /api/people/:id` - Update person
* `DELETE /api/people/:id` - Delete person

### Charts
* `GET /api/charts/:personId` - Get charts for person
* `POST /api/charts/calculate` - Trigger chart calculation

### Compatibility
* `POST /api/compatibility/analyze` - Run compatibility analysis
* `GET /api/compatibility/:id` - Get analysis results

### User
* `GET /api/user/profile` - Get user profile
* `PATCH /api/user/profile` - Update user profile
* `GET /api/user/subscription` - Get subscription status

---

**End of PRD**

