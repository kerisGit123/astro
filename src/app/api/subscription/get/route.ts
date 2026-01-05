import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/subscriptions";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription(userId);

    // If no subscription exists, return free plan
    if (!subscription) {
      return NextResponse.json({
        plan_name: "free",
        status: "active",
        cancel_at_period_end: false
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}
