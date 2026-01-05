import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    console.log("[Compatibility Delete] Deleting analysis:", id)
    console.log("[Compatibility Delete] User ID:", userId)

    // Verify the analysis belongs to the user before deleting
    const checkResult = await pool.query(
      "SELECT id, user_id FROM compatibility_analyses WHERE id = $1",
      [id]
    )

    console.log("[Compatibility Delete] Check result:", checkResult.rows)

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Compatibility analysis not found" },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - analysis belongs to another user" },
        { status: 403 }
      )
    }

    // Delete the analysis (cascade will delete related shared links)
    await pool.query(
      "DELETE FROM compatibility_analyses WHERE id = $1 AND user_id = $2",
      [id, userId]
    )

    console.log("[Compatibility Delete] Successfully deleted analysis:", id)

    return NextResponse.json({
      success: true,
      message: "Compatibility analysis deleted successfully",
    })
  } catch (error: unknown) {
    console.error("Error deleting compatibility analysis:", error)
    return NextResponse.json(
      { error: "Failed to delete compatibility analysis" },
      { status: 500 }
    )
  }
}
