export const locales = ['en', 'zh', 'ms', 'ja', 'ko'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ms: 'Bahasa Melayu',
  ja: '日本語',
  ko: '한국어'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  zh: '🇨🇳',
  ms: '🇲🇾',
  ja: '🇯🇵',
  ko: '🇰🇷'
};
