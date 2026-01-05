import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { upsertSubscription } from "@/lib/subscriptions";
import { pool } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID from database or create one
    const subResult = await pool.query(
      "SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    let customerId = subResult.rows[0]?.stripe_customer_id;

    if (!customerId) {
      // Search for customer by metadata
      const customers = await stripe.customers.list({
        limit: 100,
      });
      
      const customer = customers.data.find(c => c.metadata?.userId === userId);
      customerId = customer?.id;
    }

    if (!customerId) {
      return NextResponse.json({ 
        error: "No Stripe customer found. Please subscribe first.",
        plan: "free"
      }, { status: 404 });
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription, set to free
      await upsertSubscription({
        userId,
        stripeCustomerId: customerId,
        planName: 'free',
        status: 'active',
      });

      return NextResponse.json({ 
        success: true, 
        plan: 'free',
        message: 'No active subscription found in Stripe'
      });
    }

    // Sync the active subscription
    const subscription = subscriptions.data[0];
    
    // Determine plan name from subscription metadata or price
    const planName = subscription.metadata?.planId || 'starter';
    
    // Extract period dates - Stripe SDK returns these as numbers (Unix timestamps)
    const periodStart = (subscription as any).current_period_start;
    const periodEnd = (subscription as any).current_period_end;
    
    await upsertSubscription({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planName,
      status: subscription.status,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Also create transaction record if we can find the invoice
    const latestInvoice = subscription.latest_invoice;
    if (latestInvoice && typeof latestInvoice === 'string') {
      const invoice = await stripe.invoices.retrieve(latestInvoice);
      
      await pool.query(
        `INSERT INTO subscription_transactions 
        (user_id, stripe_invoice_id, stripe_payment_intent_id, amount, currency, status, plan_name, description, invoice_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (stripe_invoice_id) DO NOTHING`,
        [
          userId,
          invoice.id,
          (invoice as any).payment_intent,
          invoice.amount_paid,
          invoice.currency,
          invoice.status || 'paid',
          planName,
          `Monthly subscription - ${planName} plan`,
          invoice.hosted_invoice_url,
        ]
      );
    }

    return NextResponse.json({ 
      success: true, 
      plan: planName,
      status: subscription.status,
      nextBilling: periodEnd ? new Date(periodEnd * 1000).toISOString() : null
    });
  } catch (error) {
    console.error("Sync from Stripe error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
