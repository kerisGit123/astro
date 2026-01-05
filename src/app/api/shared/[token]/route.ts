import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    // Get shared report
    const result = await pool.query(
      `SELECT sr.*, p.name as person_name, pa.* 
       FROM shared_reports sr
       JOIN people p ON sr.person_id = p.id
       LEFT JOIN personal_analysis pa ON sr.person_id = pa.person_id
       WHERE sr.share_token = $1 AND sr.expires_at > NOW()`,
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Report not found or expired" },
        { status: 404 }
      )
    }

    const report = result.rows[0]

    // Update view count
    await pool.query(
      `UPDATE shared_reports 
       SET view_count = view_count + 1, last_viewed_at = NOW()
       WHERE share_token = $1`,
      [token]
    )

    return NextResponse.json({
      person_name: report.person_name,
      expires_at: report.expires_at,
      view_count: report.view_count + 1,
      analysis: {
        overall_structure: report.overall_structure,
        five_elements: report.five_elements,
        energy_chart: report.energy_chart,
        major_luck_cycles: report.major_luck_cycles,
        career_direction: report.career_direction,
        risk_periods: report.risk_periods,
        future_5_years: report.future_5_years,
        future_10_years: report.future_10_years,
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching shared report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}
