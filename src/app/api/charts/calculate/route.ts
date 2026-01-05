import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { personId } = body

    if (!personId) {
      return NextResponse.json(
        { error: "Person ID is required" },
        { status: 400 }
      )
    }

    // Verify person belongs to user and get birth data
    const personResult = await pool.query(
      `SELECT * FROM people 
       WHERE id = $1 AND created_by_user_id = $2`,
      [personId, userId]
    )

    if (personResult.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    const person = personResult.rows[0]

    // Trigger n8n workflow
    const n8nUrl = (process.env.N8N_BASE_URL || '') + (process.env.N8N_SCAN_WEBHOOK_PATH || '')

    const n8nResponse = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: person.id,
        userId: userId,
        name: person.name,
        birthDate: person.birth_date,
        birthTime: person.birth_time,
        birthLocation: person.birth_location,
        gender: person.gender,
      }),
    })

    if (!n8nResponse.ok) {
      console.error("n8n workflow trigger failed:", await n8nResponse.text())
      return NextResponse.json(
        { error: "Failed to trigger chart calculation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Chart calculation triggered",
      personId: person.id,
    })
  } catch (error: unknown) {
    console.error("Error triggering chart calculation:", error)
    return NextResponse.json(
      { error: "Failed to trigger chart calculation" },
      { status: 500 }
    )
  }
}
