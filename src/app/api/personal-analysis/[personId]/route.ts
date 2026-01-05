import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { userId } = await auth()
  const { personId } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify person belongs to user
    const personCheck = await pool.query(
      "SELECT id FROM people WHERE id = $1 AND created_by_user_id = $2",
      [personId, userId]
    )

    if (personCheck.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // Get personal analysis for this person
    const result = await pool.query(
      `SELECT * FROM personal_analysis
       WHERE person_id = $1`,
      [personId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: "No analysis found for this person" 
      }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error("Error fetching personal analysis:", error)
    return NextResponse.json(
      { error: "Failed to fetch personal analysis" },
      { status: 500 }
    )
  }
}
