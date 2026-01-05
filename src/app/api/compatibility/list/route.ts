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
    const personId = searchParams.get('personId')

    let query = `
      SELECT ca.*, 
        json_build_object(
          'id', pa.id,
          'name', pa.name,
          'birth_date', TO_CHAR(pa.birth_date, 'YYYY-MM-DD')
        ) as "personA",
        json_build_object(
          'id', pb.id,
          'name', pb.name,
          'birth_date', TO_CHAR(pb.birth_date, 'YYYY-MM-DD')
        ) as "personB"
      FROM compatibility_analyses ca
      JOIN people pa ON ca.person_a_id = pa.id
      JOIN people pb ON ca.person_b_id = pb.id
      WHERE ca.user_id = $1
    `
    const params: (string | number)[] = [userId]

    if (personId) {
      query += ` AND (ca.person_a_id = $2 OR ca.person_b_id = $2)`
      params.push(personId)
    }

    query += ` ORDER BY ca.created_at DESC`

    const result = await pool.query(query, params)

    return NextResponse.json(result.rows)
  } catch (error: unknown) {
    console.error("Error fetching compatibility analyses:", error)
    return NextResponse.json(
      { error: "Failed to fetch compatibility analyses" },
      { status: 500 }
    )
  }
}
