import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Validate shared secret from n8n
    const secret = req.headers.get('x-n8n-secret')
    const expectedSecret = process.env.N8N_CALLBACK_SHARED_SECRET
    
    if (expectedSecret && secret !== expectedSecret) {
      console.error('Invalid n8n secret:', secret)
      return NextResponse.json(
        { error: "Unauthorized - invalid secret" },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    console.log('=== n8n Webhook Received ===')
    console.log('Body type:', Array.isArray(body) ? 'Array' : typeof body)
    console.log('Body length:', Array.isArray(body) ? body.length : 'N/A')
    console.log('First item keys:', Array.isArray(body) && body[0] ? Object.keys(body[0]) : 'N/A')
    console.log('Raw body:', JSON.stringify(body, null, 2))
    
    // Support both old format and new n8n format
    let personId, userId, overallStructure, fiveElements, energyChart, majorLuckCycles, careerDirection, riskPeriods, future5, future10, future20, chancePrediction, riskPrediction, timingOpportunities, language, selectedTopic, question
    
    // Helper function to safely parse JSON
    const safeJSONParse = (value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch (e) {
          console.error('JSON parse error:', e, 'Value:', value)
          return value
        }
      }
      return value
    }

    // Check if it's n8n format (has "Overall Structure" field)
    if (body["Overall Structure"] !== undefined || body["5 Element"] !== undefined) {
      // n8n format with capitalized field names
      console.log('Extracting from n8n format, data keys:', Object.keys(body))
      
      const data = Array.isArray(body) ? body[0] : body
      personId = data.personId
      userId = data.userId
      language = data.language || 'zh'
      overallStructure = data["Overall Structure"] || null
      
      // Parse all JSON fields safely
      fiveElements = safeJSONParse(data["5 Element"]) || null
      energyChart = data["Energy Chart"] || null
      majorLuckCycles = safeJSONParse(data["Major Luck Cycles"]) || null
      careerDirection = safeJSONParse(data["Career Direction"]) || null
      riskPeriods = safeJSONParse(data["Risk Periods"]) || null
      future5 = safeJSONParse(data["Future 5"]) || null
      future10 = safeJSONParse(data["Future 10"]) || null
      future20 = safeJSONParse(data["Future 20"]) || null
      chancePrediction = safeJSONParse(data["ChancePrediction"]) || null
      riskPrediction = safeJSONParse(data["RiskPrediction"]) || null
      timingOpportunities = safeJSONParse(data["TimingOpportunities"]) || null
      selectedTopic = data["SelectedTopic"] || null
      question = data["Question"] || null
      
      console.log('Extracted values check:', {
        hasOverallStructure: !!overallStructure,
        hasSelectedTopic: !!selectedTopic,
        hasQuestion: !!question,
        hasFiveElements: !!fiveElements
      })
    } else {
      // Old format with camelCase field names
      console.log('Extracting from old format')
      personId = body.personId
      userId = body.userId
      language = body.language || 'zh'
      overallStructure = body.overallStructure
      fiveElements = body.fiveElements
      energyChart = body.energyChart
      majorLuckCycles = body.majorLuckCycles
      careerDirection = body.careerDirection
      riskPeriods = body.riskPeriods
      future5 = body.future5Years
      future10 = body.future10Years
      future20 = body.future20Years
      chancePrediction = body.chancePrediction
      riskPrediction = body.riskPrediction
      timingOpportunities = body.timingOpportunities
      selectedTopic = body.selectedTopic
      question = body.question
    }

    // Validate required fields
    if (!personId) {
      return NextResponse.json(
        { error: "Missing required field: personId" },
        { status: 400 }
      )
    }

    // Verify person exists
    const personCheck = await pool.query(
      "SELECT id FROM people WHERE id = $1",
      [personId]
    )

    if (personCheck.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // Data is already parsed in the format handling above, no need for additional parsing

    // Check if analysis already exists
    const existingAnalysis = await pool.query(
      "SELECT id FROM personal_analysis WHERE person_id = $1",
      [personId]
    )

    // Log parsed data for debugging
    console.log('=== Extracted Data ===')
    console.log('personId:', personId)
    console.log('overallStructure:', overallStructure ? overallStructure.substring(0, 50) + '...' : null)
    console.log('selectedTopic:', selectedTopic ? selectedTopic.substring(0, 50) + '...' : null)
    console.log('question:', question ? question.substring(0, 50) + '...' : null)
    console.log('Parsed data types:', {
      fiveElements: typeof fiveElements,
      majorLuckCycles: typeof majorLuckCycles,
      careerDirection: typeof careerDirection,
      riskPeriods: typeof riskPeriods,
      future5: typeof future5,
      future10: typeof future10,
      future20: typeof future20,
      chancePrediction: typeof chancePrediction,
      riskPrediction: typeof riskPrediction,
      timingOpportunities: typeof timingOpportunities
    })

    let result
    if (existingAnalysis.rows.length > 0) {
      // Update existing analysis
      result = await pool.query(
        `UPDATE personal_analysis SET
          overall_structure = $1,
          five_elements = $2::jsonb,
          energy_chart = $3,
          major_luck_cycles = $4::jsonb,
          career_direction = $5::jsonb,
          risk_periods = $6::jsonb,
          future_5 = $7::jsonb,
          future_10 = $8::jsonb,
          future_20 = $9::jsonb,
          chance_prediction = $10::jsonb,
          risk_prediction = $11::jsonb,
          timing_opportunities = $12::jsonb,
          language = $13,
          selected_topic = $14,
          question = $15,
          analyzed_at = NOW()
        WHERE person_id = $16
        RETURNING *`,
        [
          overallStructure,
          JSON.stringify(fiveElements),
          energyChart,
          JSON.stringify(majorLuckCycles),
          JSON.stringify(careerDirection),
          JSON.stringify(riskPeriods),
          JSON.stringify(future5),
          JSON.stringify(future10),
          JSON.stringify(future20),
          JSON.stringify(chancePrediction),
          JSON.stringify(riskPrediction),
          JSON.stringify(timingOpportunities),
          language,
          selectedTopic,
          question,
          personId,
        ]
      )
    } else {
      // Insert new analysis
      result = await pool.query(
        `INSERT INTO personal_analysis (
          person_id,
          overall_structure,
          five_elements,
          energy_chart,
          major_luck_cycles,
          career_direction,
          risk_periods,
          future_5,
          future_10,
          future_20,
          chance_prediction,
          risk_prediction,
          timing_opportunities,
          language,
          selected_topic,
          question,
          analyzed_at
        ) VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14, $15, $16, NOW())
        RETURNING *`,
        [
          personId,
          overallStructure,
          JSON.stringify(fiveElements),
          energyChart,
          JSON.stringify(majorLuckCycles),
          JSON.stringify(careerDirection),
          JSON.stringify(riskPeriods),
          JSON.stringify(future5),
          JSON.stringify(future10),
          JSON.stringify(future20),
          JSON.stringify(chancePrediction),
          JSON.stringify(riskPrediction),
          JSON.stringify(timingOpportunities),
          language,
          selectedTopic,
          question,
        ]
      )
    }

    return NextResponse.json({
      success: true,
      analysis: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("Error saving personal analysis:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    console.error("Stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { 
        error: "Failed to save personal analysis",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
