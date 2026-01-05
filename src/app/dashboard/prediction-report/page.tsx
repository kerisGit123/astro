'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Calendar, Sparkles, TrendingUp, AlertCircle, 
  Lightbulb, Heart, DollarSign, Briefcase, Activity, Users, Star
} from 'lucide-react'
import { toast } from 'sonner'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { ReportActions } from '@/components/report-actions'
import { useTranslations } from 'next-intl'

interface PredictionReport {
  id: string
  analysis_type: string
  target_month?: string
  target_year?: string
  life_focus?: string
  current_concern?: string
  person: {
    id: string
    name: string
    birth_date: string
    gender?: string
  }
  result_data: {
    status: string
    overview?: string
    
    // Western & Chinese Zodiac Analysis
    westernZodiac?: {
      sign?: string
      dateRange?: string
      coreTraits?: string[]
    }
    chineseZodiac?: {
      animal?: string
      element?: string
      coreTraits?: string[]
    }
    personalityScores?: {
      execution?: number
      leadership?: number
      sensitivity?: number
      sociability?: number
      discipline?: number
      adaptability?: number
    }
    combinedProfile?: {
      title?: string
      description?: string
      strengths?: string[]
      challenges?: string[]
      socialStyle?: string
      careerTendencies?: string
      relationshipStyle?: string
    }
    
    // Yearly prediction structure from n8n
    yearlyLuck?: {
      overallScore?: number
      growthPotential?: string
      riskIndex?: string
    }
    yearFocus?: {
      careerAndDirection?: string
      financeAndAssets?: string
      relationships?: string
      healthAndBalance?: string
    }
    majorPhases?: string[]
    risks?: string[]
    strategicRecommendations?: string[]
    yearlyAdvice?: string
    
    // Monthly prediction structure from n8n
    monthlyLuck?: {
      overallScore?: number
      energyLevel?: string
      stabilityIndex?: string
      volatilityIndex?: string
    }
    focusAreas?: {
      careerAndWork?: string
      finance?: string
      relationships?: string
      healthAndWellbeing?: string
    }
    monthFocus?: {
      careerAndActions?: string
      financeAndResources?: string
      healthAndBalance?: string
      personalGrowth?: string
    }
    keyTrends?: string[]
    opportunities?: string[]
    favorableActions?: string[]
    avoidances?: string[]
    monthlyAdvice?: string
    
    // Monthly prediction structure (old format - keep for compatibility)
    luckyElements?: {
      colors?: string[]
      numbers?: number[]
      directions?: string[]
    }
    challenges?: string[]
    advice?: string
    career?: {
      forecast?: string
      score?: number
      advice?: string
    }
    finance?: {
      forecast?: string
      score?: number
      advice?: string
    }
    health?: {
      forecast?: string
      score?: number
      advice?: string
    }
    relationships?: {
      forecast?: string
      score?: number
      advice?: string
    }
    family?: {
      forecast?: string
      score?: number
      advice?: string
    }
    monthlyHighlights?: string
    importantDates?: Array<{
      date: string
      event: string
      type: string
    }>
    weeklyBreakdown?: {
      week1?: string
      week2?: string
      week3?: string
      week4?: string
    }
    yearlyTheme?: string
    quarterlyForecast?: {
      Q1?: string
      Q2?: string
      Q3?: string
      Q4?: string
    }
    majorEvents?: Array<{
      period: string
      event: string
      impact: string
    }>
    annualGoals?: string
  }
  created_at: string
}

function PredictionReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const t = useTranslations('report')

  const [report, setReport] = useState<PredictionReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/predictions/${id}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      } else {
        toast.error('Failed to load prediction report')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Failed to load prediction report')
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading prediction report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('generatedOn')}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('tabs.overview')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { result_data: data } = report

  return (
    <div className="container mx-auto p-6 space-y-6" id="report-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('tabs.overview') || 'Back'}
        </Button>
        <ReportActions
          predictionId={report.id}
          reportElementId="report-content"
          reportTitle={`${report.analysis_type}_${report.person.name}_${new Date(report.created_at).toISOString().split('T')[0]}`}
          translations={{
            share: t('share'),
            exportPdf: t('exportPdf'),
            shareReport: t('shareReport'),
            shareDescription: t('shareDescription'),
            expiryDays: t('expiryDays'),
            days: t('days'),
            generateLink: t('generateLink'),
            shareLink: t('shareLink'),
            copyLink: t('copyLink'),
            linkCopied: t('linkCopied')
          }}
        />
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" />
          {report.analysis_type === 'monthly' ? t('title') : 
           report.analysis_type === 'yearly' ? t('title') : 
           t('title')}
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-lg">{report.person.name}</span>
          {(report.target_month || report.target_year) && (
            <>
              <span>•</span>
              <span>
                {report.target_month && formatMonth(report.target_month)}
                {report.target_year && `Year ${report.target_year}`}
              </span>
            </>
          )}
        </div>
        {report.life_focus && (
          <Badge variant="secondary" className="capitalize">
            Focus: {report.life_focus}
          </Badge>
        )}
      </div>

      {/* Zodiac Analysis Display */}
      {report.analysis_type === 'wczodiac' && (
        <div className="space-y-6">
          {/* Western & Chinese Zodiac Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Western Zodiac */}
            {data.westernZodiac && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Western Zodiac: {data.westernZodiac.sign}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.westernZodiac.dateRange && (
                    <p className="text-sm text-muted-foreground">{data.westernZodiac.dateRange}</p>
                  )}
                  {data.westernZodiac.coreTraits && data.westernZodiac.coreTraits.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Core Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.westernZodiac.coreTraits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chinese Zodiac */}
            {data.chineseZodiac && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Chinese Zodiac: {data.chineseZodiac.animal}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.chineseZodiac.element && (
                    <p className="text-sm text-muted-foreground">Element: {data.chineseZodiac.element}</p>
                  )}
                  {data.chineseZodiac.coreTraits && data.chineseZodiac.coreTraits.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Core Characteristics</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.chineseZodiac.coreTraits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary">{trait}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Personality Scores Spider Chart */}
          {data.personalityScores && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Personality Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { subject: 'Execution', score: data.personalityScores.execution || 0, fullMark: 5 },
                    { subject: 'Leadership', score: data.personalityScores.leadership || 0, fullMark: 5 },
                    { subject: 'Sensitivity', score: data.personalityScores.sensitivity || 0, fullMark: 5 },
                    { subject: 'Sociability', score: data.personalityScores.sociability || 0, fullMark: 5 },
                    { subject: 'Discipline', score: data.personalityScores.discipline || 0, fullMark: 5 },
                    { subject: 'Adaptability', score: data.personalityScores.adaptability || 0, fullMark: 5 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar name="Personality" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Combined Profile */}
          {data.combinedProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {data.combinedProfile.title || 'Combined Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {data.combinedProfile.description && (
                  <p className="text-muted-foreground">{data.combinedProfile.description}</p>
                )}

                {data.combinedProfile.strengths && data.combinedProfile.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {data.combinedProfile.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.combinedProfile.challenges && data.combinedProfile.challenges.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Challenges
                    </h4>
                    <ul className="space-y-2">
                      {data.combinedProfile.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  {data.combinedProfile.socialStyle && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Social Style
                      </h4>
                      <p className="text-sm text-muted-foreground">{data.combinedProfile.socialStyle}</p>
                    </div>
                  )}
                  {data.combinedProfile.careerTendencies && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Career Tendencies
                      </h4>
                      <p className="text-sm text-muted-foreground">{data.combinedProfile.careerTendencies}</p>
                    </div>
                  )}
                  {data.combinedProfile.relationshipStyle && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Relationship Style
                      </h4>
                      <p className="text-sm text-muted-foreground">{data.combinedProfile.relationshipStyle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Yearly Luck Gauge (for yearly predictions) */}
      {report.analysis_type === 'yearly' && data.yearlyLuck?.overallScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Fortune Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {/* Gauge Chart */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={data.yearlyLuck.overallScore >= 70 ? '#22c55e' : data.yearlyLuck.overallScore >= 50 ? '#eab308' : '#ef4444'}
                    strokeWidth="20"
                    strokeDasharray={`${(data.yearlyLuck.overallScore / 100) * 502.65} 502.65`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{data.yearlyLuck.overallScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              
              {/* Score interpretation */}
              <div className="text-center">
                <Badge variant={data.yearlyLuck.overallScore >= 70 ? 'default' : data.yearlyLuck.overallScore >= 50 ? 'secondary' : 'destructive'}>
                  {data.yearlyLuck.overallScore >= 70 ? 'Excellent Fortune' : data.yearlyLuck.overallScore >= 50 ? 'Good Fortune' : 'Challenging Year'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview */}
      {data.overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{data.overview}</p>
          </CardContent>
        </Card>
      )}

      {/* Yearly Luck Details */}
      {data.yearlyLuck && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.yearlyLuck.growthPotential && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Growth Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearlyLuck.growthPotential}</p>
              </CardContent>
            </Card>
          )}
          
          {data.yearlyLuck.riskIndex && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Risk Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearlyLuck.riskIndex}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Year Focus Areas */}
      {data.yearFocus && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.yearFocus.careerAndDirection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career & Direction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearFocus.careerAndDirection}</p>
              </CardContent>
            </Card>
          )}
          
          {data.yearFocus.financeAndAssets && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Finance & Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearFocus.financeAndAssets}</p>
              </CardContent>
            </Card>
          )}
          
          {data.yearFocus.relationships && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearFocus.relationships}</p>
              </CardContent>
            </Card>
          )}
          
          {data.yearFocus.healthAndBalance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health & Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.yearFocus.healthAndBalance}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Major Phases */}
      {data.majorPhases && data.majorPhases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Major Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.majorPhases.map((phase, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm text-muted-foreground">{phase}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strategic Recommendations Only */}
      {data.strategicRecommendations && data.strategicRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Lightbulb className="h-5 w-5" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.strategicRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-sm text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Yearly Advice */}
      {data.yearlyAdvice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Yearly Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{data.yearlyAdvice}</p>
          </CardContent>
        </Card>
      )}

      {/* Overview Section */}
      {data.overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{data.overview}</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Luck Gauge - Above Opportunities/Risks */}
      {report.analysis_type === 'monthly' && data.monthlyLuck?.overallScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Fortune Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle
                    cx="100" cy="100" r="80" fill="none"
                    stroke={data.monthlyLuck.overallScore >= 70 ? '#22c55e' : data.monthlyLuck.overallScore >= 50 ? '#eab308' : '#ef4444'}
                    strokeWidth="20"
                    strokeDasharray={`${(data.monthlyLuck.overallScore / 100) * 502.65} 502.65`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{data.monthlyLuck.overallScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant={data.monthlyLuck.overallScore >= 70 ? 'default' : data.monthlyLuck.overallScore >= 50 ? 'secondary' : 'destructive'}>
                  {data.monthlyLuck.overallScore >= 70 ? 'Excellent Energy' : data.monthlyLuck.overallScore >= 50 ? 'Good Energy' : 'Challenging Month'}
                </Badge>
                {data.monthlyLuck.energyLevel && <p className="text-sm text-muted-foreground">Energy: {data.monthlyLuck.energyLevel}</p>}
                {data.monthlyLuck.stabilityIndex && <p className="text-sm text-muted-foreground">Stability: {data.monthlyLuck.stabilityIndex}</p>}
                {data.monthlyLuck.volatilityIndex && <p className="text-sm text-muted-foreground">Volatility: {data.monthlyLuck.volatilityIndex}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities and Risks - Side by Side */}
      {report.analysis_type === 'monthly' && (data.opportunities || data.risks) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.opportunities && data.opportunities.length > 0 ? (
                <ul className="space-y-2">
                  {data.opportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">+</span>
                      <span className="text-sm text-muted-foreground">{opp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No opportunities identified for this period.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Risks to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.risks && data.risks.length > 0 ? (
                <ul className="space-y-2">
                  {data.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No significant risks identified for this period.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Focus Areas - New Structure */}
      {data.monthFocus && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.monthFocus.careerAndActions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career & Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.monthFocus.careerAndActions}</p>
              </CardContent>
            </Card>
          )}
          
          {data.monthFocus.financeAndResources && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Finance & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.monthFocus.financeAndResources}</p>
              </CardContent>
            </Card>
          )}
          
          {data.monthFocus.healthAndBalance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health & Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.monthFocus.healthAndBalance}</p>
              </CardContent>
            </Card>
          )}
          
          {data.monthFocus.personalGrowth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Personal Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.monthFocus.personalGrowth}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Monthly Focus Areas - Old Structure (keep for backward compatibility) */}
      {!data.monthFocus && data.focusAreas && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.focusAreas.careerAndWork && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career & Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.focusAreas.careerAndWork}</p>
              </CardContent>
            </Card>
          )}
          
          {data.focusAreas.finance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Finance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.focusAreas.finance}</p>
              </CardContent>
            </Card>
          )}
          
          {data.focusAreas.relationships && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.focusAreas.relationships}</p>
              </CardContent>
            </Card>
          )}
          
          {data.focusAreas.healthAndWellbeing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health & Wellbeing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.focusAreas.healthAndWellbeing}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Key Trends */}
      {data.keyTrends && data.keyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.keyTrends.map((trend, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">→</span>
                  <span className="text-sm text-muted-foreground">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}


      {/* Favorable Actions and Avoidances (if present) */}
      {(data.favorableActions || data.avoidances) && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.favorableActions && data.favorableActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Lightbulb className="h-5 w-5" />
                  Favorable Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.favorableActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {data.avoidances && data.avoidances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Things to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.avoidances.map((avoid, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✗</span>
                      <span className="text-sm text-muted-foreground">{avoid}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Monthly Advice */}
      {data.monthlyAdvice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Monthly Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{data.monthlyAdvice}</p>
          </CardContent>
        </Card>
      )}

      {/* Lucky Elements */}
      {data.luckyElements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Lucky Elements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.luckyElements.colors && data.luckyElements.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Lucky Colors</h3>
                <div className="flex gap-2 flex-wrap">
                  {data.luckyElements.colors.map((color, idx) => (
                    <Badge key={idx} variant="outline">{color}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.luckyElements.numbers && data.luckyElements.numbers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Lucky Numbers</h3>
                <div className="flex gap-2 flex-wrap">
                  {data.luckyElements.numbers.map((num, idx) => (
                    <Badge key={idx} variant="outline">{num}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.luckyElements.directions && data.luckyElements.directions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Lucky Directions</h3>
                <div className="flex gap-2 flex-wrap">
                  {data.luckyElements.directions.map((dir, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">{dir}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Focus Area Predictions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Career */}
        {data.career && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career
                {data.career.score && (
                  <Badge variant="secondary">{data.career.score}%</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.career.forecast && (
                <p className="text-sm text-muted-foreground">{data.career.forecast}</p>
              )}
              {data.career.advice && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-1">Advice:</p>
                  <p className="text-sm text-muted-foreground">{data.career.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Finance */}
        {data.finance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Finance
                {data.finance.score && (
                  <Badge variant="secondary">{data.finance.score}%</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.finance.forecast && (
                <p className="text-sm text-muted-foreground">{data.finance.forecast}</p>
              )}
              {data.finance.advice && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-1">Advice:</p>
                  <p className="text-sm text-muted-foreground">{data.finance.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Health */}
        {data.health && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health
                {data.health.score && (
                  <Badge variant="secondary">{data.health.score}%</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.health.forecast && (
                <p className="text-sm text-muted-foreground">{data.health.forecast}</p>
              )}
              {data.health.advice && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-1">Advice:</p>
                  <p className="text-sm text-muted-foreground">{data.health.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Relationships */}
        {data.relationships && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Relationships
                {data.relationships.score && (
                  <Badge variant="secondary">{data.relationships.score}%</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.relationships.forecast && (
                <p className="text-sm text-muted-foreground">{data.relationships.forecast}</p>
              )}
              {data.relationships.advice && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-1">Advice:</p>
                  <p className="text-sm text-muted-foreground">{data.relationships.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Family */}
        {data.family && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family
                {data.family.score && (
                  <Badge variant="secondary">{data.family.score}%</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.family.forecast && (
                <p className="text-sm text-muted-foreground">{data.family.forecast}</p>
              )}
              {data.family.advice && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-1">Advice:</p>
                  <p className="text-sm text-muted-foreground">{data.family.advice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Specific */}
      {report.analysis_type === 'monthly' && (
        <>
          {data.monthlyHighlights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.monthlyHighlights}</p>
              </CardContent>
            </Card>
          )}

          {data.importantDates && data.importantDates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.importantDates.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.date}</p>
                        <p className="text-sm text-muted-foreground">{item.event}</p>
                      </div>
                      <Badge variant={item.type === 'positive' ? 'default' : 'secondary'}>
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.weeklyBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.weeklyBreakdown.week1 && (
                  <div>
                    <h3 className="font-semibold mb-1">Week 1</h3>
                    <p className="text-sm text-muted-foreground">{data.weeklyBreakdown.week1}</p>
                  </div>
                )}
                {data.weeklyBreakdown.week2 && (
                  <div>
                    <h3 className="font-semibold mb-1">Week 2</h3>
                    <p className="text-sm text-muted-foreground">{data.weeklyBreakdown.week2}</p>
                  </div>
                )}
                {data.weeklyBreakdown.week3 && (
                  <div>
                    <h3 className="font-semibold mb-1">Week 3</h3>
                    <p className="text-sm text-muted-foreground">{data.weeklyBreakdown.week3}</p>
                  </div>
                )}
                {data.weeklyBreakdown.week4 && (
                  <div>
                    <h3 className="font-semibold mb-1">Week 4</h3>
                    <p className="text-sm text-muted-foreground">{data.weeklyBreakdown.week4}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Yearly Specific */}
      {report.analysis_type === 'yearly' && (
        <>
          {data.yearlyTheme && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Yearly Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.yearlyTheme}</p>
              </CardContent>
            </Card>
          )}

          {data.quarterlyForecast && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quarterly Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.quarterlyForecast.Q1 && (
                  <div>
                    <h3 className="font-semibold mb-1">Q1 (Jan-Mar)</h3>
                    <p className="text-sm text-muted-foreground">{data.quarterlyForecast.Q1}</p>
                  </div>
                )}
                {data.quarterlyForecast.Q2 && (
                  <div>
                    <h3 className="font-semibold mb-1">Q2 (Apr-Jun)</h3>
                    <p className="text-sm text-muted-foreground">{data.quarterlyForecast.Q2}</p>
                  </div>
                )}
                {data.quarterlyForecast.Q3 && (
                  <div>
                    <h3 className="font-semibold mb-1">Q3 (Jul-Sep)</h3>
                    <p className="text-sm text-muted-foreground">{data.quarterlyForecast.Q3}</p>
                  </div>
                )}
                {data.quarterlyForecast.Q4 && (
                  <div>
                    <h3 className="font-semibold mb-1">Q4 (Oct-Dec)</h3>
                    <p className="text-sm text-muted-foreground">{data.quarterlyForecast.Q4}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {data.majorEvents && data.majorEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Major Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.majorEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <TrendingUp className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-semibold">{event.period}</p>
                        <p className="text-sm text-muted-foreground">{event.event}</p>
                      </div>
                      <Badge variant={event.impact === 'high' ? 'default' : 'secondary'}>
                        {event.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.annualGoals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Annual Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.annualGoals}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}


      {/* General Advice */}
      {data.advice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              General Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.advice}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function PredictionReportPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PredictionReportContent />
    </Suspense>
  )
}
