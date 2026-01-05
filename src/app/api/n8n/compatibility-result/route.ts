import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, personAId, personBId, analysisType, resultData } = body

    // Validate required fields
    if (!userId || !personAId || !personBId || !analysisType || !resultData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify people exist
    const peopleCheck = await pool.query(
      "SELECT id FROM people WHERE id IN ($1, $2)",
      [personAId, personBId]
    )

    if (peopleCheck.rows.length !== 2) {
      return NextResponse.json(
        { error: "One or both people not found" },
        { status: 404 }
      )
    }

    // Insert compatibility analysis
    const result = await pool.query(
      `INSERT INTO compatibility_analyses (
        user_id,
        person_a_id,
        person_b_id,
        analysis_type,
        result_data,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [userId, personAId, personBId, analysisType, resultData]
    )

    return NextResponse.json({
      success: true,
      analysis: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("Error saving compatibility result:", error)
    return NextResponse.json(
      { error: "Failed to save compatibility result" },
      { status: 500 }
    )
  }
}
