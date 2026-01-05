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
      `SELECT p.*, r.relationship_type, r.label,
       TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date
       FROM people p
       LEFT JOIN relationships r ON p.id = r.person_id AND r.user_id = $1
       WHERE p.id = $2 AND p.created_by_user_id = $1`,
      [userId, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: unknown) {
    console.error("Error fetching person:", error)
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { 
      name, 
      birthDate, 
      birthTime, 
      birthLocation, 
      gender, 
      relationshipType, 
      label, 
      additionalInfo, 
      familyZodiac, 
      currentBusiness, 
      personalInfo 
    } = body

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Update person
      const personResult = await client.query(
        `UPDATE people SET
          name = COALESCE($1, name),
          birth_date = COALESCE($2, birth_date),
          birth_time = COALESCE($3, birth_time),
          birth_location = COALESCE($4, birth_location),
          gender = COALESCE($5, gender),
          additional_info = COALESCE($6, additional_info),
          family_zodiac = COALESCE($7, family_zodiac),
          current_business = COALESCE($8, current_business),
          updated_at = NOW()
        WHERE id = $9 AND created_by_user_id = $10
        RETURNING *`,
        [name, birthDate, birthTime, birthLocation, gender, additionalInfo, familyZodiac, currentBusiness, id, userId]
      )

      if (personResult.rows.length === 0) {
        await client.query("ROLLBACK")
        return NextResponse.json({ error: "Person not found" }, { status: 404 })
      }

      // Update relationship if provided
      if (relationshipType || label) {
        await client.query(
          `UPDATE relationships SET
            relationship_type = COALESCE($1, relationship_type),
            label = COALESCE($2, label)
          WHERE user_id = $3 AND person_id = $4`,
          [relationshipType, label, userId, id]
        )
      }

      await client.query("COMMIT")

      // Note: Auto re-analysis removed per user request
      // User must manually click "Re-analyze" button to trigger n8n

      return NextResponse.json(personResult.rows[0])
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error: unknown) {
    console.error("Error updating person:", error)
    return NextResponse.json(
      { error: "Failed to update person" },
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
    // Check if this is the user's self profile
    const checkResult = await pool.query(
      `SELECT is_user_self FROM people WHERE id = $1 AND created_by_user_id = $2`,
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    if (checkResult.rows[0].is_user_self) {
      return NextResponse.json(
        { error: "Cannot delete your own profile" },
        { status: 400 }
      )
    }

    // Delete person (relationships will cascade)
    await pool.query(
      `DELETE FROM people WHERE id = $1 AND created_by_user_id = $2`,
      [id, userId]
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting person:", error)
    return NextResponse.json(
      { error: "Failed to delete person" },
      { status: 500 }
    )
  }
}
