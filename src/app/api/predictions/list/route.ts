import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function GET(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const analysisType = searchParams.get('analysisType') // 'monthly' or 'yearly'
    const personId = searchParams.get('personId')

    let query = `
      SELECT 
        p.id,
        p.analysis_type,
        p.target_month,
        p.target_year,
        p.life_focus,
        p.current_concern,
        p.result_data,
        p.created_at,
        p.updated_at,
        json_build_object(
          'id', person.id,
          'name', person.name,
          'birth_date', TO_CHAR(person.birth_date, 'YYYY-MM-DD')
        ) as person
      FROM predictions p
      JOIN people person ON p.person_id = person.id
      WHERE p.user_id = $1
    `
    
    const params: (string | undefined)[] = [userId]
    let paramIndex = 2

    if (analysisType) {
      query += ` AND p.analysis_type = $${paramIndex}`
      params.push(analysisType)
      paramIndex++
    }

    if (personId) {
      query += ` AND p.person_id = $${paramIndex}`
      params.push(personId)
      paramIndex++
    }

    query += ` ORDER BY p.created_at DESC`

    const result = await pool.query(query, params.filter(p => p !== undefined))

    return NextResponse.json(result.rows)
  } catch (error: unknown) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    )
  }
}
