import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    // Fetch shared report with prediction data
    const result = await pool.query(
      `SELECT 
        sr.expires_at,
        p.id as prediction_id,
        p.analysis_type,
        p.result_data,
        p.created_at,
        json_build_object(
          'name', pe.name,
          'birth_date', TO_CHAR(pe.birth_date, 'YYYY-MM-DD')
        ) as person
       FROM shared_reports sr
       JOIN predictions p ON sr.prediction_id = p.id
       JOIN people pe ON p.person_id = pe.id
       WHERE sr.share_token = $1 AND sr.expires_at > NOW()`,
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Shared report not found or expired" },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    
    return NextResponse.json({
      prediction: {
        id: row.prediction_id,
        analysis_type: row.analysis_type,
        result_data: row.result_data,
        person: row.person,
        created_at: row.created_at
      },
      expiresAt: row.expires_at
    })
  } catch (error: unknown) {
    console.error("Error fetching shared report:", error)
    return NextResponse.json(
      { error: "Failed to fetch shared report" },
      { status: 500 }
    )
  }
}
