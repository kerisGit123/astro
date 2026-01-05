import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// This endpoint receives chart calculation results from n8n
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personId, chartType, chartData } = body

    // Validate required fields
    if (!personId || !chartType || !chartData) {
      return NextResponse.json(
        { error: "Missing required fields: personId, chartType, chartData" },
        { status: 400 }
      )
    }

    // Verify person exists
    const personCheck = await pool.query(
      "SELECT id FROM people WHERE id = $1",
      [personId]
    )

    if (personCheck.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // Insert or update chart
    const result = await pool.query(
      `INSERT INTO charts (person_id, chart_type, chart_data, calculated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (person_id, chart_type) 
       DO UPDATE SET 
         chart_data = EXCLUDED.chart_data,
         calculated_at = NOW()
       RETURNING *`,
      [personId, chartType, chartData]
    )

    return NextResponse.json({
      success: true,
      chart: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("Error saving chart result:", error)
    return NextResponse.json(
      { error: "Failed to save chart result" },
      { status: 500 }
    )
  }
}
