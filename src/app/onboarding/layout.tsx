import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import pool from "@/lib/db"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  // Ensure user exists in database
  try {
    const result = await pool.query(
      "SELECT id, onboarding_completed FROM users WHERE id = $1",
      [user.id]
    )

    if (result.rows.length === 0) {
      // Create user in database
      await pool.query(
        `INSERT INTO users (
          id, email, first_name, last_name, image_url,
          auth_provider, subscription_tier, onboarding_completed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING`,
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
    } else if (result.rows[0].onboarding_completed) {
      // If already completed onboarding, redirect to dashboard
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error in onboarding layout:", error)
  }

  return <>{children}</>
}
