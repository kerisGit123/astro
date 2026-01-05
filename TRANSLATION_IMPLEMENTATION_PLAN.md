# Translation Implementation Plan

## Pages Needing Translation Support

### ✅ Already Have Translations
1. `report/page.tsx` - Has `useTranslations('report')` ✅
2. `prediction-report/page.tsx` - Has `useTranslations('report')` ✅

### ❌ Need Translation Implementation

#### High Priority (User-Facing Content Pages)
1. **monthly-prediction/page.tsx**
   - Hardcoded: "Monthly Prediction", "Get Monthly Prediction", "Select Person", "Target Month", "Previous Monthly Predictions"
   
2. **yearly-prediction/page.tsx**
   - Hardcoded: "Yearly Prediction", "Get Yearly Prediction", "Select Person", "Target Year", "Previous Yearly Predictions"
   
3. **zodiac-analysis/page.tsx**
   - Hardcoded: "Zodiac Analysis", "New Zodiac Analysis", "Previous Analyses", "Select Person", "Search by name"
   
4. **compatibility/page.tsx**
   - Need to check for hardcoded strings
   
5. **compatibility-report/page.tsx**
   - Need to check for hardcoded strings

#### Medium Priority (Dashboard/Management Pages)
6. **page.tsx** (dashboard home)
7. **people/page.tsx**
8. **settings/page.tsx**
9. **credits/page.tsx**
10. **subscription/page.tsx**

#### Lower Priority (Profile/History Pages)
11. **destiny-profile/page.tsx**
12. **risk-warning/page.tsx**
13. **timing-opportunities/page.tsx**
14. **compatibility-history/page.tsx**
15. **love-compatibility/page.tsx**

## Translation Keys Structure

```json
{
  "monthlyPrediction": {
    "title": "Monthly Prediction",
    "newPrediction": "Get Monthly Prediction",
    "selectPerson": "Select Person",
    "targetMonth": "Target Month",
    "previousPredictions": "Previous Monthly Predictions",
    "lifeFocus": "Life Focus",
    "currentConcern": "Current Concern",
    "analyze": "Analyze",
    "viewReport": "View Report",
    "delete": "Delete",
    "noPredictions": "No predictions yet"
  },
  "yearlyPrediction": {
    "title": "Yearly Prediction",
    "newPrediction": "Get Yearly Prediction",
    "selectPerson": "Select Person",
    "targetYear": "Target Year",
    "previousPredictions": "Previous Yearly Predictions"
  },
  "zodiacAnalysis": {
    "title": "Zodiac Analysis",
    "newAnalysis": "New Zodiac Analysis",
    "previousAnalyses": "Previous Analyses",
    "selectPerson": "Select Person",
    "searchByName": "Search by name",
    "viewModes": {
      "grid": "Grid",
      "card": "Card",
      "list": "List"
    },
    "categories": {
      "all": "All",
      "team": "Team",
      "family": "Family",
      "friends": "Friends",
      "business": "Business",
      "self": "Self"
    }
  }
}
```

## Implementation Steps

1. ✅ Add translation keys to all 5 language files (en, zh, ms, ja, ko)
2. ❌ Update each page to import and use `useTranslations`
3. ❌ Replace all hardcoded strings with `t('key')` calls
4. ❌ Test each page with language switching
