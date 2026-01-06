"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, TrendingUp, AlertTriangle, Calendar, FileText, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiveElementsChart } from "@/components/five-elements-chart"
import { ShareDialog } from "@/components/share-dialog"
import { PDFExportButton } from "@/components/pdf-export-button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TopicSelector, type Topic } from "@/components/topic-selector"
import { type Locale } from "@/lib/i18n"
import { useTranslations } from 'next-intl'

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
  future_5: {
    wealth: string
    career: string
    relationship: string
    health: string
  }
  future_10: {
    wealth: string
    career: string
    relationship: string
    health: string
  }
  future_20?: {
    wealth: string
    career: string
    relationship: string
    health: string
  }
  chance_prediction?: {
    year: string
    wealth: string
    career: string
    relationship: string
    health: string
  }
  risk_prediction?: {
    year: string
    wealth: string
    career: string
    relationship: string
    health: string
  }
  timing_opportunities?: {
    referenceDate: string
    windows: Array<{
      startYear: number
      endYear: number
      type: 'opportunity' | 'risk'
      focus: string[]
      elementInfluence: string[]
      description: string
    }>
  }
  selected_topic?: string
  question?: string
  language?: string
  analyzed_at: string
}

export default function ReportPage() {
  const t = useTranslations('report')
  const tCommon = useTranslations('common')
  const [analysis, setAnalysis] = useState<PersonalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [personId, setPersonId] = useState<string | null>(null)
  const [personName, setPersonName] = useState<string>('')
  const [reanalyzing, setReanalyzing] = useState(false)
  const [showTopicDialog, setShowTopicDialog] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [analysisLocale, setAnalysisLocale] = useState<Locale>('en')
  const [customPrompt, setCustomPrompt] = useState('')

  useEffect(() => {
    // Get personId from URL query parameter
    const params = new URLSearchParams(window.location.search)
    const queryPersonId = params.get('personId')
    
    if (queryPersonId) {
      setPersonId(queryPersonId)
      fetchAnalysis(queryPersonId)
    } else {
      // Fallback: fetch self profile
      fetchSelfProfile()
    }
  }, [])

  const fetchSelfProfile = async () => {
    try {
      const peopleResponse = await fetch("/api/people")
      if (peopleResponse.ok) {
        const people = await peopleResponse.json()
        const self = people.find((p: { is_user_self: boolean }) => p.is_user_self)
        
        if (self) {
          setPersonId(self.id)
          setPersonName(self.name)
          await fetchAnalysis(self.id)
        }
      }
    } catch (error) {
      console.error("Error fetching self profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysis = async (targetPersonId: string) => {
    try {
      // First, fetch person details to get name and verify ownership
      const personResponse = await fetch(`/api/people/${targetPersonId}`)
      if (!personResponse.ok) {
        console.error("Person not found or access denied")
        setLoading(false)
        return
      }
      
      const person = await personResponse.json()
      setPersonName(person.name)
      
      // Then fetch analysis
      const analysisResponse = await fetch(`/api/personal-analysis/${targetPersonId}`)
      if (analysisResponse.ok) {
        const data = await analysisResponse.json()
            
            // Parse JSONB fields - PostgreSQL returns JSONB as objects, not strings
            const safeParse = (value: unknown, fallback: unknown) => {
              // If value is null or undefined, return fallback
              if (value === null || value === undefined) {
                return fallback
              }
              // If it's a string, try to parse it
              if (typeof value === 'string') {
                try {
                  return JSON.parse(value)
                } catch {
                  return fallback
                }
              }
              // If it's already an object/array, return it directly
              return value
            }
            
            // Transform major_luck_cycles from database format to UI format
            let transformedCycles = []
            const rawCycles = safeParse(data.major_luck_cycles, null)
            if (rawCycles && typeof rawCycles === 'object' && 'cycles' in rawCycles) {
              // Database format: { cycles: [{age, element, description}], current: {...} }
              transformedCycles = (rawCycles as any).cycles.map((cycle: any) => ({
                ageRange: cycle.age,
                luckType: cycle.element,
                keyEvents: cycle.description
              }))
            } else if (Array.isArray(rawCycles)) {
              // Already in array format
              transformedCycles = rawCycles
            }
            
            const parsedData = {
              ...data,
              major_luck_cycles: transformedCycles,
              career_direction: safeParse(data.career_direction, { suitable: [], unsuitable: [] }),
              risk_periods: safeParse(data.risk_periods, { major: [], secondary: [], risk_type: [] }),
              future_5: safeParse(data.future_5, { wealth: '', career: '', relationship: '', health: '' }),
              future_10: safeParse(data.future_10, { wealth: '', career: '', relationship: '', health: '' }),
              future_20: safeParse(data.future_20, null),
              chance_prediction: safeParse(data.chance_prediction, null),
              risk_prediction: safeParse(data.risk_prediction, null),
              timing_opportunities: safeParse(data.timing_opportunities, null),
            }
            
            setAnalysis(parsedData)
          } else {
            // No analysis found
            setAnalysis(null)
          }
        } catch (error) {
          console.error("Error fetching analysis:", error)
        } finally {
          setLoading(false)
        }
      }

  const handleReanalyze = () => {
    if (!personId) return
    setShowTopicDialog(true)
  }

  const confirmReanalyze = async () => {
    if (!personId) return
    if (!selectedTopic && !customPrompt) {
      alert("Please select a topic or type your own question.")
      return
    }

    setShowTopicDialog(false)
    setReanalyzing(true)
    
    try {
      let topicPrompt = customPrompt
      
      if (!customPrompt && selectedTopic) {
        const messages = await import(`@/../messages/${analysisLocale}.json`)
        topicPrompt = messages.default.onboarding.topicPrompts[selectedTopic]
      }

      const response = await fetch(`/api/people/${personId}/reanalyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          language: analysisLocale,
          selectedTopic: selectedTopic || 'custom',
          topicPrompt,
        }),
      })

      if (response.ok) {
        alert("Re-analysis triggered! Your updated report will be available in a few minutes.")
        setSelectedTopic(null)
        setCustomPrompt('')
        if (personId) {
          await fetchAnalysis(personId)
        }
      } else {
        alert("Failed to trigger re-analysis. Please try again.")
      }
    } catch (error) {
      console.error("Error reanalyzing:", error)
      alert("Failed to trigger re-analysis. Please try again.")
    } finally {
      setReanalyzing(false)
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
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {personName ? `${personName}'s analysis` : 'Your comprehensive life analysis'}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{tCommon('loading')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {personName ? `${personName} hasn't been analyzed yet. ` : ''}
              Click "Analyze" in People Management to generate the analysis report.
            </p>
            <Button onClick={() => window.location.href = "/dashboard/people"}>
              <Sparkles className="mr-2 h-4 w-4" />
              Go to People Management
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - 1980 // Calculate from actual birth year

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto" id="report-content">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Destiny Analysis Report</h1>
          <p className="text-muted-foreground">
            {personName && <span className="font-semibold">{personName}</span>}
            {personName && ' • '}
            Generated on {new Date(analysis.analyzed_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {personId && <ShareDialog personId={personId} />}
          <PDFExportButton personName={personName || "Destiny Report"} />
          <Button onClick={handleReanalyze} disabled={reanalyzing}>
            {reanalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Re-analyze</>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="destiny">Destiny Profile</TabsTrigger>
          <TabsTrigger value="risks">Risk & Warning</TabsTrigger>
          <TabsTrigger value="timing">Timing & Opportunities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('overallStructure')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.overall_structure}</p>
            </CardContent>
          </Card>

          {/* Analysis Focus Card */}
          {(analysis.selected_topic || analysis.question) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('analysisFocus')}</CardTitle>
                <CardDescription>The specific topic and question for this analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.selected_topic && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Topic</p>
                    <p className="text-sm">{analysis.selected_topic}</p>
                  </div>
                )}
                {analysis.question && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Question</p>
                    <p className="text-sm leading-relaxed">{analysis.question}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Five Elements - Combined Chart */}
          {analysis.five_elements && (
            <Card>
              <CardHeader>
                <CardTitle>{t('fiveElements')} (五行)</CardTitle>
                <CardDescription>Your elemental energy distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FiveElementsChart data={analysis.five_elements} />
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">木 Wood</p>
                    <p className="text-2xl font-bold text-green-600">{analysis.five_elements.wood}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">火 Fire</p>
                    <p className="text-2xl font-bold text-red-600">{analysis.five_elements.fire}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">土 Earth</p>
                    <p className="text-2xl font-bold text-yellow-600">{analysis.five_elements.earth}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">金 Metal</p>
                    <p className="text-2xl font-bold text-gray-600">{analysis.five_elements.metal}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">水 Water</p>
                    <p className="text-2xl font-bold text-blue-600">{analysis.five_elements.water}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Destiny Profile Tab */}
        <TabsContent value="destiny" className="space-y-6">
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
              {Array.isArray(analysis.major_luck_cycles) && analysis.major_luck_cycles.length > 0 ? (
                analysis.major_luck_cycles.map((cycle, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{cycle.ageRange}</Badge>
                      <span className="text-sm font-medium">{cycle.luckType}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{cycle.keyEvents}</p>
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Major Luck Cycles data is not available. Please re-analyze your profile with the correct AI configuration.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Career Direction */}
          <Card>
            <CardHeader>
              <CardTitle>{t('careerDirection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-600">✓ Suitable Careers</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(analysis.career_direction?.suitable) && analysis.career_direction.suitable.length > 0 ? (
                    analysis.career_direction.suitable.map((career, index) => (
                      <Badge key={index} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        {career}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600">✗ Unsuitable Careers</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(analysis.career_direction?.unsuitable) && analysis.career_direction.unsuitable.length > 0 ? (
                    analysis.career_direction.unsuitable.map((career, index) => (
                      <Badge key={index} variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                        {career}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Predictions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next 5 Years
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_5.wealth}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_5.career}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_5.relationship}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_5.health}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Next 10 Years
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_10.wealth}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_10.career}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_10.relationship}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
                  <p className="text-sm text-muted-foreground">{analysis.future_10.health}</p>
                </div>
              </CardContent>
            </Card>

            {analysis.future_20 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Next 20 Years
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
                    <p className="text-sm text-muted-foreground">{analysis.future_20.wealth}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
                    <p className="text-sm text-muted-foreground">{analysis.future_20.career}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
                    <p className="text-sm text-muted-foreground">{analysis.future_20.relationship}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
                    <p className="text-sm text-muted-foreground">{analysis.future_20.health}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Risk & Warning Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Risk Awareness System</AlertTitle>
            <AlertDescription>
              These periods require extra caution and careful decision-making
            </AlertDescription>
          </Alert>

          {/* Upcoming Risk Prediction */}
          {analysis.risk_prediction && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Upcoming Risk Period: {analysis.risk_prediction.year}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
                  <p className="text-sm text-muted-foreground">{analysis.risk_prediction.wealth}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
                  <p className="text-sm text-muted-foreground">{analysis.risk_prediction.career}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
                  <p className="text-sm text-muted-foreground">{analysis.risk_prediction.relationship}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
                  <p className="text-sm text-muted-foreground">{analysis.risk_prediction.health}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Opportunity */}
          {analysis.chance_prediction && (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Sparkles className="h-5 w-5" />
                  Upcoming Opportunity: {analysis.chance_prediction.year}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-1">💰 Wealth</h4>
                  <p className="text-sm text-muted-foreground">{analysis.chance_prediction.wealth}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">💼 Career</h4>
                  <p className="text-sm text-muted-foreground">{analysis.chance_prediction.career}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">❤️ Relationship</h4>
                  <p className="text-sm text-muted-foreground">{analysis.chance_prediction.relationship}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">🏥 Health</h4>
                  <p className="text-sm text-muted-foreground">{analysis.chance_prediction.health}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                High-Risk Periods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.risk_periods.major.map((period, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-600">{period}</p>
                    <p className="text-sm text-muted-foreground">Major challenges expected</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Moderate Risk Periods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.risk_periods.secondary.map((period, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-600">{period}</p>
                    <p className="text-sm text-muted-foreground">Moderate challenges possible</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types of Challenges</CardTitle>
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
        </TabsContent>

        {/* Timing & Opportunities Tab */}
        <TabsContent value="timing" className="space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Current Life Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(analysis.major_luck_cycles) && analysis.major_luck_cycles.length > 0 ? (
                analysis.major_luck_cycles
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
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No current life period data available</p>
              )}
            </CardContent>
          </Card>

          {/* Timing Windows */}
          {analysis.timing_opportunities && analysis.timing_opportunities.windows && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Strategic Timing Windows
                </CardTitle>
                <CardDescription>
                  Optimal periods for action based on elemental influences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.timing_opportunities.windows.map((window, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${
                      window.type === 'opportunity' 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {window.type === 'opportunity' ? (
                          <Sparkles className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          window.type === 'opportunity' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {window.startYear} - {window.endYear}
                        </span>
                      </div>
                      <Badge variant={window.type === 'opportunity' ? 'default' : 'destructive'}>
                        {window.type === 'opportunity' ? 'Opportunity' : 'Risk'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{window.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Focus Areas:</span>
                      {window.focus.map((focus, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Elements:</span>
                      {window.elementInfluence.map((element, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Complete Life Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(analysis.major_luck_cycles) && analysis.major_luck_cycles.length > 0 ? (
                analysis.major_luck_cycles.map((cycle, index) => {
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
                })
              ) : (
                <p className="text-sm text-muted-foreground">No timeline data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Topic Selection Dialog */}
      <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Analysis Topic</DialogTitle>
            <DialogDescription>
              Choose what you want to know about your future
            </DialogDescription>
          </DialogHeader>
          
          <TopicSelector
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            locale={analysisLocale}
            onLocaleChange={setAnalysisLocale}
            showLanguageSelector={true}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopicDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReanalyze} 
              disabled={(!selectedTopic && !customPrompt) || reanalyzing}
            >
              {reanalyzing ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Start Re-analysis</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
