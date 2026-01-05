import { query, pool } from "./db";

export interface Subscription {
  id: number;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_name: string;
  status: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get user's current subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const result = await query(
    'SELECT * FROM subscriptions WHERE user_id = $1',
    [userId]
  );

  return result.rows[0] || null;
}

/**
 * Create or update subscription
 */
export async function upsertSubscription(data: {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planName: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}): Promise<Subscription> {
  const result = await query(
    `INSERT INTO subscriptions (
      user_id, stripe_customer_id, stripe_subscription_id, 
      plan_name, status, current_period_start, current_period_end, 
      cancel_at_period_end, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      stripe_customer_id = COALESCE($2, subscriptions.stripe_customer_id),
      stripe_subscription_id = COALESCE($3, subscriptions.stripe_subscription_id),
      plan_name = $4,
      status = $5,
      current_period_start = $6,
      current_period_end = $7,
      cancel_at_period_end = $8,
      updated_at = NOW()
    RETURNING *`,
    [
      data.userId,
      data.stripeCustomerId || null,
      data.stripeSubscriptionId || null,
      data.planName,
      data.status,
      data.currentPeriodStart || null,
      data.currentPeriodEnd || null,
      data.cancelAtPeriodEnd || false
    ]
  );

  return result.rows[0];
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string): Promise<void> {
  await query(
    `UPDATE subscriptions 
     SET cancel_at_period_end = TRUE, updated_at = NOW() 
     WHERE user_id = $1`,
    [userId]
  );
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const result = await query(
    'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
    [stripeSubscriptionId]
  );

  return result.rows[0] || null;
}
