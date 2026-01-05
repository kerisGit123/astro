import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { neon } from '@neondatabase/serverless'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { personId, isActive } = await req.json()

    if (!personId) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Update person's active status
    await sql`
      UPDATE people 
      SET is_active = ${!isActive},
          updated_at = NOW()
      WHERE id = ${personId} 
      AND created_by_user_id = ${userId}
    `

    return NextResponse.json({ 
      success: true,
      isActive: !isActive
    })

  } catch (error: unknown) {
    console.error("Error toggling person active status:", error)
    return NextResponse.json(
      { error: "Failed to update person status" },
      { status: 500 }
    )
  }
}
