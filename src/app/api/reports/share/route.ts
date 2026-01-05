import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { predictionId, expiryDays = 7 } = body

    // Verify prediction belongs to user
    const predictionCheck = await pool.query(
      "SELECT id FROM predictions WHERE id = $1 AND user_id = $2",
      [predictionId, userId]
    )

    if (predictionCheck.rows.length === 0) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex')
    
    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // Create shared report
    await pool.query(
      `INSERT INTO shared_reports (prediction_id, share_token, expires_at, created_by_user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [predictionId, shareToken, expiresAt, userId]
    )

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/report/${shareToken}`

    return NextResponse.json({
      success: true,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      shareToken,
    })
  } catch (error: unknown) {
    console.error("Error creating share link:", error)
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all active share links for user
    const result = await pool.query(
      `SELECT sr.*, 
              p.analysis_type,
              pe.name as person_name
       FROM shared_reports sr
       JOIN predictions p ON sr.prediction_id = p.id
       JOIN people pe ON p.person_id = pe.id
       WHERE sr.created_by_user_id = $1 AND sr.expires_at > NOW()
       ORDER BY sr.created_at DESC`,
      [userId]
    )

    return NextResponse.json(result.rows)
  } catch (error: unknown) {
    console.error("Error fetching share links:", error)
    return NextResponse.json(
      { error: "Failed to fetch share links" },
      { status: 500 }
    )
  }
}
