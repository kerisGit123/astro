# Stripe Credit Purchase - Implementation Guide

## Quick Start Summary

This guide explains how the credit purchase system works with Stripe integration. The system allows users to buy credits (tokens) that are used for OCR scanning operations.

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
Webhook calls Convex mutation to add credits
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
  // ... other env vars
};
```

**Complete `.env.local` setup**:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Credit Pricing (Optional - defaults shown)
CREDITS_BASE_TOKENS=100
CREDITS_BASE_AMOUNT=2000  # RM20 in cents
CREDITS_CURRENCY=myr
```

---

## Part 2: API Endpoint Structure

### 2.1 Create Checkout Session Endpoint

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

### 2.2 Webhook Handler Endpoint

**File**: `app/api/stripe/webhook/route.ts`

**Purpose**: Receives notifications from Stripe when payment is completed

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import convex from "@/lib/ConvexClient";
import { api } from "@/convex/_generated/api";

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
  
  // Call Convex mutation to add credits
  await convex.mutation(api.credits.addCredits, {
    companyId,
    tokens,
    stripePaymentIntentId: paymentIntentId,
    stripeCheckoutSessionId: sessionId,
    amountPaid,
    currency,
  });
}
```

**Key Points**:
- **Signature verification**: Ensures webhook is from Stripe, not an attacker
- **Raw body required**: Must use `req.text()` not `req.json()` for signature verification
- **Two events handled**: `checkout.session.completed` and `payment_intent.succeeded` for redundancy
- **Idempotency**: Handled in Convex mutation (see next section)
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

## Part 3: Database Operations (Convex)

### 3.1 Schema Definition

**File**: `convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Transaction ledger (immutable audit log)
  credits_ledger: defineTable({
    companyId: v.string(),                    // User/org identifier
    tokens: v.number(),                       // Positive = purchase, Negative = usage
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    amountPaid: v.optional(v.number()),       // Amount in cents
    currency: v.optional(v.string()),         // "myr", "usd", etc.
    reason: v.optional(v.string()),           // "token_purchase", "ocr_scan", etc.
    createdAt: v.number(),                    // Timestamp
  }).index("by_companyId", ["companyId"]),
  
  // Current balance (denormalized for fast reads)
  credits_balance: defineTable({
    companyId: v.string(),                    // User/org identifier
    balance: v.number(),                      // Current credit balance
    updatedAt: v.number(),                    // Last update timestamp
  }).index("by_companyId", ["companyId"]),
});
```

**Why two tables?**
- **credits_ledger**: Complete transaction history (never delete)
- **credits_balance**: Fast balance lookups (single row per user)

### 3.2 Add Credits Mutation

**File**: `convex/credits.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addCredits = mutation({
  args: {
    companyId: v.string(),
    tokens: v.number(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    amountPaid: v.optional(v.number()),
    currency: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // ===== IDEMPOTENCY CHECK =====
    // Prevent duplicate credit additions if webhook is called multiple times
    if (args.stripePaymentIntentId || args.stripeCheckoutSessionId) {
      const existing = await ctx.db
        .query("credits_ledger")
        .withIndex("by_companyId", q => q.eq("companyId", args.companyId))
        .filter(q =>
          q.or(
            q.eq(q.field("stripePaymentIntentId"), args.stripePaymentIntentId),
            q.eq(q.field("stripeCheckoutSessionId"), args.stripeCheckoutSessionId)
          )
        )
        .first();
      
      if (existing) {
        console.log("Credits already added for this payment, skipping");
        return { balance: 0, skipped: true };
      }
    }
    
    // ===== INSERT LEDGER ENTRY =====
    await ctx.db.insert("credits_ledger", {
      companyId: args.companyId,
      tokens: args.tokens,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      amountPaid: args.amountPaid,
      currency: args.currency,
      reason: args.reason ?? "token_purchase",
      createdAt: now,
    });
    
    // ===== UPDATE BALANCE =====
    const balanceRow = await ctx.db
      .query("credits_balance")
      .withIndex("by_companyId", q => q.eq("companyId", args.companyId))
      .first();
    
    if (balanceRow) {
      // Update existing balance
      const newBalance = balanceRow.balance + args.tokens;
      await ctx.db.patch(balanceRow._id, {
        balance: newBalance,
        updatedAt: now,
      });
      return { balance: newBalance };
    } else {
      // Create new balance record
      await ctx.db.insert("credits_balance", {
        companyId: args.companyId,
        balance: args.tokens,
        updatedAt: now,
      });
      return { balance: args.tokens };
    }
  },
});
```

**Idempotency Explained**:
- Checks if payment already processed using Stripe IDs
- Prevents duplicate credits if webhook is sent multiple times
- Critical for financial accuracy

### 3.3 Query Functions

**Get Current Balance**:
```typescript
export const getBalance = query({
  args: { companyId: v.string() },
  handler: async (ctx, { companyId }) => {
    const row = await ctx.db
      .query("credits_balance")
      .withIndex("by_companyId", q => q.eq("companyId", companyId))
      .first();
    return row?.balance ?? 0;
  },
});
```

**Get Transaction History**:
```typescript
export const listLedger = query({
  args: {
    companyId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { companyId, limit = 50 }) => {
    const results = await ctx.db
      .query("credits_ledger")
      .withIndex("by_companyId", q => q.eq("companyId", companyId))
      .order("desc")
      .take(limit);
    return results;
  },
});
```

**Consume Credits** (for usage tracking):
```typescript
export const consumeCredits = mutation({
  args: {
    companyId: v.string(),
    tokens: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { companyId, tokens, reason }) => {
    const now = Date.now();
    
    if (tokens <= 0) {
      throw new Error("tokens must be > 0");
    }
    
    // Check current balance
    const balanceRow = await ctx.db
      .query("credits_balance")
      .withIndex("by_companyId", q => q.eq("companyId", companyId))
      .first();
    
    const currentBalance = balanceRow?.balance ?? 0;
    
    if (currentBalance < tokens) {
      return {
        success: false,
        error: "Insufficient tokens",
        balance: currentBalance
      };
    }
    
    // Add negative ledger entry
    await ctx.db.insert("credits_ledger", {
      companyId,
      tokens: -tokens,  // Negative for usage
      createdAt: now,
      reason,
    });
    
    // Update balance
    const newBalance = currentBalance - tokens;
    if (balanceRow) {
      await ctx.db.patch(balanceRow._id, {
        balance: newBalance,
        updatedAt: now,
      });
    }
    
    return { success: true, balance: newBalance };
  },
});
```

---

## Part 4: Frontend Implementation

### 4.1 Purchase Button Handler

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

### 4.2 Display Current Balance

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Fetch balance
const balance = useQuery(
  api.credits.getBalance,
  companyId ? { companyId } : "skip"
);

// Display
<div>
  <p>Current Credits</p>
  <p className="text-6xl font-bold">{balance ?? 0}</p>
</div>
```

### 4.3 Display Purchase History

```typescript
// Fetch ledger
const ledger = useQuery(
  api.credits.listLedger,
  companyId ? { companyId, limit: 100 } : "skip"
);

// Filter purchases only (positive tokens)
const purchases = useMemo(() => {
  if (!ledger) return [];
  return ledger.filter(entry => entry.tokens > 0);
}, [ledger]);

// Display in table
<table>
  <tbody>
    {purchases.map(purchase => (
      <tr key={purchase._id}>
        <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
        <td>{purchase.tokens} credits</td>
        <td>
          {purchase.currency?.toUpperCase()}{" "}
          {(purchase.amountPaid / 100).toFixed(2)}
        </td>
        <td>Completed</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 4.4 Calculate Statistics

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

## Part 5: Data Flow Diagram

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
         │    - Calls Convex mutation         │            │
         └────────────────┬───────────────────┘            │
                          │                                │
                          ▼                                │
         ┌────────────────────────────────────┐            │
         │ 8. CONVEX MUTATION                 │            │
         │    api.credits.addCredits          │            │
         │    - Idempotency check             │            │
         │    - Insert ledger entry           │            │
         │    - Update balance                │            │
         └────────────────┬───────────────────┘            │
                          │                                │
                          ▼                                │
         ┌────────────────────────────────────┐            │
         │ 9. DATABASE UPDATE                 │            │
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
         │     - Balance refreshes (694)      │
         │     - Purchase appears in history  │
         └────────────────────────────────────┘
```

---

## Part 6: Testing Guide

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

---

## Part 7: Key Concepts Explained

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

```typescript
// Check if this payment was already processed
const existing = await db.query("credits_ledger")
  .filter(q => 
    q.eq(q.field("stripePaymentIntentId"), paymentIntentId)
  )
  .first();

if (existing) {
  return { skipped: true }; // Already processed, skip
}
```

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

## Part 8: Common Issues & Solutions

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
4. Convex mutation failed

**Debug Steps**:
1. Check Stripe Dashboard → Webhooks → View events
2. Check webhook endpoint logs
3. Verify metadata in Stripe Dashboard
4. Check Convex logs

### Issue 3: Credits Added Twice

**Cause**: Idempotency check not working

**Solution**: Verify both `stripePaymentIntentId` and `stripeCheckoutSessionId` are stored and checked

### Issue 4: Checkout Session Creation Fails

**Error**: `Invalid currency`

**Solution**: Ensure currency is lowercase
```typescript
currency: "myr" // ✅ Correct
currency: "MYR" // ❌ Wrong
```

---

## Part 9: Production Checklist

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
   - Calls Convex mutation

3. **Convex Mutation** (`api.credits.addCredits`)
   - Idempotency check
   - Updates ledger
   - Updates balance

### The Flow in Simple Terms

1. User clicks "Buy Now"
2. API creates Stripe checkout
3. User pays on Stripe's site
4. Stripe sends webhook to our server
5. Webhook adds credits to database
6. User sees updated balance

### Critical Success Factors

- ✅ Metadata on both session and payment intent
- ✅ Webhook signature verification
- ✅ Idempotency checks
- ✅ Amount in cents (not dollars)
- ✅ Currency lowercase
- ✅ Raw body for webhook verification
