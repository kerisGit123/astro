import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    await pool.query("DELETE FROM shared_reports WHERE share_token = $1", [token])
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting share link:", error)
    return NextResponse.json(
      { error: "Failed to delete share link" },
      { status: 500 }
    )
  }
}
