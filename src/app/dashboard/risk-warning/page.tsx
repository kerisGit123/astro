"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, Shield, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PersonalAnalysis {
  risk_periods: {
    major: string[]
    secondary: string[]
    risk_type: string[]
  }
  major_luck_cycles: Array<{
    ageRange: string
    luckType: string
    keyEvents: string
  }>
}

export default function RiskWarningPage() {
  const [analysis, setAnalysis] = useState<PersonalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    try {
      const peopleResponse = await fetch("/api/people")
      if (peopleResponse.ok) {
        const people = await peopleResponse.json()
        const self = people.find((p: { is_user_self: boolean }) => p.is_user_self)
        
        if (self) {
          const analysisResponse = await fetch(`/api/personal-analysis/${self.id}`)
          if (analysisResponse.ok) {
            const data = await analysisResponse.json()
            setAnalysis(data)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching risk analysis:", error)
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
        <h1 className="text-3xl font-bold">Risk & Warning System</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground text-center">
              Complete your destiny profile to view risk periods and warnings
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Risk & Warning System</h1>
        <p className="text-muted-foreground">
          Identify challenging periods and prepare accordingly
        </p>
      </div>

      {/* Major Risk Periods */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Major Risk Periods</AlertTitle>
        <AlertDescription>
          These periods require extra caution and careful decision-making
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            High-Risk Periods
          </CardTitle>
          <CardDescription>Periods requiring heightened awareness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.risk_periods.major.map((period, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-600">{period}</p>
                <p className="text-sm text-muted-foreground">Major challenges expected</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Secondary Risk Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Moderate Risk Periods
          </CardTitle>
          <CardDescription>Periods requiring attention but manageable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.risk_periods.secondary.map((period, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-600">{period}</p>
                <p className="text-sm text-muted-foreground">Moderate challenges possible</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Types */}
      <Card>
        <CardHeader>
          <CardTitle>Types of Challenges</CardTitle>
          <CardDescription>Common risk patterns in your chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.risk_periods.risk_type.map((type, index) => (
              <Badge key={index} variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenging Luck Cycles */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Challenges</CardTitle>
          <CardDescription>Past difficult periods and their lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.major_luck_cycles
            .filter(cycle => cycle.luckType.includes('劫') || cycle.keyEvents.includes('艰难') || cycle.keyEvents.includes('压力') || cycle.keyEvents.includes('欺凌'))
            .map((cycle, index) => (
              <div key={index} className="border-l-2 border-amber-500 pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                    {cycle.ageRange}
                  </Badge>
                  <span className="text-sm font-medium">{cycle.luckType}</span>
                </div>
                <p className="text-sm text-muted-foreground">{cycle.keyEvents}</p>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Protection Strategies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">1</span>
            </div>
            <div>
              <p className="font-medium">Avoid Major Decisions</p>
              <p className="text-sm text-muted-foreground">
                During high-risk periods, postpone major life decisions like career changes, investments, or relocations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">2</span>
            </div>
            <div>
              <p className="font-medium">Build Support Network</p>
              <p className="text-sm text-muted-foreground">
                Strengthen relationships with trusted advisors, mentors, and family members
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">3</span>
            </div>
            <div>
              <p className="font-medium">Financial Prudence</p>
              <p className="text-sm text-muted-foreground">
                Maintain emergency funds and avoid high-risk investments during challenging periods
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm">4</span>
            </div>
            <div>
              <p className="font-medium">Health Focus</p>
              <p className="text-sm text-muted-foreground">
                Prioritize physical and mental health through regular exercise, proper rest, and stress management
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
