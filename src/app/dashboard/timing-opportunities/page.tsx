"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Calendar, Sparkles, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PersonalAnalysis {
  major_luck_cycles: Array<{
    ageRange: string
    luckType: string
    keyEvents: string
  }>
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
}

export default function TimingOpportunitiesPage() {
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
      console.error("Error fetching timing analysis:", error)
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
        <h1 className="text-3xl font-bold">Timing & Opportunity Reader</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground text-center">
              Complete your destiny profile to view timing and opportunities
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - 1980 // This should be calculated from actual birth year

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Timing & Opportunity Reader</h1>
        <p className="text-muted-foreground">
          Know when to act and when to wait
        </p>
      </div>

      {/* Current Period */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Current Life Period
          </CardTitle>
          <CardDescription>Your present luck cycle and opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.major_luck_cycles
            .filter(cycle => {
              const [start, end] = cycle.ageRange.split('-').map(Number)
              return currentAge >= start && currentAge <= end
            })
            .map((cycle, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary">{cycle.ageRange} years old</Badge>
                  <span className="font-semibold">{cycle.luckType}</span>
                </div>
                <p className="text-sm leading-relaxed">{cycle.keyEvents}</p>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Upcoming Opportunities - Next 5 Years */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Next 5 Years (2025-2030)
          </CardTitle>
          <CardDescription>Upcoming opportunities and optimal timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold">💰 Wealth Opportunities</h4>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.wealth}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">💼 Career Timing</h4>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.career}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-pink-600" />
                <h4 className="font-semibold">❤️ Relationship Windows</h4>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.relationship}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" />
                <h4 className="font-semibold">🏥 Health Focus</h4>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.future_5_years.health}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Long-term Outlook - Next 10 Years */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Next 10 Years (2025-2035)
          </CardTitle>
          <CardDescription>Long-term trends and strategic timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">💰 Wealth Trajectory</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.wealth}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">💼 Career Evolution</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.career}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">❤️ Relationship Development</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.relationship}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">🏥 Health Maintenance</h4>
              <p className="text-sm text-muted-foreground">{analysis.future_10_years.health}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Luck Cycles Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Life Timeline</CardTitle>
          <CardDescription>All major luck cycles and their characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.major_luck_cycles.map((cycle, index) => {
            const [start, end] = cycle.ageRange.split('-').map(Number)
            const isCurrent = currentAge >= start && currentAge <= end
            const isPast = currentAge > end
            const isFuture = currentAge < start
            
            return (
              <div 
                key={index} 
                className={`border-l-2 pl-4 space-y-2 ${
                  isCurrent ? 'border-primary' : isPast ? 'border-muted' : 'border-green-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isCurrent ? "default" : "outline"}
                    className={isPast ? 'opacity-50' : ''}
                  >
                    {cycle.ageRange}
                  </Badge>
                  <span className={`text-sm font-medium ${isPast ? 'text-muted-foreground' : ''}`}>
                    {cycle.luckType}
                  </span>
                  {isCurrent && <Badge className="bg-primary">Current</Badge>}
                  {isFuture && <Badge variant="outline" className="bg-green-500/10 text-green-600">Upcoming</Badge>}
                </div>
                <p className={`text-sm ${isPast ? 'text-muted-foreground' : ''}`}>
                  {cycle.keyEvents}
                </p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Optimal Action Windows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 border border-green-500/20 bg-green-500/5 rounded-lg">
            <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-xs font-bold">GO</span>
            </div>
            <div>
              <p className="font-medium text-green-600">Best Time to Act</p>
              <p className="text-sm text-muted-foreground">
                Favorable periods for new ventures, investments, and major decisions based on your current and upcoming luck cycles
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg">
            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-xs font-bold">⏸</span>
            </div>
            <div>
              <p className="font-medium text-amber-600">Wait and Prepare</p>
              <p className="text-sm text-muted-foreground">
                Use moderate periods to build foundations, gather resources, and plan for future opportunities
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
            <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-xs font-bold">⏹</span>
            </div>
            <div>
              <p className="font-medium text-red-600">Hold and Protect</p>
              <p className="text-sm text-muted-foreground">
                During challenging periods, focus on preservation, avoid risks, and maintain what you have
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
