import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create user tokens record
    const result = await sql`
      INSERT INTO user_tokens (user_id, token_balance, total_purchased, total_used)
      VALUES (${userId}, 0, 0, 0)
      ON CONFLICT (user_id) DO UPDATE SET user_id = user_tokens.user_id
      RETURNING token_balance as balance, total_purchased, total_used
    `

    if (result.length === 0) {
      return NextResponse.json({ balance: 0, total_purchased: 0, total_used: 0 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return NextResponse.json(
      { error: "Failed to fetch token balance" },
      { status: 500 }
    )
  }
}
