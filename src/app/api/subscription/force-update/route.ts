import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pool } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the subscription from database
    const subResult = await pool.query(
      "SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    const stripeSubId = subResult.rows[0]?.stripe_subscription_id;
    
    if (!stripeSubId) {
      return NextResponse.json({ error: "No Stripe subscription found" }, { status: 404 });
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubId);
    
    // Extract timestamps
    const periodStart = (subscription as any).current_period_start;
    const periodEnd = (subscription as any).current_period_end;
    
    console.log('Raw timestamps from Stripe:', { periodStart, periodEnd });
    console.log('Converted dates:', {
      start: new Date(periodStart * 1000),
      end: new Date(periodEnd * 1000)
    });

    // Update database directly
    const updateResult = await pool.query(
      `UPDATE subscriptions 
       SET current_period_start = $1,
           current_period_end = $2,
           updated_at = NOW()
       WHERE user_id = $3
       RETURNING *`,
      [
        new Date(periodStart * 1000),
        new Date(periodEnd * 1000),
        userId
      ]
    );

    return NextResponse.json({
      success: true,
      subscription: updateResult.rows[0],
      rawTimestamps: { periodStart, periodEnd }
    });
  } catch (error) {
    console.error("Force update error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
