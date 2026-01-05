import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Validate shared secret from n8n
    const secret = req.headers.get('x-n8n-secret')
    const expectedSecret = process.env.N8N_CALLBACK_SHARED_SECRET
    
    if (expectedSecret && secret !== expectedSecret) {
      console.error('[Love Analysis] Invalid n8n secret:', secret)
      return NextResponse.json(
        { error: "Unauthorized - invalid secret" },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    console.log('[Love Analysis] === n8n Webhook Received ===')
    console.log('[Love Analysis] Body type:', Array.isArray(body) ? 'Array' : typeof body)
    console.log('[Love Analysis] Body keys:', Object.keys(body))
    
    // n8n sends data in body.output structure
    let data = body
    
    // Check if data is in body.output
    if (body.output) {
      console.log('[Love Analysis] Found data in body.output')
      data = body.output
    }
    
    // If still array, get first element
    if (Array.isArray(data)) {
      console.log('[Love Analysis] Data is array, taking first element')
      data = data[0]
    }
    
    console.log('[Love Analysis] Extracted data keys:', Object.keys(data))
    console.log('[Love Analysis] Full data:', JSON.stringify(data, null, 2))
    
    // Extract compatibilityId - n8n should send this in the initial webhook trigger data
    // It might be at root level or we need to get it from personId/userId lookup
    let compatibilityId = data.compatibilityId
    
    // Extract personId from nested structures
    let personId = data.personId
    let userId = data.userId
    
    // Check if personId is in personA or personB objects
    if (!personId && data.personA?.personId) {
      personId = data.personA.personId
      console.log('[Love Analysis] Extracted personId from personA:', personId)
    }
    if (!personId && data.personB?.personId) {
      personId = data.personB.personId
      console.log('[Love Analysis] Extracted personId from personB:', personId)
    }
    
    // If not found, try to find the compatibility record by personId and userId
    if (!compatibilityId && personId && userId) {
      console.log('[Love Analysis] compatibilityId not found, searching by personId and userId')
      console.log('[Love Analysis] Using personId:', personId, 'userId:', userId)
      
      // Find the most recent compatibility analysis for this user and person
      const findResult = await pool.query(
        `SELECT id FROM compatibility_analyses 
         WHERE user_id = $1 
         AND (person_a_id = $2 OR person_b_id = $2)
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId, personId]
      )
      
      console.log('[Love Analysis] Search result:', findResult.rows)
      
      if (findResult.rows.length > 0) {
        compatibilityId = findResult.rows[0].id
        console.log('[Love Analysis] Found compatibilityId:', compatibilityId)
      }
    }
    
    // Also try searching by both person IDs if we have them
    if (!compatibilityId && data.personA?.personId && data.personB?.personId && userId) {
      console.log('[Love Analysis] Trying to find by both person IDs with userId')
      const findResult = await pool.query(
        `SELECT id FROM compatibility_analyses 
         WHERE user_id = $1 
         AND ((person_a_id = $2 AND person_b_id = $3) OR (person_a_id = $3 AND person_b_id = $2))
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId, data.personA.personId, data.personB.personId]
      )
      
      console.log('[Love Analysis] Search by both IDs result:', findResult.rows)
      
      if (findResult.rows.length > 0) {
        compatibilityId = findResult.rows[0].id
        console.log('[Love Analysis] Found compatibilityId by both person IDs:', compatibilityId)
      }
    }
    
    // Last resort: Search by person IDs only (without userId requirement)
    // This handles cases where n8n sends wrong userId
    if (!compatibilityId && data.personA?.personId && data.personB?.personId) {
      console.log('[Love Analysis] Last resort: Searching by person IDs only (ignoring userId)')
      const findResult = await pool.query(
        `SELECT id, user_id FROM compatibility_analyses 
         WHERE ((person_a_id = $1 AND person_b_id = $2) OR (person_a_id = $2 AND person_b_id = $1))
         AND result_data->>'status' = 'pending'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [data.personA.personId, data.personB.personId]
      )
      
      console.log('[Love Analysis] Search by person IDs only result:', findResult.rows)
      
      if (findResult.rows.length > 0) {
        compatibilityId = findResult.rows[0].id
        console.log('[Love Analysis] Found compatibilityId by person IDs (last resort):', compatibilityId)
        console.log('[Love Analysis] Actual user_id in database:', findResult.rows[0].user_id)
      }
    }
    
    // Build result data from n8n response
    // Support all compatibility types: love, business, work, family, friend
    const resultData = {
      // Common fields
      personA: data.personA || null,
      personB: data.personB || null,
      strengths: data.strengths || [],
      longTermOutlook: data.longTermOutlook || null,
      advice: data.advice || null,
      selectedTopic: data.SelectedTopic || data.selectedTopic || null,
      question: data.Question || data.question || null,
      personId: data.personId || null,
      userId: data.userId || null,
      
      // Challenges/Risks (used by all types)
      challenges: data.challenges || [],
      risks: data.risks || [],
      
      // Love-specific fields
      relationshipDynamics: data.relationshipDynamics || null,
      marriagePotential: data.marriagePotential || null,
      
      // Business-specific fields
      partnershipPotential: data.partnershipPotential || null,
      recommendedStructure: data.recommendedStructure || null,
      
      // Work/Team-specific fields
      teamDynamics: data.teamDynamics || null,
      teamPerformance: data.teamPerformance || null,
      collaborationStyle: data.collaborationStyle || null,
      optimizationAdvice: data.optimizationAdvice || null,
      
      // Family-specific fields
      familyHarmony: data.familyHarmony || null,
      generationalDynamics: data.generationalDynamics || null,
      
      // Friend-specific fields
      friendshipCompatibility: data.friendshipCompatibility || null,
      friendshipDynamics: data.friendshipDynamics || null,
      friendshipPotential: data.friendshipPotential || null,
      socialDynamics: data.socialDynamics || null,
      maintenanceAdvice: data.maintenanceAdvice || null
    }

    // Validate required fields
    if (!compatibilityId) {
      console.error('[Love Analysis] Missing compatibilityId after all fallback attempts')
      console.error('[Love Analysis] Available keys:', Object.keys(data))
      console.error('[Love Analysis] personId extracted:', personId)
      console.error('[Love Analysis] userId extracted:', userId)
      console.error('[Love Analysis] personA.personId:', data.personA?.personId)
      console.error('[Love Analysis] personB.personId:', data.personB?.personId)
      
      // Provide detailed error message
      return NextResponse.json(
        { 
          error: "Missing required field: compatibilityId",
          details: {
            message: "Could not find compatibility record. Please ensure the analysis was created before sending results.",
            personId: personId,
            userId: userId,
            personAId: data.personA?.personId,
            personBId: data.personB?.personId
          }
        },
        { status: 400 }
      )
    }

    // Verify compatibility record exists
    const compatibilityCheck = await pool.query(
      "SELECT id FROM compatibility_analyses WHERE id = $1",
      [compatibilityId]
    )

    if (compatibilityCheck.rows.length === 0) {
      console.error('[Love Analysis] Compatibility record not found:', compatibilityId)
      return NextResponse.json(
        { error: "Compatibility record not found" },
        { status: 404 }
      )
    }

    console.log('[Love Analysis] Updating compatibility record:', compatibilityId)

    // Update compatibility analysis with results
    const result = await pool.query(
      `UPDATE compatibility_analyses 
       SET result_data = $1::jsonb,
           created_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(resultData), compatibilityId]
    )

    console.log('[Love Analysis] Successfully updated compatibility record')

    return NextResponse.json({
      success: true,
      analysis: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("[Love Analysis] Error saving compatibility result:", error)
    console.error("[Love Analysis] Error details:", error instanceof Error ? error.message : String(error))
    console.error("[Love Analysis] Stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { 
        error: "Failed to save compatibility result",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
