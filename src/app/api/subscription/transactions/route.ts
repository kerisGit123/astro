import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription transaction history
    const result = await pool.query(
      `SELECT 
        id,
        stripe_invoice_id,
        amount,
        currency,
        status,
        plan_name,
        description,
        invoice_url,
        created_at
      FROM subscription_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
      [userId]
    );

    return NextResponse.json({ transactions: result.rows });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}
