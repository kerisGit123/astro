import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1",
      [userId]
    );

    return NextResponse.json({
      subscription: result.rows[0],
      hasData: result.rows.length > 0
    }, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
