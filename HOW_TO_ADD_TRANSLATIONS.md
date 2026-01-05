# How to Add Translations to Your Pages

## ✅ Issues Fixed

### 1. PDF Export Error - FIXED ✅
**Error:** `Attempting to parse an unsupported color function "lab"`

**Solution:** Updated `src/lib/pdf-export.ts` to handle modern CSS color functions (lab, lch, oklab) by converting them to RGB before PDF generation.

### 2. Page Labels Not Translating - IN PROGRESS ⚙️
**Issue:** Navigation translates but page content labels stay in English

**Solution:** Need to add `useTranslations` hook to each page and wrap static labels

## 🔧 How to Add Translations to Any Page

### Step 1: Import the Hook
```tsx
import { useTranslations } from 'next-intl'
```

### Step 2: Use the Hook in Your Component
```tsx
export default function MyPage() {
  const t = useTranslations('report') // or 'nav', 'dashboard', etc.
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Button>{t('exportPdf')}</Button>
    </div>
  )
}
```

### Step 3: Replace Hardcoded Text
**Before:**
```tsx
<Button>Export PDF</Button>
<h1>Report Title</h1>
<p>Loading...</p>
```

**After:**
```tsx
<Button>{t('exportPdf')}</Button>
<h1>{t('title')}</h1>
<p>{t('loading')}</p>
```

## 📝 Translation Keys Available

### Navigation (`useTranslations('nav')`)
- `t('overview')` - Overview
- `t('people')` - People Management
- `t('destiny')` - Destiny Profile
- `t('compatibility')` - Compatibility Analysis
- `t('predictions')` - Predictions
- `t('monthlyPrediction')` - Monthly Prediction
- `t('yearlyPrediction')` - Yearly Prediction
- `t('zodiacAnalysis')` - Zodiac Analysis

### Report (`useTranslations('report')`)
- `t('title')` - Report Title
- `t('generatedOn')` - Generated on
- `t('share')` - Share
- `t('exportPdf')` - Export PDF
- `t('download')` - Download
- `t('tabs.overview')` - Overview tab
- `t('tabs.profile')` - Profile tab
- `t('tabs.risk')` - Risk & Warning tab
- `t('tabs.timing')` - Timing & Opportunities tab

### Common (`useTranslations('common')`)
- `t('loading')` - Loading...
- `t('error')` - Error
- `t('success')` - Success
- `t('confirm')` - Confirm
- `t('close')` - Close

## 🎯 Pages That Need Translation Updates

### Priority 1 - Report Pages
1. **Prediction Report** ✅ - Partially done
2. **Zodiac Analysis Report** - Needs update
3. **Monthly Prediction Report** - Needs update
4. **Yearly Prediction Report** - Needs update
5. **Compatibility Report** - Needs update

### Priority 2 - Dashboard Pages
1. **People Management** - Needs update
2. **Destiny Profile** - Needs update
3. **Settings** - Needs update

## 📋 Example: Full Page Translation

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function MyReportPage() {
  const t = useTranslations('report')
  const tCommon = useTranslations('common')
  
  return (
    <div>
      {/* Header */}
      <h1>{t('title')}</h1>
      <p>{t('generatedOn')}: {new Date().toLocaleDateString()}</p>
      
      {/* Actions */}
      <Button>{t('share')}</Button>
      <Button>{t('exportPdf')}</Button>
      
      {/* Content - Analysis data stays original */}
      <div>
        {/* This content is from analysis - don't translate */}
        <p>{analysisData.overview}</p>
        <p>{analysisData.description}</p>
      </div>
      
      {/* Footer */}
      <Button>{tCommon('close')}</Button>
    </div>
  )
}
```

## ⚠️ Important Rules

### DO Translate:
- ✅ Button labels
- ✅ Page titles
- ✅ Section headings
- ✅ Form labels
- ✅ Error messages
- ✅ Navigation items
- ✅ Tab names
- ✅ Tooltips

### DON'T Translate:
- ❌ Analysis results (report content)
- ❌ User-generated data
- ❌ Person names
- ❌ Dates (use locale formatting instead)
- ❌ Numbers
- ❌ API responses

## 🔍 How to Find Missing Translations

### Method 1: Check Console
Open browser DevTools and look for:
```
MISSING_MESSAGE: Could not resolve 'key' in messages
```

### Method 2: Test Each Language
1. Switch to each language
2. Navigate through all pages
3. Note which labels don't change
4. Add those keys to translation files

### Method 3: Search for Hardcoded Text
```bash
# Search for hardcoded English text in components
grep -r "Export PDF" src/
grep -r "Loading..." src/
grep -r "Back" src/
```

## 📦 Adding New Translation Keys

### Step 1: Add to English First
Edit `messages/en.json`:
```json
{
  "report": {
    "myNewKey": "My New Label"
  }
}
```

### Step 2: Add to All Other Languages
- `messages/zh.json` - Chinese
- `messages/ms.json` - Malay
- `messages/ja.json` - Japanese
- `messages/ko.json` - Korean

### Step 3: Use in Component
```tsx
const t = useTranslations('report')
<Button>{t('myNewKey')}</Button>
```

## 🧪 Testing Translations

### Test Checklist
1. **Switch Languages**
   - Change language selector
   - Verify labels change
   - Check all pages

2. **Check Console**
   - No MISSING_MESSAGE errors
   - No translation warnings

3. **Verify Content**
   - UI labels translate ✅
   - Analysis data stays original ✅

4. **Test PDF Export**
   - Export works without errors ✅
   - PDF contains correct content ✅

## 🚀 Quick Fix for Common Pages

### For Dashboard Pages
```tsx
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  
  return <h1>{t('title')}</h1>
}
```

### For Report Pages
```tsx
import { useTranslations } from 'next-intl'

export default function ReportPage() {
  const t = useTranslations('report')
  
  return (
    <>
      <Button>{t('exportPdf')}</Button>
      <Button>{t('share')}</Button>
    </>
  )
}
```

### For Settings Pages
```tsx
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('settings')
  
  return <h1>{t('title')}</h1>
}
```

## ✅ Summary

**PDF Export:** Fixed - handles modern CSS colors
**Translations:** Partially fixed - prediction report updated

**Next Steps:**
1. Test PDF export works
2. Add translations to remaining pages
3. Test all languages work correctly

**Pattern to Follow:**
```tsx
// 1. Import
import { useTranslations } from 'next-intl'

// 2. Use hook
const t = useTranslations('section')

// 3. Replace text
<Button>{t('key')}</Button>
```

This ensures all UI labels translate while keeping analysis data in original language!
