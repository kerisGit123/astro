# Stripe Credit Purchase - Implementation Guide (Neon DB)

## Quick Start Summary

This guide explains how the credit purchase system works with Stripe integration using Neon PostgreSQL database. The system allows users to buy credits (tokens) that are used for OCR scanning operations.

---

## System Flow Overview

```
User clicks "Buy Now" 
    ↓
Frontend calls /api/stripe/credits
    ↓
API creates Stripe Checkout Session
    ↓
User redirected to Stripe payment page
    ↓
User completes payment
    ↓
Stripe sends webhook to /api/stripe/webhook
    ↓
Webhook calls database function to add credits
    ↓
Database updated (ledger + balance)
    ↓
User sees updated balance on frontend
```

---

## Part 1: Stripe Connection Engine

### 1.1 Initialize Stripe Client

**File**: `lib/stripe.ts`

```typescript
import Stripe from "stripe";
import { env } from "./env";

// Initialize Stripe with your secret key
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
```

**What this does**:
- Creates a Stripe client instance
- Uses your secret key from environment variables
- This client is used to create checkout sessions and verify webhooks

**Required Environment Variable**:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### 1.2 Environment Configuration

**File**: `lib/env.ts`

```typescript
export const env = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
  // ... other env vars
};
```

**Complete `.env.local` setup**:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credit Pricing (Optional - defaults shown)
CREDITS_BASE_TOKENS=100
CREDITS_BASE_AMOUNT=2000  # RM20 in cents
CREDITS_CURRENCY=myr
```

---

## Part 2: Database Setup (Neon PostgreSQL)

### 2.1 Database Connection

**File**: `lib/db.ts`

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for local development
neonConfig.webSocketConstructor = ws;

// Create connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Helper function for queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
```

**Install Dependencies**:
```bash
npm install @neondatabase/serverless
npm install -D ws @types/ws
```

### 2.2 Database Schema

**Create Migration File**: `migrations/001_create_credits_tables.sql`

```sql
-- Transaction ledger (immutable audit log)
CREATE TABLE IF NOT EXISTS credits_ledger (
  id SERIAL PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL,
  tokens INTEGER NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  amount_paid INTEGER,
  currency VARCHAR(10),
  reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ledger_company_id ON credits_ledger(company_id);
CREATE INDEX idx_ledger_payment_intent ON credits_ledger(stripe_payment_intent_id);
CREATE INDEX idx_ledger_checkout_session ON credits_ledger(stripe_checkout_session_id);
CREATE INDEX idx_ledger_created_at ON credits_ledger(created_at DESC);

-- Current balance (denormalized for fast reads)
CREATE TABLE IF NOT EXISTS credits_balance (
  id SERIAL PRIMARY KEY,
  company_id VARCHAR(255) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_balance_company_id ON credits_balance(company_id);

-- Add comments for documentation
COMMENT ON TABLE credits_ledger IS 'Complete transaction history - never delete records';
COMMENT ON TABLE credits_balance IS 'Current credit balance per company - single row per company';
COMMENT ON COLUMN credits_ledger.tokens IS 'Positive = purchase, Negative = usage';
COMMENT ON COLUMN credits_ledger.amount_paid IS 'Amount in cents (smallest currency unit)';
```

**Run Migration**:
```bash
# Using psql
psql $DATABASE_URL -f migrations/001_create_credits_tables.sql

# Or using a migration tool like node-pg-migrate or Drizzle
```

**Why two tables?**
- **credits_ledger**: Complete transaction history (never delete)
- **credits_balance**: Fast balance lookups (single row per user)

---

## Part 3: API Endpoint Structure

### 3.1 Create Checkout Session Endpoint

**File**: `app/api/stripe/credits/route.ts`

