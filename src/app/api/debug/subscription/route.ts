import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription
    const subResult = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    // Check transactions
    const txResult = await pool.query(
      "SELECT * FROM subscription_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    return NextResponse.json({
      userId,
      subscription: subResult.rows[0] || null,
      transactions: txResult.rows,
      hasSubscription: subResult.rows.length > 0,
      hasTransactions: txResult.rows.length > 0
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
