"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, Eye, RefreshCw, Calendar, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface Person {
  id: string
  name: string
  birth_date: string
}

interface CompatibilityAnalysis {
  id: string
  person_a_id: string
  person_b_id: string
  analysis_type: string
  result_data: any
  created_at: string
  personA?: Person
  personB?: Person
}

export default function CompatibilityHistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<CompatibilityAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch("/api/compatibility/list")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data)
      }
    } catch (error) {
      console.error("Error fetching compatibility analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (analysisId: string) => {
    router.push(`/dashboard/compatibility-report?id=${analysisId}`)
  }

  const handleReanalyze = async (analysis: CompatibilityAnalysis) => {
    if (!confirm("Are you sure you want to re-analyze this compatibility? This will replace the existing results.")) {
      return
    }

    try {
      const response = await fetch("/api/compatibility/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId: analysis.person_a_id,
          personBId: analysis.person_b_id,
          language: 'zh',
          analysisType: analysis.analysis_type
        })
      })

      if (response.ok) {
        alert("Re-analysis started! Results will be updated shortly.")
        fetchAnalyses()
      } else {
        alert("Failed to start re-analysis")
      }
    } catch (error) {
      console.error("Error re-analyzing:", error)
      alert("Failed to start re-analysis")
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      love: "Love & Romance",
      partner: "Business Partner",
      worker: "Colleague",
      family: "Family",
      friend: "Friendship"
    }
    return labels[type] || type
  }

  const getOverallScore = (resultData: any) => {
    if (!resultData) return null
    return resultData.marriagePotential?.overallScore || resultData.overall_score || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Compatibility Analysis History</h1>
        <p className="text-muted-foreground">
          View and manage your relationship compatibility analyses
        </p>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analyses Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start analyzing compatibility with friends, partners, or family
            </p>
            <Button onClick={() => router.push("/dashboard/love-compatibility")}>
              <Heart className="mr-2 h-4 w-4" />
              Analyze Compatibility
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => {
            const score = getOverallScore(analysis.result_data)
            const hasResults = analysis.result_data && Object.keys(analysis.result_data).length > 1

            return (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {analysis.personA?.name || "Person A"} & {analysis.personB?.name || "Person B"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">
                          {getAnalysisTypeLabel(analysis.analysis_type)}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                        {score !== null && (
                          <Badge variant={score >= 70 ? "default" : "secondary"}>
                            Score: {score}%
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewReport(analysis.id)}
                      disabled={!hasResults}
                      variant="default"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                    <Button
                      onClick={() => handleReanalyze(analysis)}
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Re-analyze
                    </Button>
                  </div>
                  {!hasResults && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Analysis in progress... Results will appear here when ready.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
