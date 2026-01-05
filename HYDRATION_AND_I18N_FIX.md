# 🔧 Hydration Mismatch & i18n Issues - Fixed

## Issues Identified

### 1. ✅ Hydration Mismatch in Language Switcher
**Error:** Server rendered 🇬🇧 but client showed 🇯🇵

**Root Cause:** 
- Reading cookie during SSR vs client render caused mismatch
- Nested spans in SelectValue caused React hydration issues

**Fix:**
- Added `mounted` state to prevent rendering until client-side
- Simplified SelectValue content (removed nested spans)
- Shows placeholder skeleton during SSR

### 2. ⚠️ Duplicate "Self" Profiles
**Issue:** Two self profiles showing in People Management

**Need to Fix:**
- Delete one duplicate from database
- The single-self enforcement was added but duplicates existed before

**Command to check:**
```sql
SELECT id, name, is_user_self FROM people WHERE is_user_self = true;
```

**To delete duplicate (run after identifying which to keep):**
```sql
DELETE FROM people WHERE id = 'duplicate-id-here';
```

### 3. ❌ Page Content Not Translating
**Issue:** Language selector changes but page content stays in English

**Root Cause:** 
- No actual i18n implementation beyond the selector
- Translation files exist but not being used
- No middleware to handle locale routing
- Pages not using translation hooks

**This requires full next-intl setup:**
1. Configure middleware
2. Update all page components to use translations
3. Set up locale routing

---

## Quick Fixes Applied

### Language Switcher (Hydration Fix)
**File:** `src/components/language-switcher.tsx`

**Changes:**
1. Added `mounted` state
2. Show skeleton placeholder during SSR
3. Simplified SelectValue to prevent nesting issues
4. Read cookie in useState initializer

**Result:** No more hydration mismatch errors

---

## To Delete Duplicate Self Profile

### Step 1: Identify Profiles
```bash
psql $env:DATABASE_URL -c "SELECT id, name, created_at FROM people WHERE is_user_self = true ORDER BY created_at;"
```

### Step 2: Delete the Duplicate (keep the older one)
```bash
# Replace 'newer-id-here' with the ID of the profile to delete
psql $env:DATABASE_URL -c "DELETE FROM people WHERE id = 'newer-id-here';"
```

---

## Why Page Content Doesn't Translate

The language selector only:
- ✅ Changes the cookie
- ✅ Reloads the page
- ❌ **Does NOT** actually translate content

**What's missing:**
1. **No middleware** - next-intl needs middleware to detect locale
2. **No translation usage** - Pages use hardcoded English text
3. **No locale routing** - URLs should be like `/zh/dashboard`

### To Implement Full i18n (Complex - Not Done Yet)

This requires:

1. **Create middleware:**
```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'zh', 'ms', 'ja'],
  defaultLocale: 'en'
});
 
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

2. **Update every page to use translations:**
```typescript
import {useTranslations} from 'next-intl';

export default function Page() {
  const t = useTranslations('Index');
  return <h1>{t('title')}</h1>;
}
```

3. **Update all components** - Every hardcoded string needs `t('key')`

**This is a MAJOR refactor** affecting 20+ files.

---

## Current State

### ✅ Working:
- Language selector displays correctly
- No hydration errors
- Cookie saves language preference
- Page reloads when language changes

### ⚠️ Partially Working:
- Duplicate self profiles exist (need manual deletion)

### ❌ Not Working:
- Page content translation (requires full next-intl setup)
- Translation files exist but unused

---

## Recommendation

**For now:**
1. Delete duplicate self profile manually
2. Language selector works but doesn't translate content
3. Full i18n requires major refactor of all pages

**To implement full translation:**
- Would need to update 20+ page files
- Add translation keys to all JSON files
- Configure middleware properly
- This is 2-3 hours of work minimum

---

## Summary

**Fixed:** Hydration mismatch - language selector now works without errors

**Needs Manual Fix:** Delete duplicate self profile from database

**Not Implemented:** Actual page content translation (major work required)

The language selector is now functional and error-free, but it only changes the language preference - it doesn't actually translate the page content because that requires a complete i18n implementation across all pages.
