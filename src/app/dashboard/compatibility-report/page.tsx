"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, Share2, Download, ArrowLeft, Users, TrendingUp, AlertTriangle, Lightbulb, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

interface CompatibilityReport {
  id: string
  personA: {
    personId: string
    overview: string
  }
  personB: {
    personId: string
    overview: string
  }
  // Love-specific
  relationshipDynamics?: {
    emotionalCompatibility: string
    communicationStyle: string
    mutualSupport: string
  }
  marriagePotential?: {
    overallScore: number
    stability: string
    commitmentLevel: string
    timingForMarriage: string
  }
  // Business-specific
  partnershipPotential?: {
    overallScore: number
    financialSynergy: string
    conflictManagement: string
    longTermViability: string
  }
  // Work/Team-specific
  teamDynamics?: {
    workStyleCompatibility: string
    communicationEfficiency: string
    responsibilityDistribution: string
    conflictResponse: string
  }
  teamPerformance?: {
    overallScore: number
    executionSynergy: string
    stressHandling: string
    longTermTeamStability: string
  }
  collaborationStyle?: any
  optimizationAdvice?: string
  // Family-specific
  familyHarmony?: {
    overallScore: number
    emotionalBonding: string
    communicationPattern: string
    supportSystem: string
  }
  generationalDynamics?: any
  // Friend-specific
  friendshipCompatibility?: {
    overallScore: number
    trustLevel: string
    sharedInterests: string
    emotionalSupport: string
  }
  friendshipDynamics?: {
    emotionalConnection: string
    communicationStyle: string
    trustAndLoyalty: string
    conflictSensitivity: string
  }
  friendshipPotential?: {
    overallScore: number
    mutualSupport: string
    compatibility: string
    longTermFriendship: string
  }
  socialDynamics?: any
  maintenanceAdvice?: string
  // Common fields
  strengths: string[]
  challenges?: string[]
  risks?: string[]
  longTermOutlook: string
  advice: string
  selectedTopic: string
  question: string
  recommendedStructure?: string
}

