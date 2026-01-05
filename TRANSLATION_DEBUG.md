# Translation Debug Guide

## ✅ Translation Setup is Correct

Your i18n setup is properly configured:
- `NextIntlClientProvider` wraps the dashboard layout ✅
- Translation keys exist in all language files ✅
- `useTranslations('report')` hook is used correctly ✅

## 🔍 Potential Issues & Solutions

### Issue 1: Translations Not Showing

**Symptoms:**
- Buttons show "Share" and "Export PDF" in English regardless of language
- Static labels don't change when switching language

**Possible Causes:**

1. **Browser Cache**
   - Solution: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache and reload

2. **Language Cookie Not Set**
   - Check if language selector is working
   - Verify cookie `NEXT_LOCALE` is being set

3. **Translation Keys Missing in Some Languages**
   - Check if all language files have the same keys

### Issue 2: How to Test Translations

1. **Open Browser DevTools**
   ```
   F12 → Application → Cookies → localhost:3000
   Look for: NEXT_LOCALE
   ```

2. **Check Current Language**
   ```javascript
   // In browser console
   document.cookie
   ```

3. **Manually Set Language**
   ```javascript
   // In browser console
   document.cookie = "NEXT_LOCALE=zh; path=/";
   location.reload();
   ```

### Issue 3: Verify Translation Keys

Run this to check all language files have the keys:

```bash
# Check English
cat messages/en.json | grep -A 15 '"report":'

# Check Chinese
cat messages/zh.json | grep -A 15 '"report":'

# Check Malay
cat messages/ms.json | grep -A 15 '"report":'
```

## 🧪 Testing Steps

1. **Test Language Switching**
   - Go to dashboard
   - Find language selector (usually in sidebar or header)
   - Switch between languages
   - Check if navigation labels change

2. **Test Report Translations**
   - Open any prediction report
   - Check if "Share" and "Export PDF" buttons appear
   - Switch language
   - Buttons should change language

3. **Test Analysis Data**
   - Analysis content should stay in original language
   - Only UI labels should translate

## 🔧 Quick Fixes

### Fix 1: Force Language Reload

Add this to your browser console:
```javascript
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Fix 2: Check Language Selector

Verify language selector component is setting cookie:
```typescript
// Should set cookie like this:
document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
```

### Fix 3: Verify Messages Import

Check dashboard layout imports messages correctly:
```typescript
const messages = (await import(`@/../messages/${locale}.json`)).default
```

## 📊 Current Translation Status

### ✅ Implemented Languages

1. **English (en)** - Complete
   - share: "Share"
   - exportPdf: "Export PDF"
   - shareReport: "Share Report"
   - All keys present ✅

2. **Chinese (zh)** - Complete
   - share: "分享"
   - exportPdf: "导出PDF"
   - shareReport: "分享报告"
   - All keys present ✅

3. **Malay (ms)** - Complete
   - share: "Kongsi"
   - exportPdf: "Eksport PDF"
   - shareReport: "Kongsi Laporan"
   - All keys present ✅

4. **Japanese (ja)** - Complete
   - share: "共有"
   - exportPdf: "PDFエクスポート"
   - shareReport: "レポートを共有"
   - All keys present ✅

5. **Korean (ko)** - Complete
   - share: "공유"
   - exportPdf: "PDF 내보내기"
   - shareReport: "보고서 공유"
   - All keys present ✅

## 🎯 Expected Behavior

### When Language = English
- Button: "Share" | "Export PDF"
- Dialog: "Share Report"
- Labels: "Expiry Days", "Generate Link"

### When Language = Chinese
- Button: "分享" | "导出PDF"
- Dialog: "分享报告"
- Labels: "有效期天数", "生成链接"

### When Language = Malay
- Button: "Kongsi" | "Eksport PDF"
- Dialog: "Kongsi Laporan"
- Labels: "Hari Tamat Tempoh", "Jana Pautan"

## 🐛 Common Issues

### Issue: All Text Shows in English

**Cause:** Language cookie not set or not being read

**Fix:**
1. Check if language selector exists in UI
2. Manually set cookie: `NEXT_LOCALE=zh`
3. Reload page
4. Check if cookie persists

### Issue: Some Labels Translate, Others Don't

**Cause:** Missing translation keys in some language files

**Fix:**
1. Compare all language files
2. Ensure all have same structure
3. Add missing keys

### Issue: Translations Work on Some Pages, Not Others

**Cause:** Page not wrapped in NextIntlClientProvider

**Fix:**
- Dashboard pages: Already wrapped ✅
- Other pages: Check layout.tsx

## 📝 How Translations Work

```
User selects language
    ↓
Cookie NEXT_LOCALE set
    ↓
Server reads cookie in layout.tsx
    ↓
Loads messages/{locale}.json
    ↓
Passes to NextIntlClientProvider
    ↓
useTranslations('report') hook reads messages
    ↓
t('share') returns translated text
```

## ✅ Verification Checklist

- [ ] Language selector visible in UI
- [ ] Clicking language changes cookie
- [ ] Cookie persists after reload
- [ ] Navigation labels change language
- [ ] Report buttons change language
- [ ] Analysis data stays original language
- [ ] All 5 languages work correctly

## 🚀 Next Steps

1. **Clear browser cache completely**
2. **Check language selector is working**
3. **Test each language manually**
4. **Verify cookie is being set**
5. **Check browser console for errors**

If translations still don't work after these steps, check:
- Browser console for errors
- Network tab for failed requests
- Server logs for import errors
