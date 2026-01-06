"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, User, Star, TrendingUp, AlertCircle, Heart, Briefcase, Users as UsersIcon, Activity } from "lucide-react"
import Link from "next/link"
import { ZodiacProgress } from "@/components/zodiac-progress"
import { Badge } from "@/components/ui/badge"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { useTranslations } from 'next-intl'

interface ZodiacResult {
  westernZodiac: {
    sign: string
    dateRange: string
    coreTraits: string[]
  }
  chineseZodiac: {
    animal: string
    element: string
    coreTraits: string[]
  }
  personalityScores: {
    execution: number
    leadership: number
    sensitivity: number
    sociability: number
    discipline: number
    adaptability: number
  }
  combinedProfile: {
    title: string
    description: string
    strengths: string[]
    challenges: string[]
    socialStyle: string
    careerTendencies: string
    relationshipStyle: string
  }
  birthYear: number
}

export function QuickAnalyzer() {
  const t = useTranslations('quickAnalyzer')
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ZodiacResult | null>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!birthDate) {
      setError(t('errorRequired'))
      return
    }

    setAnalyzing(true)
    setError("")
    setResult(null)

    const timeoutId = setTimeout(() => {
      if (analyzing) {
        setAnalyzing(false)
        setError(t('errorTimeout'))
      }
    }, 8000) // 8 second timeout

    try {
      const response = await fetch("/api/predictions/zodiac-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "wczodiacfront",
          birthdate: birthDate,
          name: "Guest",
          gender: gender
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || t('errorFailed'))
        clearTimeout(timeoutId)
        setAnalyzing(false)
        return
      }

      const data = await response.json()

      // Verify we have valid results
      if (data.westernZodiac && data.chineseZodiac && data.personalityScores && data.combinedProfile) {
        setResult(data)
        clearTimeout(timeoutId)
        setAnalyzing(false)
      } else {
        setError(t('errorInvalid'))
        clearTimeout(timeoutId)
        setAnalyzing(false)
      }
    } catch (err) {
      setError(t('errorGeneral'))
      console.error(err)
      clearTimeout(timeoutId)
      setAnalyzing(false)
    }
  }

  return (
    <>
      <ZodiacProgress isLoading={analyzing} message={`${t('analyzing')} ✨`} />
      {!analyzing && (
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('title')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t('cardTitle')}
                </CardTitle>
                <CardDescription>
                  {t('cardDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t('birthDate')}</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('gender')}</Label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={gender === "male" ? "default" : "outline"}
                        onClick={() => setGender("male")}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">♂</span>
                        {t('male')}
                      </Button>
                      <Button
                        type="button"
                        variant={gender === "female" ? "default" : "outline"}
                        onClick={() => setGender("female")}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">♀</span>
                        {t('female')}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!birthDate}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('analyze')}
                  </Button>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

            {result && (
              <div className="space-y-6 pt-6 border-t">
                {/* Combined Profile Title */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">{result.combinedProfile.title}</h3>
                  <p className="text-muted-foreground">{result.combinedProfile.description}</p>
                </div>

                {/* Zodiac Signs Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Western Zodiac */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Western Zodiac: {result.westernZodiac.sign}
                    </h4>
                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">{result.westernZodiac.dateRange}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">{t('coreTraits')}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.westernZodiac.coreTraits.map((trait, idx) => (
                            <Badge key={idx} variant="secondary">{trait}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chinese Zodiac */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Chinese Zodiac: {result.chineseZodiac.animal}
                    </h4>
                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Element: {result.chineseZodiac.element}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">{t('coreCharacteristics')}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.chineseZodiac.coreTraits.map((trait, idx) => (
                            <Badge key={idx} variant="secondary">{trait}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personality Spider Chart */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {t('personalityProfile')}
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        { subject: 'Execution', score: result.personalityScores.execution, fullMark: 5 },
                        { subject: 'Leadership', score: result.personalityScores.leadership, fullMark: 5 },
                        { subject: 'Sensitivity', score: result.personalityScores.sensitivity, fullMark: 5 },
                        { subject: 'Sociability', score: result.personalityScores.sociability, fullMark: 5 },
                        { subject: 'Discipline', score: result.personalityScores.discipline, fullMark: 5 },
                        { subject: 'Adaptability', score: result.personalityScores.adaptability, fullMark: 5 },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} />
                        <Radar name="Personality" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Strengths and Challenges */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {t('strengths')}
                    </h4>
                    <ul className="space-y-2 bg-muted/50 p-4 rounded-lg">
                      {result.combinedProfile.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      {t('challenges')}
                    </h4>
                    <ul className="space-y-2 bg-muted/50 p-4 rounded-lg">
                      {result.combinedProfile.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Life Aspects */}
                <div className="grid md:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {t('socialStyle')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.combinedProfile.socialStyle}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {t('careerTendencies')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.combinedProfile.careerTendencies}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      {t('relationshipStyle')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.combinedProfile.relationshipStyle}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('signupCta')}
                </p>
                <Button asChild size="lg">
                  <Link href="/signup">
                    {t('signupButton')}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
      )}
    </>
  )
}
