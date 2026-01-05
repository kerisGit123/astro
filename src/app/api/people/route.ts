import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `SELECT p.*, r.relationship_type, r.label,
       TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date
       FROM people p
       LEFT JOIN relationships r ON p.id = r.person_id AND r.user_id = $1
       WHERE p.created_by_user_id = $1
       ORDER BY p.is_user_self DESC, p.created_at DESC`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error: unknown) {
    console.error("Error fetching people:", error)
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()

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
      isUserSelf = false,
      relationshipType = "other",
      label,
      additionalInfo,
      familyZodiac,
      currentBusiness,
      selectedTopic,
      topicPrompt,
      analysisLanguage = 'en',
    } = body

    // Validation
    if (!name || !birthDate) {
      return NextResponse.json(
        { error: "Name and birth date are required" },
        { status: 400 }
      )
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Create person
      const personResult = await client.query(
        `INSERT INTO people (
          created_by_user_id,
          name,
          birth_date,
          birth_time,
          birth_location,
          gender,
          is_user_self,
          additional_info,
          family_zodiac,
          current_business,
          selected_topic,
          topic_prompt,
          analysis_language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          userId,
          name,
          birthDate,
          birthTime || null,
          birthLocation || null,
          gender || null,
          isUserSelf,
          additionalInfo || null,
          familyZodiac || null,
          currentBusiness || null,
          selectedTopic || null,
          topicPrompt || null,
          analysisLanguage,
        ]
      )

      const person = personResult.rows[0]

      // Create relationship
      const relType = isUserSelf ? "self" : relationshipType
      await client.query(
        `INSERT INTO relationships (
          user_id,
          person_id,
          relationship_type,
          label
        ) VALUES ($1, $2, $3, $4)`,
        [userId, person.id, relType, label || null]
      )

      // If this is the user's self profile, update onboarding_completed
      if (isUserSelf) {
        await client.query(
          `UPDATE users SET onboarding_completed = true WHERE id = $1`,
          [userId]
        )
      }

      await client.query("COMMIT")

      // Trigger n8n personal analysis workflow for self profile
      if (isUserSelf && process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF) {
        const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF
        const method = "POST"
        const formData = {
          personId: person.id,
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
          selectedTopic,
          topicPrompt,
          analysisLanguage,
        }

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          console.error("n8n personal analysis trigger failed:", response.statusText)
        }
      }

      return NextResponse.json(person, { status: 201 })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error: unknown) {
    console.error("Error creating person:", error)
    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    )
  }
}
