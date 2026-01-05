import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { upsertSubscription } from "@/lib/subscriptions";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    // Update subscription in database
    await upsertSubscription({
      userId,
      planName: planId,
      status: "active",
    });

    return NextResponse.json({ success: true, planId });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
