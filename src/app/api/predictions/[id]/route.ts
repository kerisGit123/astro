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
    const result = await pool.query(
      `SELECT 
        p.*,
        json_build_object(
          'id', person.id,
          'name', person.name,
          'birth_date', TO_CHAR(person.birth_date, 'YYYY-MM-DD'),
          'gender', person.gender
        ) as person
       FROM predictions p
       JOIN people person ON p.person_id = person.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error("Error fetching prediction:", error)
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `DELETE FROM predictions 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Prediction not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error: unknown) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 }
    )
  }
}