function CompatibilityReportContent() {
  const t = useTranslations('compatibilityReport')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const compatibilityId = searchParams.get('id')
  
  const [report, setReport] = useState<CompatibilityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [personAName, setPersonAName] = useState("")
  const [personBName, setPersonBName] = useState("")
  const [analysisType, setAnalysisType] = useState("love")

  useEffect(() => {
    if (compatibilityId) {
      fetchReport()
    }
  }, [compatibilityId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/compatibility/${compatibilityId}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data.result_data)
        setPersonAName(data.personA?.name || "Person A")
        setPersonBName(data.personB?.name || "Person B")
        setAnalysisType(data.analysis_type || "love")
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/compatibility/${compatibilityId}/share`, {
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
      alert("Failed to create share link")
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleDelete = async () => {
    if (!confirm(`Delete this compatibility analysis for ${personAName} & ${personBName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/compatibility/${compatibilityId}/delete`, {
        method: "DELETE"
      })

      if (response.ok) {
        alert("Analysis deleted successfully!")
        router.push(`/dashboard/compatibility?type=${analysisType}`)
      } else {
        const data = await response.json()
        alert(`Failed to delete: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error deleting analysis:", error)
      alert("Failed to delete analysis")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The compatibility report could not be loaded
            </p>
            <Button onClick={() => router.push("/dashboard/compatibility-history")}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToList')}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            {tCommon('share')}
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            {tCommon('exportPdf')}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon('delete')}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          {analysisType === 'love' && t('loveAnalysisTitle')}
          {analysisType === 'business' && t('businessAnalysisTitle')}
          {analysisType === 'work' && t('teamAnalysisTitle')}
          {analysisType === 'family' && t('familyAnalysisTitle')}
          {analysisType === 'friend' && t('friendAnalysisTitle')}
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-lg">{personAName} & {personBName}</span>
        </div>
      </div>

      {/* Overall Score with Gauge Chart */}
      {(report.marriagePotential || report.partnershipPotential || report.teamPerformance || report.familyHarmony || report.friendshipCompatibility || report.friendshipPotential) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              {t('overallScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Gauge Chart */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M 30 170 A 85 85 0 1 1 170 170"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Colored arc based on score */}
                  <path
                    d="M 30 170 A 85 85 0 1 1 170 170"
                    fill="none"
                    stroke={
                      (() => {
                        const score = report.marriagePotential?.overallScore || 
                                     report.partnershipPotential?.overallScore || 
                                     report.teamPerformance?.overallScore || 
                                     report.familyHarmony?.overallScore || 
                                     report.friendshipCompatibility?.overallScore || 
                                     report.friendshipPotential?.overallScore || 0
                        return score >= 85 ? "#22c55e" : score >= 70 ? "#eab308" : "#ef4444"
                      })()
                    }
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${(() => {
                      const score = report.marriagePotential?.overallScore || 
                                   report.partnershipPotential?.overallScore || 
                                   report.teamPerformance?.overallScore || 
                                   report.familyHarmony?.overallScore || 
                                   report.friendshipCompatibility?.overallScore || 
                                   report.friendshipPotential?.overallScore || 0
                      return (score / 100) * 267
                    })()} 267`}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Center text */}
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    className="text-5xl font-bold fill-current"
                  >
                    {report.marriagePotential?.overallScore || 
                     report.partnershipPotential?.overallScore || 
                     report.teamPerformance?.overallScore || 
                     report.familyHarmony?.overallScore || 
                     report.friendshipCompatibility?.overallScore || 
                     report.friendshipPotential?.overallScore || 0}
                  </text>
                  <text
                    x="100"
                    y="135"
                    textAnchor="middle"
                    className="text-xl fill-gray-500"
                  >
                    %
                  </text>
                </svg>
              </div>
              {/* Score interpretation */}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {(() => {
                    const score = report.marriagePotential?.overallScore || 
                                 report.partnershipPotential?.overallScore || 
                                 report.teamPerformance?.overallScore || 
                                 report.familyHarmony?.overallScore || 
                                 report.friendshipCompatibility?.overallScore || 
                                 report.friendshipPotential?.overallScore || 0
                    return score >= 85 ? t('excellentMatch') : score >= 70 ? t('goodMatch') : t('moderateMatch')
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Person Overviews */}
      <div className="grid md:grid-cols-2 gap-4">
        {report.personA && (
          <Card>
            <CardHeader>
              <CardTitle>{personAName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.personA.overview}</p>
            </CardContent>
          </Card>
        )}
        {report.personB && (
          <Card>
            <CardHeader>
              <CardTitle>{personBName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.personB.overview}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Relationship Dynamics */}
      {report.relationshipDynamics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('relationshipDynamics')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('emotionalCompatibility')}</h3>
              <p className="text-sm text-muted-foreground">
                {report.relationshipDynamics.emotionalCompatibility}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Communication Style</h3>
              <p className="text-sm text-muted-foreground">
                {report.relationshipDynamics.communicationStyle}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mutual Support</h3>
              <p className="text-sm text-muted-foreground">
                {report.relationshipDynamics.mutualSupport}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marriage Potential */}
      {report.marriagePotential && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Marriage Potential
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Stability</h3>
              <p className="text-sm text-muted-foreground">
                {report.marriagePotential.stability}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Commitment Level</h3>
              <p className="text-sm text-muted-foreground">
                {report.marriagePotential.commitmentLevel}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Timing for Marriage</h3>
              <p className="text-sm text-muted-foreground">
                {report.marriagePotential.timingForMarriage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Partnership Potential */}
      {report.partnershipPotential && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Partnership Potential
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Financial Synergy</h3>
              <p className="text-sm text-muted-foreground">
                {report.partnershipPotential.financialSynergy}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Conflict Management</h3>
              <p className="text-sm text-muted-foreground">
                {report.partnershipPotential.conflictManagement}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-Term Viability</h3>
              <p className="text-sm text-muted-foreground">
                {report.partnershipPotential.longTermViability}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Dynamics */}
      {report.teamDynamics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Work Style Compatibility</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamDynamics.workStyleCompatibility}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Communication Efficiency</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamDynamics.communicationEfficiency}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Responsibility Distribution</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamDynamics.responsibilityDistribution}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Conflict Response</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamDynamics.conflictResponse}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Performance */}
      {report.teamPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Execution Synergy</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamPerformance.executionSynergy}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stress Handling</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamPerformance.stressHandling}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-Term Team Stability</h3>
              <p className="text-sm text-muted-foreground">
                {report.teamPerformance.longTermTeamStability}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Harmony */}
      {report.familyHarmony && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Family Harmony
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Emotional Bonding</h3>
              <p className="text-sm text-muted-foreground">
                {report.familyHarmony.emotionalBonding}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Communication Pattern</h3>
              <p className="text-sm text-muted-foreground">
                {report.familyHarmony.communicationPattern}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Support System</h3>
              <p className="text-sm text-muted-foreground">
                {report.familyHarmony.supportSystem}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friendship Dynamics */}
      {report.friendshipDynamics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friendship Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Emotional Connection</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipDynamics.emotionalConnection}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Communication Style</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipDynamics.communicationStyle}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Trust and Loyalty</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipDynamics.trustAndLoyalty}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Conflict Sensitivity</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipDynamics.conflictSensitivity}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friendship Potential */}
      {report.friendshipPotential && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Friendship Potential
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Mutual Support</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipPotential.mutualSupport}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Compatibility</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipPotential.compatibility}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-Term Friendship</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipPotential.longTermFriendship}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friendship Compatibility (old structure) */}
      {report.friendshipCompatibility && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Friendship Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Trust Level</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipCompatibility.trustLevel}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shared Interests</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipCompatibility.sharedInterests}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Emotional Support</h3>
              <p className="text-sm text-muted-foreground">
                {report.friendshipCompatibility.emotionalSupport}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Structure (Business) */}
      {report.recommendedStructure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommended Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.recommendedStructure}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Optimization Advice (Work/Team) */}
      {report.optimizationAdvice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Optimization Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.optimizationAdvice}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Advice (Friend) */}
      {report.maintenanceAdvice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Maintenance Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.maintenanceAdvice}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Challenges/Risks */}
      <div className="grid md:grid-cols-2 gap-4">
        {report.strengths && report.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.strengths.map((strength, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {(report.challenges && report.challenges.length > 0) || (report.risks && report.risks.length > 0) ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                {report.challenges ? 'Challenges' : 'Risks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(report.challenges || report.risks || []).map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-amber-600">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Long Term Outlook */}
      {report.longTermOutlook && (
        <Card>
          <CardHeader>
            <CardTitle>Long Term Outlook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.longTermOutlook}</p>
          </CardContent>
        </Card>
      )}

      {/* Advice */}
      {report.advice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.advice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CompatibilityReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CompatibilityReportContent />
    </Suspense>
  )
}
