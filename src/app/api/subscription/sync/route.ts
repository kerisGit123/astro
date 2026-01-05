import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { upsertSubscription } from "@/lib/subscriptions";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Clerk to check subscription
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Check public metadata for subscription info
    const publicMetadata = user.publicMetadata || {};
    const subscriptionPlan = (publicMetadata.subscription_plan as string) || "free";
    const subscriptionStatus = (publicMetadata.subscription_status as string) || "active";

    console.log(`🔄 Manual sync - User: ${userId}, Plan: ${subscriptionPlan}, Status: ${subscriptionStatus}`);

    // Sync to database
    await upsertSubscription({
      userId,
      planName: subscriptionPlan,
      status: subscriptionStatus,
    });

    return NextResponse.json({ 
      success: true, 
      plan: subscriptionPlan,
      status: subscriptionStatus 
    });
  } catch (error) {
    console.error("Sync subscription error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
