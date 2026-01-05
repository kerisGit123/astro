import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get compatibility analysis with person details
    const result = await pool.query(
      `SELECT ca.*, 
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
       WHERE ca.id = $1 AND ca.user_id = $2`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Compatibility analysis not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error("Error fetching compatibility analysis:", error)
    return NextResponse.json(
      { error: "Failed to fetch compatibility analysis" },
      { status: 500 }
    )
  }
}
