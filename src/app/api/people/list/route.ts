import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        TO_CHAR(birth_date, 'YYYY-MM-DD') as birth_date,
        birth_time,
        birth_location,
        gender,
        is_user_self,
        created_at
       FROM people
       WHERE created_by_user_id = $1
       ORDER BY is_user_self DESC, created_at DESC`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error: unknown) {
    console.error("Error fetching people list:", error)
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    )
  }
}
