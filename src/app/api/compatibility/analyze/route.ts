import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"
import { consumeCredits } from "@/lib/credits"

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Deduct 2 credits before analysis
    const creditResult = await consumeCredits(userId, 2, 'compatibility_analysis')
    
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Insufficient credits. Please purchase credits to continue." },
        { status: 402 }
      )
    }
    const body = await req.json()
    const { personAId, personBId, language = 'zh', analysisType = 'love' } = body

    if (!personAId || !personBId) {
      return NextResponse.json(
        { error: "Both personAId and personBId are required" },
        { status: 400 }
      )
    }

    console.log("[Compatibility] Starting analysis for:", { personAId, personBId, userId, language, analysisType })

    // Verify both people belong to user and get all needed fields
    const peopleCheck = await pool.query(
      `SELECT id, name, birth_date, birth_time, birth_location, gender, family_zodiac 
       FROM people 
       WHERE id IN ($1, $2) AND created_by_user_id = $3`,
      [personAId, personBId, userId]
    )

    if (peopleCheck.rows.length !== 2) {
      return NextResponse.json(
        { error: "One or both people not found" },
        { status: 404 }
      )
    }

    const personA = peopleCheck.rows.find(p => p.id === personAId)
    const personB = peopleCheck.rows.find(p => p.id === personBId)

    // Create compatibility analysis record in database
    const compatibilityResult = await pool.query(
      `INSERT INTO compatibility_analyses 
       (user_id, person_a_id, person_b_id, analysis_type, result_data) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [userId, personAId, personBId, analysisType, JSON.stringify({ status: 'pending' })]
    )

    const compatibilityId = compatibilityResult.rows[0].id
    console.log("[Compatibility] Created compatibility record:", compatibilityId)

    // Format birth dates to dd/mm/yyyy
    const formatDate = (date: string) => {
      if (!date) return ''
      
      let d: Date
      // If already YYYY-MM-DD format, parse directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-')
        d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        d = new Date(date)
      }
      
      // Format as dd/mm/yyyy
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      
      return `${day}/${month}/${year}`
    }

    // Use NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF for compatibility analysis
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF

    if (!webhookUrl) {
      console.error("[Compatibility] NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF not configured")
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 }
      )
    }

    console.log("[Compatibility] Sending to webhook:", webhookUrl)

    // Prepare payload matching n8n expected format
    const payload = {
      type: analysisType,
      compatibilityId: compatibilityId,
      userId,
      language,
      personA: {
        id: personA.id,
        name: personA.name,
        birthdate: formatDate(personA.birth_date),
        birthtime: personA.birth_time || '',
        birthplace: personA.birth_location || '',
        gender: personA.gender || '',
        zodiacInfo: personA.family_zodiac || ''
      },
      personB: {
        id: personB.id,
        name: personB.name,
        birthdate: formatDate(personB.birth_date),
        birthtime: personB.birth_time || '',
        birthplace: personB.birth_location || '',
        gender: personB.gender || '',
        zodiacInfo: personB.family_zodiac || ''
      }
    }

    console.log("[Compatibility] Payload:", JSON.stringify(payload, null, 2))

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseText = await n8nResponse.text()
    console.log("[Compatibility] n8n response status:", n8nResponse.status)
    console.log("[Compatibility] n8n response:", responseText)

    if (!n8nResponse.ok) {
      console.error("[Compatibility] n8n webhook failed")
      return NextResponse.json(
        { error: "Failed to trigger compatibility analysis", details: responseText },
        { status: 500 }
      )
    }

    console.log("[Compatibility] Successfully triggered analysis")

    return NextResponse.json({
      success: true,
      message: "Compatibility analysis triggered successfully. Results will be available shortly.",
      compatibilityId,
      personAId,
      personBId,
    })
  } catch (error: unknown) {
    console.error("Error triggering compatibility analysis:", error)
    return NextResponse.json(
      { error: "Failed to trigger compatibility analysis" },
      { status: 500 }
    )
  }
}
