import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"
import { consumeCredits } from "@/lib/credits"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  console.log('=== REANALYZE API CALLED ===')
  console.log('Person ID:', id)
  console.log('User ID:', userId)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Deduct 2 credits before analysis
    const creditResult = await consumeCredits(userId, 2, 'person_reanalysis')
    
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || "Insufficient credits. Please purchase credits to continue." },
        { status: 402 }
      )
    }
    
    console.log('Credits deducted successfully. Remaining balance:', creditResult.balance)
    // Get language and topic from request body
    const body = await req.json().catch(() => ({}))
    const language = body.language || 'zh'
    const selectedTopic = body.selectedTopic || null
    const topicPrompt = body.topicPrompt || ''

    console.log('Request body:', { language, selectedTopic, topicPrompt })

    // Get person details
    const result = await pool.query(
      `SELECT * FROM people WHERE id = $1 AND created_by_user_id = $2`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      console.error('Person not found or access denied')
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    const person = result.rows[0]
    console.log('Person found:', person.name, 'is_user_self:', person.is_user_self)

    // Update person record with new topic and language if provided
    if (selectedTopic || language) {
      await pool.query(
        `UPDATE people 
         SET selected_topic = COALESCE($1, selected_topic),
             topic_prompt = COALESCE($2, topic_prompt),
             analysis_language = COALESCE($3, analysis_language)
         WHERE id = $4`,
        [selectedTopic, topicPrompt, language, id]
      )
    }

    // Trigger n8n personal analysis
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF
    console.log('Webhook URL configured:', webhookUrl ? 'YES' : 'NO')
    console.log('Webhook URL:', webhookUrl)
    
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured!')
      return NextResponse.json(
        { error: "n8n webhook not configured" },
        { status: 500 }
      )
    }

    // Format birth date properly
    const birthDate = new Date(person.birth_date)
    const formattedDate = birthDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
    
    const birthInfo = `born: ${formattedDate}${person.birth_time ? ' ' + person.birth_time : ''}, ${person.gender || 'unknown'}, ${person.birth_location || 'unknown location'}`

    console.log('Triggering n8n webhook:', webhookUrl)
    console.log('Sending data:', {
      type: "bazi",
      personId: person.id,
      userId: userId,
      name: person.name,
      birthInfo: birthInfo,
      additionalInfo: person.additional_info || "",
      familyZodiac: person.family_zodiac || "",
      currentBusiness: person.current_business || "",
      language: language,
      selectedTopic: selectedTopic,
      topicPrompt: topicPrompt,
    })

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "bazi",
        personId: person.id,
        userId: userId,
        name: person.name,
        birthInfo: birthInfo,
        additionalInfo: person.additional_info || "",
        familyZodiac: person.family_zodiac || "",
        currentBusiness: person.current_business || "",
        language: language,
        selectedTopic: selectedTopic,
        topicPrompt: topicPrompt,
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error("n8n trigger failed:", errorText)
      console.error("n8n response status:", n8nResponse.status)
      return NextResponse.json(
        { error: "Failed to trigger analysis", details: errorText },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()
    console.log('n8n webhook triggered successfully:', n8nResult)
    console.log('=== REANALYZE API COMPLETED ===')

    return NextResponse.json({
      success: true,
      message: "Re-analysis triggered successfully",
      personId: person.id,
      personName: person.name,
      creditsRemaining: creditResult.balance
    })
  } catch (error: unknown) {
    console.error("Error triggering re-analysis:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to trigger re-analysis"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
