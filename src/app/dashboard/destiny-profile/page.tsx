"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, TrendingUp, AlertTriangle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PersonalAnalysis {
  id: string
  person_id: string
  overall_structure: string
  five_elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  energy_chart: string
  major_luck_cycles: Array<{
    ageRange: string
    luckType: string
    keyEvents: string
  }>
  career_direction: {
    suitable: string[]
    unsuitable: string[]
  }
  risk_periods: {
    major: string[]
    secondary: string[]
    risk_type: string[]
  }
  future_5_years: {
    wealth: string
    career: string
    relationship: string
    health: string
  }
  future_10_years: {
    wealth: string
    career: string
    relationship: string
    health: string
  }
  analyzed_at: string
}

export default function DestinyProfilePage() {
  const [analysis, setAnalysis] = useState<PersonalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [personId, setPersonId] = useState<string | null>(null)

  useEffect(() => {
    fetchSelfProfile()
  }, [])

  const fetchSelfProfile = async () => {
    try {
      // Get self profile
      const peopleResponse = await fetch("/api/people")
      if (peopleResponse.ok) {
        const people = await peopleResponse.json()
        const self = people.find((p: { is_user_self: boolean }) => p.is_user_self)
        
        if (self) {
          setPersonId(self.id)
          // Get analysis
          const analysisResponse = await fetch(`/api/personal-analysis/${self.id}`)
          if (analysisResponse.ok) {
            const data = await analysisResponse.json()
            setAnalysis(data)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching destiny profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReanalyze = async () => {
    if (!personId) return
    
    setLoading(true)
    try {
      // Trigger re-analysis by updating the person (this will trigger n8n)
      const response = await fetch(`/api/people/${personId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send empty update to trigger re-analysis
          additionalInfo: analysis ? "" : undefined
        }),
      })

      if (response.ok) {
        alert("Re-analysis triggered! Results will be available shortly.")
        setTimeout(() => fetchSelfProfile(), 5000)
      }
    } catch (error) {
      console.error("Error triggering re-analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Destiny Profile</h1>
            <p className="text-muted-foreground">Your comprehensive life analysis</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Complete your profile with life events and personal info to generate your destiny analysis
            </p>
            <Button onClick={() => window.location.href = "/dashboard/people"}>
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const maxElement = Math.max(...Object.values(analysis.five_elements))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Destiny Profile</h1>
          <p className="text-muted-foreground">
            Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={handleReanalyze} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Re-analyze
        </Button>
      </div>

      {/* Overall Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Overall Life Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.overall_structure}</p>
        </CardContent>
      </Card>

      {/* Five Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Five Elements Balance (五行)</CardTitle>
          <CardDescription>Your elemental energy distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.five_elements).map(([element, value]) => (
            <div key={element} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{element}</span>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
              <Progress value={(value / maxElement) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Energy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap font-mono">{analysis.energy_chart}</pre>
        </CardContent>
      </Card>

      {/* Major Luck Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Major Luck Cycles
          </CardTitle>
          <CardDescription>Key life periods and their characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.major_luck_cycles.map((cycle, index) => (
            <div key={index} className="border-l-2 border-primary pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{cycle.ageRange}</Badge>
                <span className="text-sm font-medium">{cycle.luckType}</span>
              </div>
              <p className="text-sm text-muted-foreground">{cycle.keyEvents}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Career Direction */}
      <Card>
        <CardHeader>
          <CardTitle>Career Direction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2 text-green-600">✓ Suitable Careers</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.career_direction.suitable.map((career, index) => (
                <Badge key={index} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {career}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 text-red-600">✗ Unsuitable Careers</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.career_direction.unsuitable.map((career, index) => (
                <Badge key={index} variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  {career}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Predictions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next 5 Years (2025-2030)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.wealth}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.career}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.relationship}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.health}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next 10 Years (2025-2035)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.wealth}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.career}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.relationship}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.health}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
