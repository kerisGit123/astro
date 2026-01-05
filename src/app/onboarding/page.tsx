"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, ArrowRight, Calendar, Briefcase, Heart, Activity, GraduationCap, Compass, Globe } from "lucide-react"
import { locales, localeNames, type Locale } from "@/lib/i18n"

type Topic = 'career' | 'marriage' | 'health' | 'education' | 'general'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')
  const [translations, setTranslations] = useState<any>({})
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState({
    name: user?.firstName || user?.fullName || "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    gender: "",
    additionalInfo: "",
    familyZodiac: "",
    currentBusiness: "",
  })

  useEffect(() => {
    const loadTranslations = async () => {
      const messages = await import(`@/../messages/${locale}.json`)
      setTranslations(messages.default)
    }
    loadTranslations()
  }, [locale])

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let value = translations
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const topicPrompt = selectedTopic ? t(`onboarding.topicPrompts.${selectedTopic}`) : ''
      
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isUserSelf: true,
          selectedTopic,
          topicPrompt,
          analysisLanguage: locale,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create profile")
      }

      const person = await response.json()

      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
        await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId: person.id,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            birthLocation: formData.birthLocation,
            selectedTopic,
            topicPrompt,
            analysisLanguage: locale,
          }),
        }).catch(err => console.error("n8n trigger failed:", err))
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding error:", error)
      alert("Failed to complete onboarding. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const topicIcons = {
    career: Briefcase,
    marriage: Heart,
    health: Activity,
    education: GraduationCap,
    general: Compass,
  }

  if (step === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-end mb-2">
              <Select value={locale} onValueChange={(value) => handleLocaleChange(value as Locale)}>
                <SelectTrigger className="w-[180px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {localeNames[loc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('onboarding.welcome')}</CardTitle>
            <CardDescription className="text-base">
              {t('onboarding.welcomeDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <h3 className="font-semibold">{t('onboarding.benefits')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('onboarding.benefit1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('onboarding.benefit2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('onboarding.benefit3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{t('onboarding.benefit4')}</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')} 
                className="flex-1"
                size="lg"
              >
                Skip for Now
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                className="flex-1"
                size="lg"
              >
                {t('onboarding.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-end mb-2">
              <Select value={locale} onValueChange={(value) => handleLocaleChange(value as Locale)}>
                <SelectTrigger className="w-[180px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {localeNames[loc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CardTitle className="text-2xl">{t('onboarding.selectTopic')}</CardTitle>
            <CardDescription>
              {t('onboarding.topicDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {(['career', 'marriage', 'health', 'education', 'general'] as Topic[]).map((topic) => {
                const Icon = topicIcons[topic]
                const isSelected = selectedTopic === topic
                return (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {t(`onboarding.topics.${topic}`)}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedTopic && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm text-muted-foreground">
                  {t(`onboarding.topicPrompts.${selectedTopic}`)}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                {t('onboarding.back')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Skip onboarding? You can complete it later from Settings.')) {
                    router.push('/dashboard')
                  }
                }}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedTopic}
                className="flex-1"
              >
                {t('onboarding.continue')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-end mb-2">
            <Select value={locale} onValueChange={(value) => handleLocaleChange(value as Locale)}>
              <SelectTrigger className="w-[180px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {localeNames[loc]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('onboarding.birthInfo')}</CardTitle>
          <CardDescription>
            {t('onboarding.birthInfoDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('onboarding.fullName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t('onboarding.fullNamePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">{t('onboarding.birthDate')} *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthTime">{t('onboarding.birthTime')}</Label>
            <Input
              id="birthTime"
              type="time"
              value={formData.birthTime}
              onChange={(e) => handleInputChange("birthTime", e.target.value)}
              placeholder={t('onboarding.birthTimePlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('onboarding.birthTimeNote')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthLocation">{t('onboarding.birthLocation')}</Label>
            <Input
              id="birthLocation"
              value={formData.birthLocation}
              onChange={(e) => handleInputChange("birthLocation", e.target.value)}
              placeholder={t('onboarding.birthLocationPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t('onboarding.gender')}</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder={t('onboarding.selectGender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('onboarding.genderMale')}</SelectItem>
                <SelectItem value="female">{t('onboarding.genderFemale')}</SelectItem>
                <SelectItem value="other">{t('onboarding.genderOther')}</SelectItem>
                <SelectItem value="prefer_not_to_say">{t('onboarding.genderPreferNot')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">{t('onboarding.lifeEvents')}</Label>
            <Input
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
              placeholder={t('onboarding.lifeEventsPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('onboarding.lifeEventsNote')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyZodiac">{t('onboarding.familyZodiac')}</Label>
            <Input
              id="familyZodiac"
              value={formData.familyZodiac}
              onChange={(e) => handleInputChange("familyZodiac", e.target.value)}
              placeholder={t('onboarding.familyZodiacPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('onboarding.familyZodiacNote')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentBusiness">{t('onboarding.currentBusiness')}</Label>
            <Input
              id="currentBusiness"
              value={formData.currentBusiness}
              onChange={(e) => handleInputChange("currentBusiness", e.target.value)}
              placeholder={t('onboarding.currentBusinessPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('onboarding.currentBusinessNote')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1"
            >
              {t('onboarding.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.birthDate}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('onboarding.creatingProfile')}
                </>
              ) : (
                <>
                  {t('onboarding.completeSetup')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
