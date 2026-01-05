"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Users, Loader2, Eye, RefreshCw, Share2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ZodiacProgress } from "@/components/zodiac-progress"
import { useRouter } from "next/navigation"

interface Person {
  id: string
  name: string
  birth_date: string
  birth_time?: string
  birth_location?: string
  gender?: string
  is_user_self: boolean
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

export default function LoveCompatibilityPage() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [selfProfile, setSelfProfile] = useState<Person | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyses, setAnalyses] = useState<CompatibilityAnalysis[]>([])

  useEffect(() => {
    fetchPeople()
    fetchAnalyses()
  }, [])

  const fetchPeople = async () => {
    try {
      const response = await fetch("/api/people")
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
        const self = data.find((p: Person) => p.is_user_self)
        setSelfProfile(self)
      }
    } catch (error) {
      console.error("Error fetching people:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyses = async () => {
    try {
      const response = await fetch("/api/compatibility/list")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.filter((a: CompatibilityAnalysis) => a.analysis_type === 'love'))
      }
    } catch (error) {
      console.error("Error fetching analyses:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleViewReport = (analysisId: string) => {
    router.push(`/dashboard/compatibility-report?id=${analysisId}`)
  }

  const handleReanalyze = async (analysis: CompatibilityAnalysis) => {
    if (!confirm("Re-analyze this compatibility? This will replace existing results.")) {
      return
    }

    setAnalyzing(true)
    try {
      const getLanguageFromCookie = () => {
        const cookies = document.cookie.split(';')
        const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='))
        return localeCookie ? localeCookie.split('=')[1] : 'zh'
      }

      const response = await fetch("/api/compatibility/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId: analysis.person_a_id,
          personBId: analysis.person_b_id,
          language: getLanguageFromCookie(),
          analysisType: 'love'
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
    } finally {
      setAnalyzing(false)
    }
  }

  const handleShare = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/compatibility/${analysisId}/share`, {
        method: "POST"
      })
      if (response.ok) {
        const data = await response.json()
        const shareUrl = `${window.location.origin}/shared/compatibility/${data.shareToken}`
        await navigator.clipboard.writeText(shareUrl)
        alert("Share link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error creating share link:", error)
      alert("Share feature coming soon!")
    }
  }

  const getOverallScore = (resultData: any) => {
    if (!resultData) return null
    return resultData.marriagePotential?.overallScore || resultData.overall_score || null
  }

  const analyzeCompatibility = async () => {
    if (!selectedPerson || !selfProfile) return
    
    setAnalyzing(true)
    
    try {
      // Get language from cookie
      const getLanguageFromCookie = () => {
        const cookies = document.cookie.split(';')
        const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='))
        return localeCookie ? localeCookie.split('=')[1] : 'zh'
      }

      const language = getLanguageFromCookie()

      console.log("Starting compatibility analysis:", {
        personAId: selfProfile.id,
        personBId: selectedPerson,
        language,
        analysisType: 'love'
      })

      const response = await fetch("/api/compatibility/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId: selfProfile.id,
          personBId: selectedPerson,
          language,
          analysisType: 'love'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Compatibility analysis failed:", data)
        alert(`Failed to start analysis: ${data.error || 'Unknown error'}`)
        setAnalyzing(false)
        return
      }

      console.log("Compatibility analysis triggered:", data)
      
      // Show success message
      alert("Compatibility analysis started! This may take a few minutes. Results will be saved and you can check back later.")
      
      // Refresh analyses list
      fetchAnalyses()
      
      // Keep analyzing state for a moment then clear
      setTimeout(() => {
        setAnalyzing(false)
        setSelectedPerson("")
      }, 2000)

    } catch (error) {
      console.error("Error analyzing compatibility:", error)
      alert("Failed to start compatibility analysis. Please try again.")
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const otherPeople = people.filter(p => !p.is_user_self)

  return (
    <>
      <ZodiacProgress isLoading={analyzing} message="Analyzing love compatibility... 💕" />
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Love & Compatibility Analysis</h1>
        <p className="text-muted-foreground">
          Analyze relationship compatibility with friends, partners, or family
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Select Person to Analyze
          </CardTitle>
          <CardDescription>
            Choose someone from your people list to analyze compatibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Your Profile</label>
              <div className="p-3 border rounded-lg bg-muted">
                <p className="font-medium">{selfProfile?.name || "Not set"}</p>
                {selfProfile?.birth_date && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selfProfile.birth_date)}
                  </p>
                )}
              </div>
            </div>
            
            <Users className="h-6 w-6 text-muted-foreground mt-6" />
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Person</label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {otherPeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={analyzeCompatibility} 
            disabled={!selectedPerson || analyzing}
            className="w-full"
          >
            {analyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
            ) : (
              <><Heart className="mr-2 h-4 w-4" />Analyze Compatibility</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Analyses */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Previous Analyses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {analyses.map((analysis) => {
              const score = getOverallScore(analysis.result_data)
              const hasResults = analysis.result_data && Object.keys(analysis.result_data).length > 1

              return (
                <Card key={analysis.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {analysis.personA?.name || "Person A"} & {analysis.personB?.name || "Person B"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(analysis.created_at)}
                          </span>
                          {score !== null && (
                            <Badge variant={score >= 70 ? "default" : "secondary"} className="text-xs">
                              {score}%
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleViewReport(analysis.id)}
                        disabled={!hasResults}
                        size="sm"
                        variant="default"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleReanalyze(analysis)}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Re-analyze
                      </Button>
                      <Button
                        onClick={() => handleShare(analysis.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Share
                      </Button>
                    </div>
                    {!hasResults && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Analysis in progress...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {otherPeople.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No People Added</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add friends, partners, or family members to analyze compatibility
            </p>
            <Button onClick={() => window.location.href = "/dashboard/people"}>
              Add People
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  )
}
