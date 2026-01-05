import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    console.log('[Prediction Result] === n8n Webhook Received ===')
    
    // Validate shared secret
    const secret = req.headers.get('x-n8n-secret')
    const expectedSecret = process.env.N8N_CALLBACK_SHARED_SECRET

    if (!expectedSecret) {
      console.error('[Prediction Result] N8N_CALLBACK_SHARED_SECRET not configured')
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (secret !== expectedSecret) {
      console.error('[Prediction Result] Invalid secret')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('[Prediction Result] Received body:', JSON.stringify(body, null, 2))

    // Extract data from n8n response (handle nested structure)
    let data = body
    if (body.output) {
      data = body.output
    }

    const predictionId = data.predictionId
    const analysisType = data.analysisType || data.type

    console.log('[Prediction Result] Extracted predictionId:', predictionId)
    console.log('[Prediction Result] Extracted analysisType:', analysisType)

    if (!predictionId) {
      console.error('[Prediction Result] Missing predictionId')
      return NextResponse.json(
        { error: "Missing required field: predictionId" },
        { status: 400 }
      )
    }

    // Build result data based on analysis type
    const resultData: Record<string, unknown> = {
      status: 'completed',
      analysisType: analysisType || data.type || 'unknown',
      
      // Common fields for both monthly and yearly
      overview: data.overview || null,
      
      // NEW: Western & Chinese Zodiac Analysis (updated structure from n8n)
      ...(data.western_zodiac && {
        westernZodiac: {
          sign: data.western_zodiac.sign || null,
          dateRange: data.western_zodiac.date_range || null,
          coreTraits: data.western_zodiac.core_traits || []
        }
      }),
      ...(data.chinese_zodiac && {
        chineseZodiac: {
          animal: data.chinese_zodiac.animal || null,
          element: data.chinese_zodiac.element || null,
          coreTraits: data.chinese_zodiac.core_traits || []
        }
      }),
      ...(data.personality_scores && {
        personalityScores: {
          execution: data.personality_scores.execution || 0,
          leadership: data.personality_scores.leadership || 0,
          sensitivity: data.personality_scores.sensitivity || 0,
          sociability: data.personality_scores.sociability || 0,
          discipline: data.personality_scores.discipline || 0,
          adaptability: data.personality_scores.adaptability || 0
        }
      }),
      ...(data.combined_profile && {
        combinedProfile: {
          title: data.combined_profile.title || null,
          description: data.combined_profile.description || null,
          strengths: data.combined_profile.strengths || [],
          challenges: data.combined_profile.challenges || [],
          socialStyle: data.combined_profile.social_style || null,
          careerTendencies: data.combined_profile.career_tendencies || null,
          relationshipStyle: data.combined_profile.relationship_style || null
        }
      }),
      
      // NEW: Yearly prediction structure from n8n
      ...(data.yearlyLuck && {
        yearlyLuck: {
          overallScore: data.yearlyLuck.overallScore || null,
          growthPotential: data.yearlyLuck.growthPotential || null,
          riskIndex: data.yearlyLuck.riskIndex || null
        }
      }),
      
      // NEW: Monthly prediction structure from n8n
      ...(data.monthlyLuck && {
        monthlyLuck: {
          overallScore: data.monthlyLuck.overallScore || null,
          energyLevel: data.monthlyLuck.energyLevel || null,
          stabilityIndex: data.monthlyLuck.stabilityIndex || null,
          volatilityIndex: data.monthlyLuck.volatilityIndex || null
        }
      }),
      ...(data.focusAreas && {
        focusAreas: {
          careerAndWork: data.focusAreas.careerAndWork || null,
          finance: data.focusAreas.finance || null,
          relationships: data.focusAreas.relationships || null,
          healthAndWellbeing: data.focusAreas.healthAndWellbeing || null
        }
      }),
      ...(data.monthFocus && {
        monthFocus: {
          careerAndActions: data.monthFocus.careerAndActions || null,
          financeAndResources: data.monthFocus.financeAndResources || null,
          healthAndBalance: data.monthFocus.healthAndBalance || null,
          personalGrowth: data.monthFocus.personalGrowth || null
        }
      }),
      ...(data.keyTrends && { keyTrends: data.keyTrends }),
      ...(data.opportunities && { opportunities: data.opportunities }),
      ...(data.favorableActions && { favorableActions: data.favorableActions }),
      ...(data.avoidances && { avoidances: data.avoidances }),
      ...(data.monthlyAdvice && { monthlyAdvice: data.monthlyAdvice }),
      ...(data.yearFocus && {
        yearFocus: {
          careerAndDirection: data.yearFocus.careerAndDirection || null,
          financeAndAssets: data.yearFocus.financeAndAssets || null,
          relationships: data.yearFocus.relationships || null,
          healthAndBalance: data.yearFocus.healthAndBalance || null
        }
      }),
      ...(data.majorPhases && { majorPhases: data.majorPhases }),
      ...(data.risks && { risks: data.risks }),
      ...(data.strategicRecommendations && { strategicRecommendations: data.strategicRecommendations }),
      ...(data.yearlyAdvice && { yearlyAdvice: data.yearlyAdvice }),
      
      // OLD: Keep for backward compatibility
      luckyElements: data.luckyElements || null,
      challenges: data.challenges || [],
      opportunities: data.opportunities || [],
      advice: data.advice || null,
      
      // Focus area predictions (old format)
      career: data.career || null,
      finance: data.finance || null,
      health: data.health || null,
      relationships: data.relationships || null,
      family: data.family || null,
      
      // Monthly specific
      ...(analysisType === 'monthly' && {
        monthlyHighlights: data.monthlyHighlights || null,
        importantDates: data.importantDates || [],
        weeklyBreakdown: data.weeklyBreakdown || null
      }),
      
      // Yearly specific (old format)
      ...(analysisType === 'yearly' && {
        yearlyTheme: data.yearlyTheme || null,
        quarterlyForecast: data.quarterlyForecast || null,
        majorEvents: data.majorEvents || [],
        annualGoals: data.annualGoals || null
      }),
      
      // Metadata
      generatedAt: new Date().toISOString(),
      selectedTopic: data.SelectedTopic || data.selectedTopic || null,
      question: data.Question || data.question || null
    }

    console.log('[Prediction Result] Built result data')

    // Update prediction record
    const updateResult = await pool.query(
      `UPDATE predictions 
       SET result_data = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id, person_id, analysis_type`,
      [JSON.stringify(resultData), predictionId]
    )

    if (updateResult.rows.length === 0) {
      console.error('[Prediction Result] Prediction not found:', predictionId)
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    console.log('[Prediction Result] Successfully updated prediction:', updateResult.rows[0])

    return NextResponse.json({
      success: true,
      message: "Prediction result saved successfully",
      predictionId
    })

  } catch (error: unknown) {
    console.error("[Prediction Result] Error processing webhook:", error)
    return NextResponse.json(
      { error: "Failed to process prediction result" },
      { status: 500 }
    )
  }
}
