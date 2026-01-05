"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"

export type Language = "zh" | "en" | "ms" | "ja"

interface LanguageSelectorProps {
  value: Language
  onChange: (language: Language) => void
  className?: string
}

const languages = [
  { code: "zh" as Language, name: "中文", flag: "🇨🇳" },
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "ms" as Language, name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "ja" as Language, name: "日本語", flag: "🇯🇵" },
]

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={(val) => onChange(val as Language)}>
        <SelectTrigger className="w-[180px]">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("zh")
  
  return {
    language,
    setLanguage,
  }
}
