import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import pool from "@/lib/db"

// Manual endpoint to sync current Clerk user to database
export async function POST() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [user.id]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        message: "User already exists in database",
        user: existingUser.rows[0],
      })
    }

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (
        id,
        email,
        first_name,
        last_name,
        image_url,
        auth_provider,
        subscription_tier,
        onboarding_completed,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        user.id,
        user.emailAddresses[0]?.emailAddress || "",
        user.firstName || null,
        user.lastName || null,
        user.imageUrl || null,
        "clerk",
        "free",
        false,
      ]
    )

    return NextResponse.json({
      message: "User synced successfully",
      user: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("Error syncing user:", error)
    return NextResponse.json(
      { error: "Failed to sync user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user exists in database
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        clerkUser: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
    }

    return NextResponse.json({
      exists: true,
      user: result.rows[0],
    })
  } catch (error: unknown) {
    console.error("Error checking user:", error)
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    )
  }
}
