import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import Stripe from "stripe"

const sql = neon(process.env.DATABASE_URL!)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 })
    }

    // Get package details
    const packages = await sql`
      SELECT * FROM token_packages WHERE id = ${packageId} AND is_active = true
    `

    if (packages.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    const tokenPackage = packages[0]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "fpx"],
      line_items: [
        {
          price_data: {
            currency: tokenPackage.currency.toLowerCase(),
            product_data: {
              name: tokenPackage.name,
              description: tokenPackage.description,
            },
            unit_amount: tokenPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        packageId,
        tokenAmount: String(tokenPackage.token_amount + tokenPackage.bonus_tokens),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
