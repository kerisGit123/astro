import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Get organization memberships (subscriptions are often org-based)
    const orgMemberships = await client.users.getOrganizationMembershipList({ userId });

    return NextResponse.json({
      userId: user.id,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      organizationMemberships: orgMemberships.data,
      // Check if user has any Clerk subscriptions
      hasSubscriptions: orgMemberships.data.length > 0
    });
  } catch (error) {
    console.error("Check Clerk error:", error);
    return NextResponse.json(
      { error: "Failed to check Clerk data" },
      { status: 500 }
    );
  }
}
