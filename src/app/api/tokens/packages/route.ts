import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const packages = await sql`
      SELECT 
        id,
        name,
        description,
        token_amount,
        price_cents,
        currency,
        bonus_tokens,
        is_active
      FROM token_packages
      WHERE is_active = true
      ORDER BY price_cents ASC
    `

    return NextResponse.json(packages)
  } catch (error) {
    console.error("Error fetching token packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch token packages" },
      { status: 500 }
    )
  }
}
