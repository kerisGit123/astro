"use client"

import { useState, useEffect } from "react"
import { Briefcase, Heart, Activity, GraduationCap, Compass, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { locales, localeNames, type Locale } from "@/lib/i18n"

export type Topic = 'career' | 'marriage' | 'health' | 'education' | 'general'

interface TopicSelectorProps {
  selectedTopic: Topic | null
  onTopicChange: (topic: Topic) => void
  customPrompt?: string
  onCustomPromptChange?: (prompt: string) => void
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
  showLanguageSelector?: boolean
}

const topicIcons = {
  career: Briefcase,
  marriage: Heart,
  health: Activity,
  education: GraduationCap,
  general: Compass,
}

export function TopicSelector({
  selectedTopic,
  onTopicChange,
  customPrompt = '',
  onCustomPromptChange,
  locale = 'en',
  onLocaleChange,
  showLanguageSelector = true,
}: TopicSelectorProps) {
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    const loadTranslations = async () => {
      const messages = await import(`@/../messages/${locale}.json`)
      setTranslations(messages.default)
    }
    loadTranslations()
  }, [locale])

  const t = (key: string) => {
    const keys = key.split('.')
    let value = translations
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <div className="space-y-4">
      {showLanguageSelector && onLocaleChange && (
        <div className="flex justify-end">
          <Select value={locale} onValueChange={(value) => onLocaleChange(value as Locale)}>
            <SelectTrigger className="w-[180px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {locales.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {localeNames[loc]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">{t('onboarding.selectTopic')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('onboarding.topicDesc')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {(['career', 'marriage', 'health', 'education', 'general'] as Topic[]).map((topic) => {
          const Icon = topicIcons[topic]
          const isSelected = selectedTopic === topic
          return (
            <button
              key={topic}
              onClick={() => onTopicChange(topic)}
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

      {onCustomPromptChange && (
        <div className="space-y-2">
          <Label htmlFor="customPrompt">
            {t('onboarding.customPrompt') || 'Or type your own question (Optional)'}
          </Label>
          <Textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder={t('onboarding.customPromptPlaceholder') || 'e.g., I want to know about my career in the next 5 years...'}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t('onboarding.customPromptNote') || 'You can type your specific question here instead of selecting a topic'}
          </p>
        </div>
      )}
    </div>
  )
}
