import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import pool from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log('[Delete Prediction] Request for ID:', id, 'by user:', userId)

  try {
    // Check if prediction exists and belongs to user
    const checkResult = await pool.query(
      `SELECT id FROM predictions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )

    if (checkResult.rows.length === 0) {
      console.log('[Delete Prediction] Not found or unauthorized')
      return NextResponse.json(
        { error: "Prediction not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete the prediction
    await pool.query(
      `DELETE FROM predictions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )

    console.log('[Delete Prediction] Successfully deleted')

    return NextResponse.json({
      success: true,
      message: "Prediction deleted successfully"
    })
  } catch (error: unknown) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 }
    )
  }
}
