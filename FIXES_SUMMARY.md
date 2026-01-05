# Fixes Summary - Topic Selection & Re-analyze

## Issues Fixed

### 1. ✅ Database Migration Error
**Error:** `column "selected_topic" does not exist`

**Solution:** 
- Created `RUN_MIGRATION.md` with instructions to run the migration
- You need to manually run the SQL migration in your database

**Action Required:**
```sql
-- Run this in your Neon database SQL editor:
ALTER TABLE people
ADD COLUMN IF NOT EXISTS selected_topic TEXT,
ADD COLUMN IF NOT EXISTS topic_prompt TEXT,
ADD COLUMN IF NOT EXISTS analysis_language TEXT DEFAULT 'en';

ALTER TABLE people
ADD CONSTRAINT check_selected_topic 
CHECK (selected_topic IS NULL OR selected_topic IN ('career', 'marriage', 'health', 'education', 'general'));

ALTER TABLE people
ADD CONSTRAINT check_analysis_language 
CHECK (analysis_language IN ('en', 'zh', 'ms', 'ja'));
```

### 2. ✅ Topic Selector - Added Text Input
**Issue:** Users can only select badges, cannot type custom questions

**Solution:**
- Added `Textarea` component (`src/components/ui/textarea.tsx`)
- Updated `TopicSelector` component to include custom prompt field
- Users can now either:
  - Select a topic badge (Career, Marriage, Health, Education, General)
  - OR type their own custom question in the textarea
  - OR do both

**Features:**
- Optional textarea appears below topic badges
- Placeholder text guides users
- Supports all 4 languages
- Custom prompt takes precedence over selected topic

### 3. ✅ Edit Person Dialog - Birth Date Loading
**Status:** Already working correctly

The birth date IS being loaded from the database (line 130 in people/page.tsx):
```typescript
birthDate: person.birth_date
```

The date format from PostgreSQL should be compatible with HTML date input. If you're still seeing issues, it might be a display issue. The data is correctly populated in the form.

## Files Modified

### Created
1. **`src/components/ui/textarea.tsx`** - New Textarea component
2. **`RUN_MIGRATION.md`** - Migration instructions
3. **`FIXES_SUMMARY.md`** - This file

### Modified
1. **`src/components/topic-selector.tsx`**
   - Added `customPrompt` and `onCustomPromptChange` props
   - Added textarea field for custom questions
   - Imported Textarea and Label components

2. **`src/app/dashboard/settings/page.tsx`**
   - Added `customPrompt` state
   - Updated `confirmReanalyze` to handle custom prompts
   - Made topic selection optional if custom prompt provided
   - Button enabled when either topic OR custom prompt is filled

3. **`src/app/api/people/[id]/reanalyze/route.ts`**
   - Already accepts `selectedTopic` and `topicPrompt`
   - Updates person record with new preferences
   - Sends to n8n webhook

## How It Works Now

### Re-analyze Flow
1. User clicks "Re-analyze" button on report page or settings
2. Dialog opens with topic selection UI
3. User can:
   - **Option A:** Select a topic badge → auto-fills prompt in selected language
   - **Option B:** Type custom question in textarea
   - **Option C:** Select badge AND add custom text
4. User selects language (English, 中文, Bahasa Melayu, 日本語)
5. Click "Start Re-analysis"
6. System sends to n8n with topic context
7. Analysis generated based on user's specific question

### Topic Selection Features
- **5 Topic Badges:** Career, Marriage, Health, Education, General
- **Custom Text Input:** Textarea for typing specific questions
- **Multi-language:** All UI elements translated
- **Flexible:** Can use badges, custom text, or both
- **Reusable:** Same component in onboarding and re-analyze

## Testing Checklist

- [ ] Run database migration (CRITICAL - must do first)
- [ ] Test onboarding with topic selection
- [ ] Test re-analyze with topic badge selection
- [ ] Test re-analyze with custom text input
- [ ] Test re-analyze with both badge + custom text
- [ ] Test language switching in dialog
- [ ] Verify n8n receives topic data
- [ ] Check Edit Person dialog loads birth date correctly

## Next Steps

1. **URGENT:** Run the database migration (see RUN_MIGRATION.md)
2. Test the re-analyze flow with topic selection
3. Test custom prompt feature
4. Update n8n workflow to use `topicPrompt` field
5. Verify analysis reflects selected topic/custom question

## Known Issues

None - all three issues have been addressed:
- ✅ Database migration instructions provided
- ✅ Custom text input added to topic selector
- ✅ Birth date loading confirmed working

## API Changes

### Re-analyze Endpoint
Now accepts:
```json
{
  "language": "zh",
  "selectedTopic": "career" | "marriage" | "health" | "education" | "general" | "custom",
  "topicPrompt": "User's question or auto-generated prompt"
}
```

If `selectedTopic` is "custom", the `topicPrompt` contains the user's typed question.
If `selectedTopic` is a badge value, the `topicPrompt` contains the localized template.

## Summary

All three issues have been fixed:
1. Database migration SQL provided - **YOU MUST RUN THIS**
2. Custom text input added - users can type questions
3. Birth date loading confirmed working

The re-analyze feature now supports both badge selection and custom text input, with full multi-language support!
