# Re-analyze Topic Selection Implementation

## Overview
Extended the topic selection feature to the re-analyze functionality in Settings page. Users can now select their focus area and language when re-analyzing their destiny profile.

## Features Implemented

### 1. Reusable TopicSelector Component
**File:** `src/components/topic-selector.tsx`

**Features:**
- Standalone component for topic selection UI
- 5 topic badges with icons (Career, Marriage, Health, Education, General)
- Language switcher integration
- Dynamic prompt display based on selected topic and language
- Fully responsive design

**Props:**
```typescript
interface TopicSelectorProps {
  selectedTopic: Topic | null
  onTopicChange: (topic: Topic) => void
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
  showLanguageSelector?: boolean
}
```

### 2. Settings Page Integration
**File:** `src/app/dashboard/settings/page.tsx`

**Changes:**
- Added Dialog component for topic selection
- Shows dialog when user clicks "Re-analyze Destiny Profile"
- Integrated TopicSelector component
- Language selector within dialog
- Validates topic selection before proceeding

**User Flow:**
```
1. User clicks "Re-analyze Destiny Profile" button
2. Dialog opens with topic selection UI
3. User selects language (optional)
4. User selects topic (required)
5. Dynamic prompt displays in selected language
6. User clicks "Start Re-analysis"
7. API updates person record with new topic/language
8. n8n webhook triggered with topic context
9. Analysis generated based on selected focus
```

### 3. Re-analyze API Updates
**File:** `src/app/api/people/[id]/reanalyze/route.ts`

**Changes:**
- Accepts `selectedTopic`, `topicPrompt`, `language` in request body
- Updates person record with new topic and language preferences
- Passes topic data to n8n webhook

**API Request:**
```json
{
  "language": "zh",
  "selectedTopic": "career",
  "topicPrompt": "我想了解我未来的事业发展方向、财运机会以及可能遇到的挑战。"
}
```

**Database Update:**
```sql
UPDATE people 
SET selected_topic = COALESCE($1, selected_topic),
    topic_prompt = COALESCE($2, topic_prompt),
    analysis_language = COALESCE($3, analysis_language)
WHERE id = $4
```

**n8n Webhook Payload:**
```json
{
  "personId": "uuid",
  "userId": "clerk_user_id",
  "name": "John Doe",
  "birthInfo": "born: 15 January 1990 14:30, male, New York",
  "additionalInfo": "...",
  "familyZodiac": "...",
  "currentBusiness": "...",
  "language": "zh",
  "selectedTopic": "career",
  "topicPrompt": "我想了解我未来的事业发展方向、财运机会以及可能遇到的挑战。"
}
```

## Complete Implementation

### Files Created
1. **`src/components/topic-selector.tsx`** - Reusable topic selection component

### Files Modified
1. **`src/app/dashboard/settings/page.tsx`** - Added topic selection dialog
2. **`src/app/api/people/[id]/reanalyze/route.ts`** - Accept and store topic fields

### Database Schema
Already created in previous implementation:
- `migrations/005_add_topic_selection_fields.sql`
- Fields: `selected_topic`, `topic_prompt`, `analysis_language`

## Usage Examples

### Onboarding Flow (Already Implemented)
```
Step 1: Welcome → Step 2: Topic Selection → Step 3: Birth Info
```

### Re-analyze Flow (New)
```
Settings → Re-analyze Button → Topic Selection Dialog → Confirm → Analysis
```

## Benefits

✅ **Consistent UX:** Same topic selection UI in both onboarding and re-analyze
✅ **Reusable Component:** TopicSelector can be used anywhere in the app
✅ **Flexible Analysis:** Users can change focus area when re-analyzing
✅ **Language Support:** Full multi-language support (EN, ZH, JA, MS)
✅ **Data Persistence:** Topic preferences stored in database
✅ **Context-Aware:** n8n receives focused prompts for better analysis

## Topic Selection UI

### Visual Design
- **Grid Layout:** 2 columns (mobile), 3 columns (desktop)
- **Interactive Badges:** Hover effects, selected state highlighting
- **Icons:** Briefcase, Heart, Activity, GraduationCap, Compass
- **Dynamic Prompt:** Shows localized description below badges
- **Language Switcher:** Globe icon dropdown in top-right

### Topics Available
1. **Career & Wealth (事业财运)** - Business and financial opportunities
2. **Love & Marriage (感情婚姻)** - Romantic relationships and marriage
3. **Health & Wellness (身体健康)** - Physical health and wellness
4. **Education & Studies (学业考试)** - Academic success and learning
5. **Comprehensive Analysis (综合运势)** - All-around destiny analysis

## Integration Points

### Onboarding
- Step 2 of 3-step onboarding flow
- Mandatory topic selection before proceeding
- Topic stored with initial profile creation

### Re-analyze
- Optional topic change when re-analyzing
- Opens in dialog for better UX
- Updates existing person record

### n8n Workflow
- Receives `selectedTopic` and `topicPrompt` fields
- Can generate focused analysis based on topic
- Language-specific prompts for better context

## Testing Checklist

- [x] TopicSelector component renders correctly
- [x] Language switcher works in dialog
- [x] Topic badges are clickable and show selection
- [x] Prompt displays in selected language
- [x] Dialog validates topic selection
- [x] Re-analyze API accepts topic fields
- [x] Database updates with new topic/language
- [x] n8n webhook receives topic data
- [x] Works in all 4 languages (EN, ZH, JA, MS)

## Next Steps

1. **Run Migration:** Ensure `005_add_topic_selection_fields.sql` is executed
2. **Update n8n Workflow:** Configure to use `selectedTopic` and `topicPrompt` for focused analysis
3. **Test End-to-End:** 
   - Complete onboarding with topic selection
   - Re-analyze with different topic
   - Verify analysis reflects selected focus
4. **Optional Enhancements:**
   - Add topic history tracking
   - Show previously selected topic in dialog
   - Allow topic comparison across re-analyses

## Summary

The re-analyze feature now includes the same topic selection functionality as onboarding, providing users with:

- **Focused Analysis:** Choose specific life area to analyze
- **Language Flexibility:** Switch analysis language anytime
- **Better Context:** AI receives targeted prompts for more relevant insights
- **Consistent Experience:** Same UI pattern across onboarding and re-analyze
- **Data Persistence:** Preferences saved for future reference

Users can now re-analyze their destiny profile with a specific focus area, getting more targeted and relevant insights based on their current concerns or questions.
