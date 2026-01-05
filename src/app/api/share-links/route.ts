import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"
import { randomBytes } from "crypto"

// Create share link
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { personId, expiryDays } = await req.json()

    if (!personId || !expiryDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify person belongs to user
    const personCheck = await pool.query(
      "SELECT id FROM people WHERE id = $1 AND created_by_user_id = $2",
      [personId, userId]
    )

    if (personCheck.rows.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')
    
    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // Insert share link
    const result = await pool.query(
      `INSERT INTO share_links (person_id, token, expires_at, created_by_user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [personId, token, expiresAt, userId]
    )

    return NextResponse.json({
      success: true,
      shareLink: result.rows[0],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`
    })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    )
  }
}

// Get all share links for user
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const personId = searchParams.get('personId')

    let query = `
      SELECT sl.*, p.name as person_name
      FROM share_links sl
      JOIN people p ON sl.person_id = p.id
      WHERE sl.created_by_user_id = $1
      AND sl.expires_at > NOW()
    `
    const params: any[] = [userId]

    if (personId) {
      query += ` AND sl.person_id = $2`
      params.push(personId)
    }

    query += ` ORDER BY sl.created_at DESC`

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      shareLinks: result.rows
    })
  } catch (error) {
    console.error("Error fetching share links:", error)
    return NextResponse.json(
      { error: "Failed to fetch share links" },
      { status: 500 }
    )
  }
}

// Revoke all share links
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const personId = searchParams.get('personId')

    let query = `DELETE FROM share_links WHERE created_by_user_id = $1`
    const params: any[] = [userId]

    if (personId) {
      query += ` AND person_id = $2`
      params.push(personId)
    }

    await pool.query(query, params)

    return NextResponse.json({
      success: true,
      message: "Share links revoked"
    })
  } catch (error) {
    console.error("Error revoking share links:", error)
    return NextResponse.json(
      { error: "Failed to revoke share links" },
      { status: 500 }
    )
  }
}
