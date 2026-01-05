import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { upsertSubscription } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.text();
  const body = JSON.parse(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  console.log(`📥 Clerk webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const user = evt.data;
        const userId = user.id;

        // Check if user has active subscription from Clerk
        const publicMetadata = user.public_metadata || {};
        const subscriptionPlan = publicMetadata.subscription_plan || "free";
        const subscriptionStatus = publicMetadata.subscription_status || "active";

        console.log(`👤 User ${userId} - Plan: ${subscriptionPlan}, Status: ${subscriptionStatus}`);

        // Sync to database
        await upsertSubscription({
          userId,
          planName: subscriptionPlan,
          status: subscriptionStatus,
        });

        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        const subscription = evt.data;
        const userId = subscription.user_id;
        const planKey = subscription.plan_key || subscription.plan_id;

        // Map Clerk plan keys to plan names (based on Clerk Dashboard screenshot)
        let planName = "free";
        if (planKey === "starter_for_personal") {
          planName = "starter";
        } else if (planKey === "business_personal") {
          planName = "business";
        } else if (planKey === "free_user") {
          planName = "free";
        }

        const status = subscription.status || "active";
        const currentPeriodStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : undefined;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined;

        console.log(`💳 Subscription ${eventType} - User: ${userId}, Plan Key: ${planKey}, Plan Name: ${planName}`);

        await upsertSubscription({
          userId,
          planName,
          status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        });

        break;
      }

      case "subscription.deleted": {
        const subscription = evt.data;
        const userId = subscription.user_id;

        console.log(`❌ Subscription deleted - User: ${userId}`);

        await upsertSubscription({
          userId,
          planName: "free",
          status: "canceled",
        });

        break;
      }

      default:
        console.log(`⏭️ Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing Clerk webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
