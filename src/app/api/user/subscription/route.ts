import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT subscription_tier, stripe_customer_id, stripe_subscription_id FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { subscription_tier: 'free', hasSubscription: false },
        { status: 200 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
      subscription_tier: user.subscription_tier || 'free',
      hasSubscription: !!user.stripe_subscription_id,
      stripe_customer_id: user.stripe_customer_id,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
