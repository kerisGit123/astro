import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        // Note: NEXT_PUBLIC_ vars are available on server side in Next.js
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
        const successUrl = `${appUrl}/dashboard/credits?credits_success=true`;
        const cancelUrl = `${appUrl}/dashboard/credits?credits_canceled=true`;
        
        console.log('🔗 Using app URL:', appUrl);
        console.log('✅ Success URL:', successUrl);

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
