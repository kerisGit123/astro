"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Heart, Users, Loader2, Eye, RefreshCw, Share2, Calendar, Briefcase, Home, Star, Grid3x3, List, LayoutGrid, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ZodiacProgress } from "@/components/zodiac-progress"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from 'next-intl'

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

type AnalysisType = 'love' | 'business' | 'work' | 'family' | 'friend'
type ViewMode = 'grid' | 'list' | 'card'

const getAnalysisTypeConfig = (t: any) => ({
  love: {
    title: t('types.love.title'),
    description: t('types.love.description'),
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  business: {
    title: t('types.business.title'),
    description: t('types.business.description'),
    icon: Briefcase,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  work: {
    title: t('types.work.title'),
    description: t('types.work.description'),
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  family: {
    title: t('types.family.title'),
    description: t('types.family.description'),
    icon: Home,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  friend: {
    title: t('types.friend.title'),
    description: t('types.friend.description'),
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
})

export default function CompatibilityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('compatibility')
  const typeParam = searchParams.get('type') as AnalysisType || 'love'
  
  const [people, setPeople] = useState<Person[]>([])
  const [selfProfile, setSelfProfile] = useState<Person | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyses, setAnalyses] = useState<CompatibilityAnalysis[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [analysisType, setAnalysisType] = useState<AnalysisType>(typeParam)
  
  const analysisTypeConfig = getAnalysisTypeConfig(t)
  const config = analysisTypeConfig[analysisType]
  const IconComponent = config.icon

  useEffect(() => {
    fetchPeople()
    fetchAnalyses()
  }, [analysisType])

  useEffect(() => {
    setAnalysisType(typeParam)
  }, [typeParam])

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
        setAnalyses(data.filter((a: CompatibilityAnalysis) => a.analysis_type === analysisType))
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
          analysisType: analysisType
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

  const handleDelete = async (analysisId: string, personAName: string, personBName: string) => {
    if (!confirm(`Delete compatibility analysis for ${personAName} & ${personBName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/compatibility/${analysisId}/delete`, {
        method: "DELETE"
      })

      if (response.ok) {
        alert("Analysis deleted successfully!")
        fetchAnalyses()
      } else {
        const data = await response.json()
        alert(`Failed to delete: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error deleting analysis:", error)
      alert("Failed to delete analysis")
    }
  }

  const getOverallScore = (resultData: any) => {
    if (!resultData) return null
    return resultData.marriagePotential?.overallScore || 
           resultData.partnershipPotential?.overallScore ||
           resultData.teamDynamics?.overallScore ||
           resultData.familyHarmony?.overallScore ||
           resultData.friendshipCompatibility?.overallScore ||
           resultData.overall_score || 
           null
  }

  const analyzeCompatibility = async () => {
    if (!selectedPerson || !selfProfile) return
    
    setAnalyzing(true)
    
    try {
      const getLanguageFromCookie = () => {
        const cookies = document.cookie.split(';')
        const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='))
        return localeCookie ? localeCookie.split('=')[1] : 'zh'
      }

      const language = getLanguageFromCookie()

      const response = await fetch("/api/compatibility/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId: selfProfile.id,
          personBId: selectedPerson,
          language,
          analysisType: analysisType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Failed to start analysis: ${data.error || 'Unknown error'}`)
        setAnalyzing(false)
        return
      }

      alert("Analysis started! Results will be available shortly.")
      fetchAnalyses()
      
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

  const filteredAnalyses = analyses.filter(analysis => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      analysis.personA?.name.toLowerCase().includes(query) ||
      analysis.personB?.name.toLowerCase().includes(query)
    )
  })

  const renderAnalysisCard = (analysis: CompatibilityAnalysis, mode: ViewMode) => {
    const score = getOverallScore(analysis.result_data)
    const hasResults = analysis.result_data && Object.keys(analysis.result_data).length > 1

    if (mode === 'list') {
      return (
        <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{analysis.personA?.name || "Person A"} & {analysis.personB?.name || "Person B"}</span>
              {score !== null && (
                <Badge variant={score >= 70 ? "default" : "secondary"} className="text-xs">
                  {score}%
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(analysis.created_at)}
              {!hasResults && <span className="text-xs">• Analysis in progress...</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleViewReport(analysis.id)} disabled={!hasResults} size="sm" variant="default">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button onClick={() => handleReanalyze(analysis)} size="sm" variant="outline">
              <RefreshCw className="mr-1 h-3 w-3" />
              Re-analyze
            </Button>
            <Button onClick={() => handleShare(analysis.id)} size="sm" variant="outline">
              <Share2 className="mr-1 h-3 w-3" />
              Share
            </Button>
            <Button 
              onClick={() => handleDelete(analysis.id, analysis.personA?.name || "Person A", analysis.personB?.name || "Person B")} 
              size="sm" 
              variant="destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Card key={analysis.id} className={mode === 'card' ? 'hover:shadow-lg transition-shadow' : ''}>
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
            <Button onClick={() => handleViewReport(analysis.id)} disabled={!hasResults} size="sm" variant="default">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button onClick={() => handleReanalyze(analysis)} size="sm" variant="outline">
              <RefreshCw className="mr-1 h-3 w-3" />
              Re-analyze
            </Button>
            <Button onClick={() => handleShare(analysis.id)} size="sm" variant="outline">
              <Share2 className="mr-1 h-3 w-3" />
              Share
            </Button>
            <Button 
              onClick={() => handleDelete(analysis.id, analysis.personA?.name || "Person A", analysis.personB?.name || "Person B")} 
              size="sm" 
              variant="destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
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
  }
  
  const getCompatibilityMessage = () => {
    const messages: Record<string, string> = {
      love: "Analyzing love compatibility... 💕",
      business: "Analyzing business compatibility... 💼",
      work: "Analyzing work compatibility... 🤝",
      family: "Analyzing family compatibility... 🏠",
      friend: "Analyzing friendship compatibility... ⭐"
    }
    return messages[analysisType] || "Analyzing compatibility... 🔮"
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
      <ZodiacProgress isLoading={analyzing} message={getCompatibilityMessage()} />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header with Type Selector */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconComponent className={`h-8 w-8 ${config.color}`} />
            {config.title}
          </h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Select value={analysisType} onValueChange={(value) => router.push(`/dashboard/compatibility?type=${value}`)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(analysisTypeConfig).map(([key, cfg]) => {
              const Icon = cfg.icon
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    {cfg.title}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Analyze Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${config.color}`} />
            {t('selectPerson')}
          </CardTitle>
          <CardDescription>
            {t('choosePersonToAnalyze')}
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
              <label className="text-sm font-medium mb-2 block">{t('selectPerson')}</label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue placeholder={t('choosePerson')} />
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
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('analyzing')}</>
            ) : (
              <><IconComponent className="mr-2 h-4 w-4" />{t('analyze')}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Analyses */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('previousAnalyses')}</h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchByName')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="grid" className="px-3">
                    <Grid3x3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="card" className="px-3">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analyses found matching "{searchQuery}"</p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' :
              viewMode === 'list' ? 'space-y-2' :
              'grid gap-4 md:grid-cols-2'
            }>
              {filteredAnalyses.map(analysis => renderAnalysisCard(analysis, viewMode))}
            </div>
          )}
        </div>
      )}

      {otherPeople.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noPeople')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('noPeopleDesc')}
            </p>
            <Button onClick={() => router.push("/dashboard/people")}>
              {t('addPeople')}
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  )
}
