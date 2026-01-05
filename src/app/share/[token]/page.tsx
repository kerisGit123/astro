import { notFound } from "next/navigation"
import pool from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnergyChart } from "@/components/energy-chart"
import { FiveElementsChart } from "@/components/five-elements-chart"

interface SharePageProps {
  params: Promise<{ token: string }>
}

async function getSharedAnalysis(token: string) {
  try {
    // Get share link and verify it's not expired
    const linkResult = await pool.query(
      `SELECT sl.*, p.name, p.birth_date, p.birth_time, p.birth_location
       FROM share_links sl
       JOIN people p ON sl.person_id = p.id
       WHERE sl.token = $1 AND sl.expires_at > NOW()`,
      [token]
    )

    if (linkResult.rows.length === 0) {
      return null
    }

    const link = linkResult.rows[0]

    // Get analysis data
    const analysisResult = await pool.query(
      `SELECT * FROM personal_analysis WHERE person_id = $1`,
      [link.person_id]
    )

    if (analysisResult.rows.length === 0) {
      return null
    }

    return {
      person: {
        name: link.name,
        birthDate: link.birth_date,
        birthTime: link.birth_time,
        birthLocation: link.birth_location
      },
      analysis: analysisResult.rows[0],
      expiresAt: link.expires_at
    }
  } catch (error) {
    console.error("Error fetching shared analysis:", error)
    return null
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const data = await getSharedAnalysis(token)

  if (!data) {
    notFound()
  }

  const { person, analysis, expiresAt } = data

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Destiny Analysis Report</h1>
          <p className="text-muted-foreground">
            Shared report for {person.name}
          </p>
          <p className="text-sm text-muted-foreground">
            This link expires on {new Date(expiresAt).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{analysis.overall_structure}</p>
          </CardContent>
        </Card>

        {/* Five Elements */}
        {analysis.five_elements && (
          <div className="grid md:grid-cols-2 gap-6">
            <EnergyChart data={analysis.five_elements} />
            <FiveElementsChart data={analysis.five_elements} />
          </div>
        )}

        {/* Major Luck Cycles */}
        {analysis.major_luck_cycles && (
          <Card>
            <CardHeader>
              <CardTitle>Major Luck Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.major_luck_cycles.map((cycle: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold">{cycle.ageRange} - {cycle.luckType}</h3>
                    <p className="text-sm text-muted-foreground">{cycle.keyEvents}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Direction */}
        {analysis.career_direction && (
          <Card>
            <CardHeader>
              <CardTitle>Career Direction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">✓ Suitable Careers</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.career_direction.suitable?.map((career: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-2">✗ Unsuitable Careers</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.career_direction.unsuitable?.map((career: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground pt-6">
          <p>Powered by ZiWei Path</p>
        </div>
      </div>
    </div>
  )
}