**Purpose**: Creates a Stripe Checkout Session when user clicks "Buy Now"

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const { companyId, tokens, amount, currency = "myr" } = body;
    
    // 2. Validate inputs
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }
    if (!tokens || tokens <= 0) {
      return NextResponse.json({ error: "Invalid tokens" }, { status: 400 });
    }
    
    // 3. Calculate amount (if not provided)
    // Default: RM20 per 100 tokens
    const baseTokens = Number(process.env.CREDITS_BASE_TOKENS || 100);
    const baseAmount = Number(process.env.CREDITS_BASE_AMOUNT || 2000);
    const finalAmount = amount ?? Math.ceil((tokens / baseTokens) * baseAmount);
    
    // 4. Prepare redirect URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/manage-credit?credits_success=true`;
    const cancelUrl = `${appUrl}/manage-credit?credits_canceled=true`;
    
    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",                      // One-time payment
      payment_method_types: ["card"],       // Accept cards
      
      // Line items (what user is buying)
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(), // "myr", "usd", etc.
          unit_amount: finalAmount,         // Amount in cents
          product_data: {
            name: `${tokens} tokens`,
            description: `Purchase ${tokens} credits for OCR scanning`,
          },
        },
        quantity: 1,
      }],
      
      // Metadata (attached to session and payment intent)
      metadata: {
        type: "credits",                    // Identifies this as credit purchase
        companyId,                          // User/org identifier
        tokens: String(tokens),             // Number of credits
        currency,                           // Currency code
      },
      
      // Also attach metadata to payment intent
      payment_intent_data: {
        metadata: {
          type: "credits",
          companyId,
          tokens: String(tokens),
          currency,
        },
      },
      
      // Redirect URLs
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    
    // 6. Return checkout URL
    return NextResponse.json({ url: session.url });
    
  } catch (err: any) {
    console.error("/api/stripe/credits error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
```

**Key Points**:
- **Metadata is crucial**: It's how we identify credit purchases in webhooks
- **Metadata on both session AND payment_intent**: Ensures we can process either webhook event
- **Amount in cents**: Stripe uses smallest currency unit (100 cents = RM 1.00)
- **Currency lowercase**: Stripe requires lowercase currency codes

**Request Example**:
```json
POST /api/stripe/credits
{
  "companyId": "org_2abc123",
  "tokens": 300,
  "amount": 5000,
  "currency": "myr"
}
```

**Response Example**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3..."
}
```

### 3.2 Webhook Handler Endpoint

**File**: `app/api/stripe/webhook/route.ts`

**Purpose**: Receives notifications from Stripe when payment is completed

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";

// Important: Use Node.js runtime for raw body access
export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Get Stripe signature from headers
  const sig = req.headers.get("stripe-signature");
  
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  
  let event: any;
  
  try {
    // 2. Get raw request body (required for signature verification)
    const rawBody = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    // 3. Verify webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  // 4. Process webhook events
  try {
    switch (event.type) {
      
      // Event 1: Checkout session completed
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        
        // Only process credit purchases (not subscriptions)
        if (session.mode === "payment" && session.metadata?.type === "credits") {
          await handleCreditPurchase({
            companyId: session.metadata.companyId,
            tokens: Number(session.metadata.tokens),
            amountPaid: session.amount_total,
            currency: session.currency,
            paymentIntentId: session.payment_intent,
            sessionId: session.id,
          });
        }
        break;
      }
      
      // Event 2: Payment intent succeeded (backup)
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        
        // Only process credit purchases
        if (paymentIntent.metadata?.type === "credits") {
          await handleCreditPurchase({
            companyId: paymentIntent.metadata.companyId,
            tokens: Number(paymentIntent.metadata.tokens),
            amountPaid: paymentIntent.amount_received,
            currency: paymentIntent.currency,
            paymentIntentId: paymentIntent.id,
            sessionId: undefined,
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
  
  // 5. Always return success to Stripe
  return NextResponse.json({ received: true });
}

// Helper function to add credits
async function handleCreditPurchase(data: {
  companyId: string;
  tokens: number;
  amountPaid: number;
  currency: string;
  paymentIntentId?: string;
  sessionId?: string;
}) {
  const { companyId, tokens, amountPaid, currency, paymentIntentId, sessionId } = data;
  
  if (!companyId || !tokens || tokens <= 0) {
    console.error("Invalid credit purchase data:", data);
    return;
  }
  
  try {
    // Call database function to add credits
    await addCredits({
      companyId,
      tokens,
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: sessionId,
      amountPaid,
      currency,
      reason: "token_purchase",
    });
  } catch (error) {
    console.error("Failed to add credits:", error);
    throw error;
  }
}

// Database function to add credits
async function addCredits(args: {
  companyId: string;
  tokens: number;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  amountPaid?: number;
  currency?: string;
  reason?: string;
}) {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // ===== IDEMPOTENCY CHECK =====
    // Prevent duplicate credit additions if webhook is called multiple times
    if (args.stripePaymentIntentId || args.stripeCheckoutSessionId) {
      const checkQuery = `
        SELECT id FROM credits_ledger 
        WHERE (stripe_payment_intent_id = $1 OR stripe_checkout_session_id = $2)
        AND company_id = $3
        LIMIT 1
      `;
      const existingResult = await client.query(checkQuery, [
        args.stripePaymentIntentId,
        args.stripeCheckoutSessionId,
        args.companyId
      ]);
      
      if (existingResult.rows.length > 0) {
        console.log("Credits already added for this payment, skipping");
        await client.query('ROLLBACK');
        return { balance: 0, skipped: true };
      }
    }
    
    // ===== INSERT LEDGER ENTRY =====
    const insertLedgerQuery = `
      INSERT INTO credits_ledger (
        company_id, tokens, stripe_payment_intent_id, 
        stripe_checkout_session_id, amount_paid, currency, reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    await client.query(insertLedgerQuery, [
      args.companyId,
      args.tokens,
      args.stripePaymentIntentId,
      args.stripeCheckoutSessionId,
      args.amountPaid,
      args.currency,
      args.reason || "token_purchase"
    ]);
    
    // ===== UPDATE BALANCE =====
    // Use UPSERT (INSERT ... ON CONFLICT) to handle both new and existing balances
    const upsertBalanceQuery = `
      INSERT INTO credits_balance (company_id, balance, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (company_id) 
      DO UPDATE SET 
        balance = credits_balance.balance + $2,
        updated_at = NOW()
      RETURNING balance
    `;
    const balanceResult = await client.query(upsertBalanceQuery, [
      args.companyId,
      args.tokens
    ]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    return { balance: balanceResult.rows[0].balance };
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Key Points**:
- **Signature verification**: Ensures webhook is from Stripe, not an attacker
- **Raw body required**: Must use `req.text()` not `req.json()` for signature verification
- **Two events handled**: `checkout.session.completed` and `payment_intent.succeeded` for redundancy
- **Idempotency**: Prevents duplicate credits if webhook is sent multiple times
- **Transaction safety**: Uses PostgreSQL transactions to ensure data consistency
- **Always return 200**: Even if processing fails, return success to Stripe

**Webhook Events Explained**:

1. **checkout.session.completed**
   - Fired when checkout session is finalized
   - Contains session metadata
   - Primary event for credit addition

2. **payment_intent.succeeded**
   - Fired when payment is confirmed
   - Contains payment intent metadata
   - Backup event (in case checkout event is missed)

---

## Part 4: Database Query Functions

### 4.1 Get Current Balance

**File**: `lib/credits.ts`

```typescript
import { query, pool } from "./db";

export async function getBalance(companyId: string): Promise<number> {
  const result = await query(
    'SELECT balance FROM credits_balance WHERE company_id = $1',
    [companyId]
  );
  
  return result.rows[0]?.balance ?? 0;
}
```

### 4.2 Get Transaction History

```typescript
export async function listLedger(
  companyId: string, 
  limit: number = 50
): Promise<any[]> {
  const result = await query(
    `SELECT 
      id, company_id, tokens, stripe_payment_intent_id,
      stripe_checkout_session_id, amount_paid, currency,
      reason, created_at
    FROM credits_ledger 
    WHERE company_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2`,
    [companyId, limit]
  );
  
  return result.rows;
}
```

### 4.3 Consume Credits

```typescript
export async function consumeCredits(
  companyId: string,
  tokens: number,
  reason?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  const client = await pool.connect();
  
  try {
    if (tokens <= 0) {
      return { success: false, error: "tokens must be > 0" };
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check current balance (with row lock)
    const balanceResult = await client.query(
      'SELECT balance FROM credits_balance WHERE company_id = $1 FOR UPDATE',
      [companyId]
    );
    
    const currentBalance = balanceResult.rows[0]?.balance ?? 0;
    
    if (currentBalance < tokens) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: "Insufficient tokens",
        balance: currentBalance
      };
    }
    
    // Add negative ledger entry
    await client.query(
      `INSERT INTO credits_ledger (company_id, tokens, reason)
       VALUES ($1, $2, $3)`,
      [companyId, -tokens, reason || "credit_usage"]
    );
    
    // Update balance
    const newBalance = currentBalance - tokens;
    await client.query(
      `UPDATE credits_balance 
       SET balance = $1, updated_at = NOW() 
       WHERE company_id = $2`,
      [newBalance, companyId]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    return { success: true, balance: newBalance };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## Part 5: API Routes for Frontend

### 5.1 Get Balance Endpoint

**File**: `app/api/credits/balance/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getBalance } from "@/lib/credits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }
    
    const balance = await getBalance(companyId);
    return NextResponse.json({ balance });
    
  } catch (error: any) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get balance" },
      { status: 500 }
    );
  }
}
```

### 5.2 Get Ledger Endpoint

**File**: `app/api/credits/ledger/route.ts`

```typescript
import { NextResponse } from "next/server";
import { listLedger } from "@/lib/credits";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const limit = Number(searchParams.get("limit") || 50);
    
    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }
    
    const ledger = await listLedger(companyId, limit);
    return NextResponse.json({ ledger });
    
  } catch (error: any) {
    console.error("Get ledger error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get ledger" },
      { status: 500 }
    );
  }
}
```

---

## Part 6: Frontend Implementation

### 6.1 Purchase Button Handler

**File**: `app/manage-credit/page.tsx`

```typescript
const handleBuyCredits = async (tokens: number, price: number) => {
  // 1. Validate user is logged in
  if (!companyId) {
    setPurchaseStatus("Please sign in to purchase credits");
    return;
  }
  
  // 2. Set loading state
  setIsPurchasing(true);
  setPurchaseStatus("Creating checkout session...");
  
  try {
    // 3. Call API to create checkout session
    const response = await fetch("/api/stripe/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        tokens,
        amount: price * 100,  // Convert RM to cents
        currency: "myr",
      }),
    });
    
    const data = await response.json();
    
    // 4. Handle errors
    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }
    
    // 5. Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL received");
    }
    
  } catch (error) {
    console.error("Purchase error:", error);
    setPurchaseStatus(error.message);
    setIsPurchasing(false);
  }
};
```

### 6.2 Display Current Balance

```typescript
import { useEffect, useState } from "react";

const [balance, setBalance] = useState<number>(0);
const [loading, setLoading] = useState(true);

// Fetch balance
useEffect(() => {
  if (!companyId) return;
  
  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/credits/balance?companyId=${companyId}`);
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchBalance();
  
  // Refresh every 30 seconds
  const interval = setInterval(fetchBalance, 30000);
  return () => clearInterval(interval);
}, [companyId]);

// Display
<div>
  <p>Current Credits</p>
  <p className="text-6xl font-bold">{loading ? "..." : balance}</p>
</div>
```

### 6.3 Display Purchase History

```typescript
const [ledger, setLedger] = useState<any[]>([]);

// Fetch ledger
useEffect(() => {
  if (!companyId) return;
  
  const fetchLedger = async () => {
    try {
      const response = await fetch(`/api/credits/ledger?companyId=${companyId}&limit=100`);
      const data = await response.json();
      setLedger(data.ledger);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    }
  };
  
  fetchLedger();
}, [companyId]);

// Filter purchases only (positive tokens)
const purchases = useMemo(() => {
  return ledger.filter(entry => entry.tokens > 0);
}, [ledger]);

// Display in table
<table>
  <tbody>
    {purchases.map(purchase => (
      <tr key={purchase.id}>
        <td>{new Date(purchase.created_at).toLocaleDateString()}</td>
        <td>{purchase.tokens} credits</td>
        <td>
          {purchase.currency?.toUpperCase()}{" "}
          {(purchase.amount_paid / 100).toFixed(2)}
        </td>
        <td>Completed</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 6.4 Calculate Statistics

```typescript
const stats = useMemo(() => {
  if (!ledger) return { totalPurchased: 0, totalUsed: 0 };
  
  let purchased = 0;
  let used = 0;
  
  ledger.forEach(entry => {
    if (entry.tokens > 0) {
      purchased += entry.tokens;
    } else {
      used += Math.abs(entry.tokens);
    }
  });
  
  return { totalPurchased: purchased, totalUsed: used };
}, [ledger]);

// Display
<div>
  <p>Total Purchased: {stats.totalPurchased}</p>
  <p>Total Used: {stats.totalUsed}</p>
</div>
```

---

## Part 7: Data Flow Diagram

### Complete Purchase Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    User clicks "Buy 300 Credits - RM 50"                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND (page.tsx)                                      │
│    handleBuyCredits(300, 50)                                │
│    - Validates user is logged in                            │
│    - Sets loading state                                     │
│    - Calls API endpoint                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ POST /api/stripe/credits
                     │ { companyId, tokens: 300, amount: 5000 }
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API ENDPOINT (route.ts)                                  │
│    - Validates inputs                                       │
│    - Creates Stripe Checkout Session                        │
│    - Attaches metadata (type, companyId, tokens)            │
│    - Returns checkout URL                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Returns { url: "https://checkout.stripe.com/..." }
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REDIRECT                                                 │
│    window.location.href = checkoutUrl                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. STRIPE CHECKOUT PAGE                                     │
│    - User enters card details                               │
│    - Stripe processes payment                               │
│    - Payment succeeds                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─────────────────┬──────────────────────┐
                     │                 │                      │
                     ▼                 ▼                      ▼
         ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
         │ 6a. WEBHOOK      │  │ 6b. WEBHOOK  │  │ 6c. REDIRECT    │
         │ checkout.session │  │ payment_     │  │ User redirected │
         │ .completed       │  │ intent.      │  │ to success URL  │
         │                  │  │ succeeded    │  │                 │
         └────────┬─────────┘  └──────┬───────┘  └────────┬────────┘
                  │                   │                     │
                  │                   │                     │
                  ▼                   ▼                     │
         ┌────────────────────────────────────┐            │
         │ 7. WEBHOOK HANDLER                 │            │
         │    /api/stripe/webhook             │            │
         │    - Verifies signature            │            │
         │    - Extracts metadata             │            │
         │    - Calls database function       │            │
         └────────────────┬───────────────────┘            │
                          │                                │
                          ▼                                │
         ┌────────────────────────────────────┐            │
         │ 8. DATABASE TRANSACTION            │            │
         │    - Idempotency check             │            │
         │    - Insert ledger entry           │            │
         │    - Update/insert balance         │            │
         │    - Commit transaction            │            │
         └────────────────┬───────────────────┘            │
                          │                                │
                          ▼                                │
         ┌────────────────────────────────────┐            │
         │ 9. NEON DATABASE UPDATE            │            │
         │    credits_ledger: +300 tokens     │            │
         │    credits_balance: balance += 300 │            │
         └────────────────┬───────────────────┘            │
                          │                                │
                          │◄───────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────┐
         │ 10. FRONTEND UPDATE                │
         │     - User sees success message    │
         │     - Balance refreshes            │
         │     - Purchase appears in history  │
         └────────────────────────────────────┘
```

---

## Part 8: Testing Guide

### Local Testing Setup

**Step 1: Install Stripe CLI**
```bash
# Windows (using Scoop)
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

**Step 2: Login to Stripe**
```bash
stripe login
```

**Step 3: Forward Webhooks to Local Server**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Step 4: Add Webhook Secret to `.env.local`**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Step 5: Test Purchase Flow**

1. Start your dev server: `npm run dev`
2. Navigate to `/manage-credit`
3. Click "Buy Now" on any package
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future expiry date and any 3-digit CVC
6. Complete checkout
7. Watch Stripe CLI output for webhook events
8. Verify credits added in your app

### Test Cards

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | Requires 3D Secure |
| 4000 0000 0000 9995 | Declined |

### Manual Webhook Testing

Trigger specific events:
```bash
# Trigger checkout completed
stripe trigger checkout.session.completed

# Trigger payment succeeded
stripe trigger payment_intent.succeeded
```

### Database Verification

Check data directly in Neon:
```sql
-- Check balance
SELECT * FROM credits_balance WHERE company_id = 'your_company_id';

-- Check ledger
SELECT * FROM credits_ledger 
WHERE company_id = 'your_company_id' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for duplicates (should return 0)
SELECT stripe_payment_intent_id, COUNT(*) 
FROM credits_ledger 
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id 
HAVING COUNT(*) > 1;
```

---

## Part 9: Key Concepts Explained

### Why Metadata is Important

Metadata is how we connect Stripe payments to our application:

```typescript
metadata: {
  type: "credits",      // Identifies this as credit purchase (not subscription)
  companyId: "org_123", // Links payment to specific user/organization
  tokens: "300",        // How many credits to add
  currency: "myr"       // Currency for record keeping
}
```

Without metadata, we wouldn't know:
- Which user made the purchase
- How many credits to add
- Whether it's a credit purchase or subscription

### Why Two Webhook Events

We handle both `checkout.session.completed` and `payment_intent.succeeded` for redundancy:

- **Primary**: `checkout.session.completed` - Fired when session finalized
- **Backup**: `payment_intent.succeeded` - Fired when payment confirmed

If one event fails or is missed, the other ensures credits are added.

### Idempotency Explained

Stripe may send the same webhook multiple times. Without idempotency, credits would be added multiple times.

**Solution**: Check if payment already processed before adding credits:

```sql
SELECT id FROM credits_ledger 
WHERE (stripe_payment_intent_id = $1 OR stripe_checkout_session_id = $2)
AND company_id = $3
LIMIT 1
```

If a record exists, skip adding credits.

### Transaction Safety

PostgreSQL transactions ensure data consistency:

```typescript
await client.query('BEGIN');
// ... insert ledger
// ... update balance
await client.query('COMMIT');
```

If any operation fails, the entire transaction is rolled back. This prevents:
- Ledger entry without balance update
- Balance update without ledger entry
- Partial data corruption

### Amount in Cents

Stripe uses the smallest currency unit:
- **MYR**: 100 cents = RM 1.00
- **USD**: 100 cents = $1.00
- **JPY**: 1 = ¥1 (no decimal)

**Example**:
```typescript
// RM 50.00 = 5000 cents
const amount = 5000;

// Display to user
const displayAmount = amount / 100; // 50.00
```

---

## Part 10: Common Issues & Solutions

### Issue 1: Webhook Signature Verification Failed

**Error**: `Invalid signature`

**Causes**:
- Wrong webhook secret
- Body was parsed as JSON before verification
- Webhook secret from wrong environment (test vs live)

**Solution**:
```typescript
// ✅ CORRECT: Use raw body
const rawBody = await req.text();
const event = stripe.webhooks.constructEvent(rawBody, sig, secret);

// ❌ WRONG: Don't parse as JSON first
const body = await req.json(); // This breaks signature verification
```

### Issue 2: Credits Not Added After Payment

**Possible Causes**:
1. Webhook not configured in Stripe Dashboard
2. Webhook secret incorrect
3. Metadata not attached to session
4. Database connection failed
5. Transaction rolled back due to error

**Debug Steps**:
1. Check Stripe Dashboard → Webhooks → View events
2. Check webhook endpoint logs
3. Verify metadata in Stripe Dashboard
4. Check database logs
5. Query database directly to verify data

### Issue 3: Credits Added Twice

**Cause**: Idempotency check not working

**Solution**: Verify both `stripe_payment_intent_id` and `stripe_checkout_session_id` are stored and checked

**Debug Query**:
```sql
-- Find duplicate payments
SELECT stripe_payment_intent_id, COUNT(*) as count
FROM credits_ledger
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id
HAVING COUNT(*) > 1;
```

### Issue 4: Database Connection Errors

**Error**: `Connection timeout` or `Too many connections`

**Causes**:
- Connection pool exhausted
- Database not accessible
- SSL mode misconfigured

**Solutions**:
```typescript
// Use connection pooling
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Always release connections
const client = await pool.connect();
try {
  // ... queries
} finally {
  client.release(); // Important!
}
```

### Issue 5: Checkout Session Creation Fails

**Error**: `Invalid currency`

**Solution**: Ensure currency is lowercase
```typescript
currency: "myr" // ✅ Correct
currency: "MYR" // ❌ Wrong
```

---

## Part 11: Production Checklist

Before going live:

- [ ] Replace test Stripe keys with live keys
- [ ] Update webhook endpoint to production URL in Stripe Dashboard
- [ ] Configure webhook events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Test with real card (small amount)
- [ ] Verify webhook signature validation works
- [ ] Test all credit packages
- [ ] Verify purchase history displays correctly
- [ ] Test balance updates in real-time
- [ ] Monitor Stripe Dashboard for first few transactions
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure email receipts in Stripe Dashboard
- [ ] Test refund scenario (if applicable)
- [ ] Document customer support procedures
- [ ] Set up database backups in Neon
- [ ] Configure connection pooling for production load
- [ ] Add database indexes for performance
- [ ] Set up monitoring for database queries
- [ ] Test concurrent purchases (race conditions)

---

## Part 12: Neon-Specific Optimizations

### Connection Pooling

**File**: `lib/db.ts`

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure for serverless
neonConfig.fetchConnectionCache = true;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Indexes for Performance

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_ledger_company_created 
ON credits_ledger(company_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_ledger_payment_intent 
ON credits_ledger(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_ledger_checkout_session 
ON credits_ledger(stripe_checkout_session_id) 
WHERE stripe_checkout_session_id IS NOT NULL;
```

### Query Optimization

```typescript
// Use prepared statements for better performance
export async function getBalanceOptimized(companyId: string) {
  const result = await pool.query({
    text: 'SELECT balance FROM credits_balance WHERE company_id = $1',
    values: [companyId],
    rowMode: 'array' // Faster than object mode
  });
  
  return result.rows[0]?.[0] ?? 0;
}
```

---

## Summary

### The Three Key Components

1. **API Endpoint** (`/api/stripe/credits`)
   - Creates Stripe Checkout Session
   - Attaches metadata
   - Returns checkout URL

2. **Webhook Handler** (`/api/stripe/webhook`)
   - Receives payment notifications
   - Verifies signature
   - Calls database function

3. **Database Functions** (PostgreSQL)
   - Idempotency check
   - Updates ledger
   - Updates balance
   - Transaction safety

### The Flow in Simple Terms

1. User clicks "Buy Now"
2. API creates Stripe checkout
3. User pays on Stripe's site
4. Stripe sends webhook to our server
5. Webhook adds credits to Neon database
6. User sees updated balance

### Critical Success Factors

- ✅ Metadata on both session and payment intent
- ✅ Webhook signature verification
- ✅ Idempotency checks
- ✅ Amount in cents (not dollars)
- ✅ Currency lowercase
- ✅ Raw body for webhook verification
- ✅ PostgreSQL transactions for data consistency
- ✅ Connection pooling for performance
- ✅ Proper error handling and rollbacks

### Key Differences from Convex

| Aspect | Convex | Neon DB |
|--------|--------|---------|
| Database | NoSQL (Document) | PostgreSQL (Relational) |
| Queries | JavaScript API | SQL |
| Transactions | Automatic | Manual (BEGIN/COMMIT) |
| Idempotency | Query filters | SQL WHERE clauses |
| Connection | Direct client | Connection pooling |
| Schema | TypeScript validators | SQL DDL |
| Real-time | Built-in subscriptions | Manual polling/webhooks |

---

## Next Steps

1. **Set up Neon Database**
   - Create account at neon.tech
   - Create new project
   - Copy connection string

2. **Run Migrations**
   - Create tables using provided SQL
   - Add indexes for performance

3. **Configure Environment**
   - Add DATABASE_URL to .env.local
   - Add Stripe keys
   - Add webhook secret

4. **Test Locally**
   - Use Stripe CLI for webhooks
   - Test purchase flow
   - Verify database updates

5. **Deploy to Production**
   - Update environment variables
   - Configure production webhooks
   - Monitor first transactions
