import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { consumeCredits } from "@/lib/credits"

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const creditResult = await consumeCredits(userId, 2, 'zodiac_analysis')
    
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Insufficient credits. Please purchase credits to continue." },
        { status: 402 }
      )
    }
    
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL!)
    
    const body = await req.json()
    const {
      language = 'en',
      type = 'wczodiac',
      personId,
      birthdate,
      gender,
      name,
      webhookUrl
    } = body

    if (!personId || !birthdate || !gender || !name) {
      return NextResponse.json(
        { error: "Missing required fields: personId, birthdate, gender, name" },
        { status: 400 }
      )
    }

    const personResult = await sql`
      SELECT id, name, birth_date, gender 
      FROM people 
      WHERE id = ${personId} AND created_by_user_id = ${userId}
    `

    if (personResult.length === 0) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      )
    }

    const person = personResult[0]

    const predictionResult = await sql`
      INSERT INTO predictions (
        user_id,
        person_id,
        analysis_type,
        result_data,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${personId},
        ${type},
        ${JSON.stringify({ status: 'processing', language })},
        NOW(),
        NOW()
      )
      RETURNING id
    `

    const finalPredictionId = predictionResult[0].id

    const formatBirthdate = (dateString: string): string => {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    const n8nPayload = {
      language: language,
      type: type,
      predictionId: finalPredictionId,
      personId: personId,
      userId: userId,
      birthdate: formatBirthdate(person.birth_date),
      gender: person.gender || gender,
      name: person.name,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/prediction-result`
    }

    const n8nWebhookUrl = webhookUrl || 
                          process.env.N8N_PREDICTION_WEBHOOK_URL || 
                          'https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f'

    console.log('[Zodiac Analysis] Sending to n8n webhook:', n8nWebhookUrl)
    console.log('[Zodiac Analysis] Payload:', JSON.stringify(n8nPayload, null, 2))

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    console.log('[Zodiac Analysis] n8n response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('[Zodiac Analysis] N8N webhook error:', errorText)
      console.error('[Zodiac Analysis] Response status:', n8nResponse.status)
      
      await sql`
        UPDATE predictions 
        SET result_data = ${JSON.stringify({ 
          status: 'failed', 
          error: 'Failed to send to N8N webhook',
          details: errorText 
        })},
        updated_at = NOW()
        WHERE id = ${finalPredictionId}
      `
      
      return NextResponse.json(
        { error: "Failed to send request to analysis service" },
        { status: 500 }
      )
    }

    console.log('[Zodiac Analysis] Successfully sent to n8n, prediction created:', finalPredictionId)

    return NextResponse.json({
      success: true,
      predictionId: finalPredictionId,
      status: 'processing',
      message: 'Zodiac analysis started successfully',
      creditsRemaining: creditResult.balance
    })

  } catch (error: unknown) {
    console.error("Error in zodiac analysis:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
