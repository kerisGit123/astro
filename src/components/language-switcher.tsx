"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false)
  
  // Get locale from cookie - only runs on client
  const getLocale = (): Locale => {
    if (typeof window === 'undefined') return 'en'
    const cookies = document.cookie.split(';')
    const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='))
    return localeCookie ? localeCookie.split('=')[1] as Locale : 'en'
  }
  
  const [locale, setLocale] = useState<Locale>(getLocale)

  useEffect(() => {
    // Mark as mounted after initial render
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale)
    
    // Set cookie for locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    
    // Reload page to apply new locale
    window.location.reload()
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="w-[160px] h-10 bg-sidebar border border-sidebar-border rounded-md" />
    )
  }

  return (
    <Select value={locale} onValueChange={(val) => handleLocaleChange(val as Locale)}>
      <SelectTrigger className="w-[160px] bg-sidebar border-sidebar-border z-50">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {localeFlags[locale]} {localeNames[locale]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[100]">
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <span className="flex items-center gap-2">
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
