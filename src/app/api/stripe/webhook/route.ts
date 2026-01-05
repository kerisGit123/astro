import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addCredits } from '@/lib/credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')
  
  if (!signature) {
    console.error('❌ No stripe-signature header found')
    return NextResponse.json({ error: 'No signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Webhook signature verified successfully')
    console.log('📦 Event type:', event.type)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('🔍 Checkout session details:', {
          mode: session.mode,
          metadata: session.metadata,
          client_reference_id: session.client_reference_id,
          subscription: session.subscription,
          customer: session.customer
        })

        // Handle credit purchases
        if (session.mode === "payment" && session.metadata?.type === "credits") {
          await addCredits({
            companyId: session.metadata.companyId,
            tokens: Number(session.metadata.tokens),
            stripePaymentIntentId: session.payment_intent as string,
            stripeCheckoutSessionId: session.id,
            amountPaid: session.amount_total || 0,
            currency: session.currency || 'myr',
            reason: "token_purchase",
          })
          console.log('✅ Credits added via new system for:', session.metadata.companyId)
        }

        // Handle subscription purchases
        if (session.mode === "subscription") {
          console.log('🔔 Subscription checkout detected!')
          const { upsertSubscription } = await import('@/lib/subscriptions')
          const { pool } = await import('@/lib/db')
          
          const userId = session.client_reference_id || session.metadata?.userId
          const planId = session.metadata?.planId || 'starter'
          
          console.log('👤 User ID:', userId, 'Plan ID:', planId)
          
          if (!userId) {
            console.error('❌ No userId found in session!')
            break
          }
          
          if (!session.subscription) {
            console.error('❌ No subscription ID in session!')
            break
          }
          
          try {
            // Get the subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            console.log('📋 Retrieved subscription from Stripe:', subscription.id, 'Status:', subscription.status)
            
            // Extract period dates - Stripe SDK returns these as numbers (Unix timestamps)
            const periodStart = (subscription as any).current_period_start
            const periodEnd = (subscription as any).current_period_end
            
            console.log('📅 Period timestamps:', { periodStart, periodEnd })
            
            // Update subscription in database
            await upsertSubscription({
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              planName: planId,
              status: subscription.status,
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
              cancelAtPeriodEnd: subscription.cancel_at_period_end
            })
            
            console.log('✅ Subscription upserted to database')
            
            // Create transaction record
            if (session.invoice) {
              const invoice = await stripe.invoices.retrieve(session.invoice as string)
              console.log('💰 Creating transaction record for invoice:', invoice.id)
              
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
                  planId,
                  `Monthly subscription - ${planId} plan`,
                  invoice.hosted_invoice_url,
                ]
              )
              
              console.log('✅ Transaction record created')
            }
            
            console.log('✅ Subscription created via checkout:', planId, 'for user:', userId)
          } catch (error) {
            console.error('❌ Error processing subscription:', error)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        // Skip this event - we handle credits in checkout.session.completed
        // This prevents double-crediting since both events fire for the same payment
        console.log('⏭️ Skipping payment_intent.succeeded - credits handled by checkout.session.completed')
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const session = subscription.metadata?.userId ? subscription : null
        
        if (session && subscription.metadata?.type === 'subscription') {
          const { upsertSubscription } = await import('@/lib/subscriptions')
          
          await upsertSubscription({
            userId: subscription.metadata.userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            planName: subscription.metadata.planId || 'free',
            status: subscription.status,
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
          })
          
          console.log('✅ Subscription synced:', subscription.metadata.planId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        if (subscription.metadata?.userId) {
          const { upsertSubscription } = await import('@/lib/subscriptions')
          
          await upsertSubscription({
            userId: subscription.metadata.userId,
            planName: 'free',
            status: 'canceled'
          })
          
          console.log('✅ Subscription canceled, reverted to free')
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
