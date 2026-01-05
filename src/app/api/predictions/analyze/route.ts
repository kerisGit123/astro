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
    const creditResult = await consumeCredits(userId, 2, 'prediction_analysis')
    
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Insufficient credits. Please purchase credits to continue." },
        { status: 402 }
      )
    }
    
    const body = await req.json()
    const {
      personId,
      analysisType, // 'monthly' or 'yearly'
      targetMonth,  // 'YYYY-MM' for monthly
      targetYear,   // 'YYYY' for yearly
      lifeFocus,    // optional: 'family' | 'team' | 'friend' | 'career' | 'finance' | 'health'
      currentConcern, // optional: string
      timezone,     // user's timezone
      language = 'zh'
    } = body

    // Validate required fields
    if (!personId || !analysisType) {
      return NextResponse.json(
        { error: "Missing required fields: personId, analysisType" },
        { status: 400 }
      )
    }

    // Validate analysis type
    if (!['monthly', 'yearly'].includes(analysisType)) {
      return NextResponse.json(
        { error: "Invalid analysisType. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      )
    }

    // Validate type-specific fields
    if (analysisType === 'monthly' && !targetMonth) {
      return NextResponse.json(
        { error: "targetMonth is required for monthly predictions" },
        { status: 400 }
      )
    }

    if (analysisType === 'yearly' && !targetYear) {
      return NextResponse.json(
        { error: "targetYear is required for yearly predictions" },
        { status: 400 }
      )
    }

    // Get person details
    const personResult = await pool.query(
      `SELECT id, name, birth_date, birth_time, birth_location, gender 
       FROM people 
       WHERE id = $1 AND created_by_user_id = $2`,
      [personId, userId]
    )

    if (personResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Person not found or unauthorized" },
        { status: 404 }
      )
    }

    const person = personResult.rows[0]

    // Check if prediction already exists
    let existingPrediction
    if (analysisType === 'monthly') {
      existingPrediction = await pool.query(
        `SELECT id FROM predictions 
         WHERE user_id = $1 AND person_id = $2 AND target_month = $3 AND analysis_type = $4`,
        [userId, personId, targetMonth, analysisType]
      )
    } else {
      existingPrediction = await pool.query(
        `SELECT id FROM predictions 
         WHERE user_id = $1 AND person_id = $2 AND target_year = $3 AND analysis_type = $4`,
        [userId, personId, targetYear, analysisType]
      )
    }

    let predictionId

    if (existingPrediction.rows.length > 0) {
      // Update existing prediction to pending
      predictionId = existingPrediction.rows[0].id
      await pool.query(
        `UPDATE predictions 
         SET result_data = '{"status": "pending"}', 
             life_focus = $1, 
             current_concern = $2,
             language = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [lifeFocus || null, currentConcern || null, language, predictionId]
      )
    } else {
      // Create new prediction record
      const insertResult = await pool.query(
        `INSERT INTO predictions 
         (user_id, person_id, analysis_type, target_month, target_year, life_focus, current_concern, language, result_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          userId,
          personId,
          analysisType,
          analysisType === 'monthly' ? targetMonth : null,
          analysisType === 'yearly' ? targetYear : null,
          lifeFocus || null,
          currentConcern || null,
          language,
          JSON.stringify({ status: 'pending' })
        ]
      )
      predictionId = insertResult.rows[0].id
    }

    // Format birth date for n8n
    const birthDate = person.birth_date ? new Date(person.birth_date) : null
    const formattedBirthDate = birthDate 
      ? `${String(birthDate.getDate()).padStart(2, '0')}/${String(birthDate.getMonth() + 1).padStart(2, '0')}/${birthDate.getFullYear()}`
      : null

    // Prepare n8n webhook payload
    const n8nPayload = {
      predictionId,
      userId,
      personId,
      type: analysisType, // n8n expects 'type' instead of 'analysisType'
      language,
      
      // Core person data
      person: {
        name: person.name,
        birthdate: formattedBirthDate,
        birthtime: person.birth_time || null,
        birthplace: person.birth_location || null,
        gender: person.gender || null
      },
      
      // Type-specific data
      ...(analysisType === 'monthly' && {
        targetMonth,
        timezone: timezone || 'Asia/Kuala_Lumpur'
      }),
      ...(analysisType === 'yearly' && {
        targetYear
      }),
      
      // Optional fields
      ...(lifeFocus && { lifeFocus }),
      ...(currentConcern && { currentConcern })
    }

    // Send to n8n webhook
    const n8nWebhookUrl = process.env.N8N_PREDICTION_WEBHOOK_URL
    
    if (!n8nWebhookUrl) {
      console.error('N8N_PREDICTION_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: "Prediction service not configured" },
        { status: 500 }
      )
    }

    console.log('[Prediction] Sending to n8n:', JSON.stringify(n8nPayload, null, 2))

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      console.error('[Prediction] n8n webhook failed:', await n8nResponse.text())
      throw new Error('Failed to trigger prediction analysis')
    }

    return NextResponse.json({
      success: true,
      predictionId,
      message: `${analysisType === 'monthly' ? 'Monthly' : 'Yearly'} prediction analysis started`,
      creditsRemaining: creditResult.balance
    })

  } catch (error: unknown) {
    console.error("Error triggering prediction:", error)
    return NextResponse.json(
      { error: "Failed to trigger prediction analysis" },
      { status: 500 }
    )
  }
}
