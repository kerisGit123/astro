import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { consumeCredits } from "@/lib/credits"

export async function POST(req: NextRequest) {
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

  // Handle front-page analyzer (no auth required)
  if (type === 'wczodiacfront') {
    if (!birthdate) {
      return NextResponse.json(
        { error: "Missing required field: birthdate" },
        { status: 400 }
      )
    }

    // Calculate zodiac signs directly
    const date = new Date(birthdate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // Western Zodiac calculation
    function getWesternZodiac(month: number, day: number) {
      const zodiacSigns = [
        { sign: "Capricorn", dateRange: "Dec 22 - Jan 19", traits: ["Ambitious", "Disciplined", "Practical"], start: [12, 22], end: [1, 19] },
        { sign: "Aquarius", dateRange: "Jan 20 - Feb 18", traits: ["Independent", "Innovative", "Humanitarian"], start: [1, 20], end: [2, 18] },
        { sign: "Pisces", dateRange: "Feb 19 - Mar 20", traits: ["Compassionate", "Intuitive", "Artistic"], start: [2, 19], end: [3, 20] },
        { sign: "Aries", dateRange: "Mar 21 - Apr 19", traits: ["Bold", "Energetic", "Pioneering"], start: [3, 21], end: [4, 19] },
        { sign: "Taurus", dateRange: "Apr 20 - May 20", traits: ["Reliable", "Patient", "Devoted"], start: [4, 20], end: [5, 20] },
        { sign: "Gemini", dateRange: "May 21 - Jun 20", traits: ["Curious", "Adaptable", "Communicative"], start: [5, 21], end: [6, 20] },
        { sign: "Cancer", dateRange: "Jun 21 - Jul 22", traits: ["Nurturing", "Protective", "Emotional"], start: [6, 21], end: [7, 22] },
        { sign: "Leo", dateRange: "Jul 23 - Aug 22", traits: ["Confident", "Generous", "Charismatic"], start: [7, 23], end: [8, 22] },
        { sign: "Virgo", dateRange: "Aug 23 - Sep 22", traits: ["Analytical", "Practical", "Helpful"], start: [8, 23], end: [9, 22] },
        { sign: "Libra", dateRange: "Sep 23 - Oct 22", traits: ["Diplomatic", "Fair", "Social"], start: [9, 23], end: [10, 22] },
        { sign: "Scorpio", dateRange: "Oct 23 - Nov 21", traits: ["Passionate", "Resourceful", "Determined"], start: [10, 23], end: [11, 21] },
        { sign: "Sagittarius", dateRange: "Nov 22 - Dec 21", traits: ["Optimistic", "Adventurous", "Philosophical"], start: [11, 22], end: [12, 21] },
      ]

      for (const zodiac of zodiacSigns) {
        const [startMonth, startDay] = zodiac.start
        const [endMonth, endDay] = zodiac.end

        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay)
        ) {
          return {
            sign: zodiac.sign,
            dateRange: zodiac.dateRange,
            coreTraits: zodiac.traits,
          }
        }
      }

      return {
        sign: zodiacSigns[0].sign,
        dateRange: zodiacSigns[0].dateRange,
        coreTraits: zodiacSigns[0].traits,
      }
    }

    // Chinese Zodiac calculation
    function getChineseZodiac(year: number) {
      const animals = [
        { name: "Rat", traits: ["Intelligent", "Adaptable", "Quick-witted"] },
        { name: "Ox", traits: ["Diligent", "Dependable", "Strong"] },
        { name: "Tiger", traits: ["Brave", "Confident", "Competitive"] },
        { name: "Rabbit", traits: ["Gentle", "Quiet", "Elegant"] },
        { name: "Dragon", traits: ["Confident", "Intelligent", "Enthusiastic"] },
        { name: "Snake", traits: ["Wise", "Enigmatic", "Graceful"] },
        { name: "Horse", traits: ["Animated", "Active", "Energetic"] },
        { name: "Goat", traits: ["Calm", "Gentle", "Sympathetic"] },
        { name: "Monkey", traits: ["Sharp", "Smart", "Curious"] },
        { name: "Rooster", traits: ["Observant", "Hardworking", "Courageous"] },
        { name: "Dog", traits: ["Loyal", "Honest", "Prudent"] },
        { name: "Pig", traits: ["Compassionate", "Generous", "Diligent"] },
      ]

      const elements = ["Metal", "Water", "Wood", "Fire", "Earth"]
      
      const baseYear = 1924
      const index = (year - baseYear) % 12
      const elementIndex = Math.floor(((year - baseYear) % 10) / 2)

      const animal = animals[index < 0 ? index + 12 : index]
      const yearElement = elements[elementIndex < 0 ? elementIndex + 5 : elementIndex]

      return {
        animal: animal.name,
        element: yearElement,
        coreTraits: animal.traits,
      }
    }

    const westernZodiac = getWesternZodiac(month, day)
    const chineseZodiac = getChineseZodiac(year)

    // Calculate personality scores based on zodiac combination
    function calculatePersonalityScores(western: string, chinese: string, genderInput: string) {
      // Base scores (1-5 scale)
      const baseScores = {
        execution: 3,
        leadership: 3,
        sensitivity: 3,
        sociability: 3,
        discipline: 3,
        adaptability: 3
      }

      // Western zodiac influences
      const westernInfluence: Record<string, Partial<typeof baseScores>> = {
        Aries: { execution: 5, leadership: 5, adaptability: 4 },
        Taurus: { discipline: 5, execution: 4, sensitivity: 3 },
        Gemini: { sociability: 5, adaptability: 5, leadership: 3 },
        Cancer: { sensitivity: 5, sociability: 4, discipline: 3 },
        Leo: { leadership: 5, sociability: 5, execution: 4 },
        Virgo: { discipline: 5, execution: 4, sensitivity: 4 },
        Libra: { sociability: 5, sensitivity: 4, adaptability: 4 },
        Scorpio: { execution: 5, leadership: 4, discipline: 4 },
        Sagittarius: { adaptability: 5, sociability: 4, leadership: 4 },
        Capricorn: { discipline: 5, execution: 5, leadership: 4 },
        Aquarius: { adaptability: 5, leadership: 4, sociability: 4 },
        Pisces: { sensitivity: 5, adaptability: 4, sociability: 3 }
      }

      // Chinese zodiac influences
      const chineseInfluence: Record<string, Partial<typeof baseScores>> = {
        Rat: { adaptability: 1, sociability: 1 },
        Ox: { discipline: 1, execution: 1 },
        Tiger: { leadership: 1, execution: 1 },
        Rabbit: { sensitivity: 1, sociability: 1 },
        Dragon: { leadership: 1, sociability: 1 },
        Snake: { sensitivity: 1, discipline: 1 },
        Horse: { execution: 1, adaptability: 1 },
        Goat: { sensitivity: 1, adaptability: 1 },
        Monkey: { adaptability: 1, sociability: 1 },
        Rooster: { discipline: 1, execution: 1 },
        Dog: { discipline: 1, sensitivity: 1 },
        Pig: { sociability: 1, sensitivity: 1 }
      }

      // Apply influences
      const scores = { ...baseScores }
      const westernMod = westernInfluence[western] || {}
      const chineseMod = chineseInfluence[chinese] || {}

      Object.keys(scores).forEach(key => {
        const k = key as keyof typeof scores
        scores[k] = westernMod[k] || scores[k]
        scores[k] = Math.min(5, scores[k] + (chineseMod[k] || 0))
      })

      return scores
    }

    // Generate combined profile
    function generateCombinedProfile(western: string, chinese: string, scores: Record<string, number>) {
      const profiles: Record<string, {
        title: string
        description: string
        strengths: string[]
        challenges: string[]
        socialStyle: string
        careerTendencies: string
        relationshipStyle: string
      }> = {
        "Aries-Dragon": {
          title: "The Fearless Pioneer",
          description: "A dynamic combination of boldness and confidence, creating a natural-born leader who charges ahead fearlessly.",
          strengths: ["Natural leadership", "Boundless energy", "Innovative thinking", "Inspiring presence"],
          challenges: ["Impulsiveness", "Overconfidence", "Difficulty with patience", "Can be domineering"],
          socialStyle: "Charismatic and commanding, naturally draws people in",
          careerTendencies: "Entrepreneurship, executive roles, pioneering fields",
          relationshipStyle: "Passionate and protective, needs independence"
        }
      }

      // Default profile based on scores
      const avgScore = (Object.values(scores) as number[]).reduce((a: number, b: number) => a + b, 0) / 6
      const highestTrait = (Object.entries(scores) as [string, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0]

      const defaultProfile = {
        title: `The ${western} ${chinese}`,
        description: `A unique blend of ${western}'s characteristics with ${chinese}'s traits, creating a balanced and multifaceted personality.`,
        strengths: [
          ...westernZodiac.coreTraits.slice(0, 2),
          ...chineseZodiac.coreTraits.slice(0, 2)
        ],
        challenges: [
          "Balancing different aspects of personality",
          "Managing high expectations",
          "Finding the right pace"
        ],
        socialStyle: avgScore > 3.5 ? "Outgoing and engaging" : "Thoughtful and selective",
        careerTendencies: highestTrait === 'leadership' ? "Management and leadership roles" :
                          highestTrait === 'execution' ? "Project-driven and goal-oriented work" :
                          highestTrait === 'discipline' ? "Structured and systematic fields" :
                          "Creative and adaptive environments",
        relationshipStyle: scores.sensitivity > 3.5 ? "Emotionally attuned and caring" : "Practical and supportive"
      }

      return profiles[`${western}-${chinese}`] || defaultProfile
    }

    const personalityScores = calculatePersonalityScores(westernZodiac.sign, chineseZodiac.animal, gender || 'unknown')
    const combinedProfile = generateCombinedProfile(westernZodiac.sign, chineseZodiac.animal, personalityScores)

    console.log('[Front Zodiac Analysis] Calculated results:', { westernZodiac, chineseZodiac, personalityScores, combinedProfile, birthYear: year })

    return NextResponse.json({
      success: true,
      westernZodiac,
      chineseZodiac,
      personalityScores,
      combinedProfile,
      birthYear: year
    })
  }

  // Regular authenticated flow
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
