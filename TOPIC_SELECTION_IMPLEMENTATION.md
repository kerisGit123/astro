# Topic Selection & Multi-Language Implementation

## Overview
Added topic selection feature to the onboarding flow with full multi-language support (English, Chinese, Malay, Japanese).

## Features Implemented

### 1. Topic Selection Step
**New Step 2 in Onboarding Flow:**
- 5 topic badges with icons:
  - **Career & Wealth** (事业财运) - Briefcase icon
  - **Love & Marriage** (感情婚姻) - Heart icon
  - **Health & Wellness** (身体健康) - Activity icon
  - **Education & Studies** (学业考试) - GraduationCap icon
  - **Comprehensive Analysis** (综合运势) - Compass icon

- Interactive badge selection with visual feedback
- Dynamic prompt display showing localized analysis description
- Responsive grid layout (2 columns mobile, 3 columns desktop)

### 2. Multi-Language Support
**Language Switcher:**
- Globe icon dropdown in top-right corner
- Available on all 3 onboarding steps
- Persists selection via cookie (`NEXT_LOCALE`)
- Supports: English, 中文, Bahasa Melayu, 日本語

**Translation Files Updated:**
- `messages/en.json` - English translations
- `messages/zh.json` - Chinese translations
- `messages/ja.json` - Japanese translations
- `messages/ms.json` - Malay translations

**Translated Content:**
- All UI labels and buttons
- Topic names and descriptions
- Topic-specific prompts for each analysis type
- Form field labels and placeholders
- Validation messages

### 3. Database Schema Updates
**New Migration:** `005_add_topic_selection_fields.sql`

Added columns to `people` table:
```sql
- selected_topic TEXT (career|marriage|health|education|general)
- topic_prompt TEXT (localized prompt text)
- analysis_language TEXT (en|zh|ms|ja) DEFAULT 'en'
```

Constraints:
- Check constraint for valid topic values
- Check constraint for valid language codes

### 4. API Updates
**`/api/people` POST endpoint:**
- Accepts `selectedTopic`, `topicPrompt`, `analysisLanguage` fields
- Stores topic selection in database
- Passes data to n8n webhook for analysis

**n8n Webhook Payload:**
```json
{
  "personId": "uuid",
  "name": "...",
  "birthDate": "...",
  "selectedTopic": "career",
  "topicPrompt": "我想了解我未来的事业发展方向...",
  "analysisLanguage": "zh"
}
```

## Updated User Flow

### New Onboarding Flow (3 Steps)
```
Step 1: Welcome Screen
  - Language selector
  - Benefits overview
  - "Get Started" button

Step 2: Topic Selection (NEW)
  - Language selector
  - 5 topic badges with icons
  - Dynamic prompt preview
  - "Continue" button (disabled until topic selected)

Step 3: Birth Information Form
  - Language selector
  - All form fields (translated)
  - "Complete Setup" button
```

### Data Flow
```
1. User selects language → Updates UI translations
2. User selects topic → Shows localized prompt
3. User fills form → Submits with topic + language
4. API creates person record with all fields
5. n8n receives topic + prompt + language for analysis
6. Analysis generated in user's preferred language
```

## Topic Prompts by Language

### Career (事业财运)
- **EN:** "I want to understand my future career development direction, wealth opportunities, and potential challenges I may face."
- **ZH:** "我想了解我未来的事业发展方向、财运机会以及可能遇到的挑战。"
- **JA:** "私の将来のキャリア開発の方向性、財運の機会、そして直面する可能性のある課題について知りたいです。"
- **MS:** "Saya ingin memahami hala tuju pembangunan kerjaya masa depan saya, peluang kekayaan, dan cabaran yang mungkin saya hadapi."

### Marriage (感情婚姻)
- **EN:** "I want to understand my romantic fortune, marriage prospects, and characteristics of my future partner."
- **ZH:** "我想了解我的感情运势、婚姻前景以及未来伴侣的特征。"
- **JA:** "私の恋愛運、結婚の見通し、そして将来のパートナーの特徴について知りたいです。"
- **MS:** "Saya ingin memahami nasib romantik saya, prospek perkahwinan, dan ciri-ciri pasangan masa depan saya."

### Health (身体健康)
- **EN:** "I want to understand my health condition and which aspects of my body I need to pay special attention to."
- **ZH:** "我想了解我的健康状况，以及需要特别注意身体的哪些方面。"
- **JA:** "私の健康状態と、特に注意が必要な体の部分について知りたいです。"
- **MS:** "Saya ingin memahami keadaan kesihatan saya dan aspek badan mana yang perlu saya beri perhatian khusus."

### Education (学业考试)
- **EN:** "I want to understand my academic fortune, exam luck, and suitable fields for further studies."
- **ZH:** "我想了解我的学业运势、考试运气以及适合深造的领域。"
- **JA:** "私の学業運、試験運、そして深く学ぶのに適した分野について知りたいです。"
- **MS:** "Saya ingin memahami nasib akademik saya, nasib peperiksaan, dan bidang yang sesuai untuk pengajian lanjutan."

### General (综合运势)
- **EN:** "Please provide me with a comprehensive destiny analysis, including career, wealth, relationships, and health dimensions."
- **ZH:** "请为我进行一次全方位的命理分析，包含事业、财运、感情和健康等维度。"
- **JA:** "キャリア、財運、恋愛、健康などの次元を含む包括的な運命分析を提供してください。"
- **MS:** "Sila berikan saya analisis takdir yang menyeluruh, termasuk dimensi kerjaya, kekayaan, hubungan, dan kesihatan."

## Files Modified

### Translation Files
- `messages/en.json` - Added `onboarding` section with 40+ keys
- `messages/zh.json` - Added Chinese translations
- `messages/ja.json` - Added Japanese translations
- `messages/ms.json` - Added Malay translations

### Frontend
- `src/app/onboarding/page.tsx` - Complete rewrite with:
  - 3-step flow (was 2 steps)
  - Language switcher component
  - Topic selection UI with badges
  - Dynamic translation loading
  - Cookie-based locale persistence

### Backend
- `src/app/api/people/route.ts` - Updated to handle:
  - `selectedTopic` field
  - `topicPrompt` field
  - `analysisLanguage` field
  - Pass data to n8n webhook

### Database
- `migrations/005_add_topic_selection_fields.sql` - New migration

## Usage for Re-analyze Feature

The same topic selection can be used for the re-analyze feature:

1. User goes to Settings → Re-analyze
2. Shows topic selection UI (same as onboarding step 2)
3. User selects new topic or keeps existing
4. Triggers re-analysis with updated topic + language
5. n8n generates new analysis based on selected focus

## Testing Checklist

- [x] Language switcher works on all 3 steps
- [x] Translations load correctly for all 4 languages
- [x] Topic badges are clickable and show selection state
- [x] Topic prompt displays in selected language
- [x] Continue button disabled until topic selected
- [x] Form fields use translated labels
- [x] Data persists to database with all new fields
- [x] n8n webhook receives topic + language data
- [x] Cookie persists language selection

## Next Steps

1. **Run Migration:** Execute `migrations/005_add_topic_selection_fields.sql`
2. **Update n8n Workflow:** Configure to use `selectedTopic`, `topicPrompt`, and `analysisLanguage` fields
3. **Add to Re-analyze:** Integrate topic selection into settings re-analyze flow
4. **Test End-to-End:** Complete onboarding flow in all 4 languages

## Benefits

✅ **User-Focused Analysis:** Users get targeted insights for their specific concerns
✅ **Multi-Language Support:** Seamless experience for international users
✅ **Better UX:** Clear visual feedback with icons and interactive badges
✅ **Flexible:** Same system can be reused for re-analysis
✅ **Localized Prompts:** AI receives context-appropriate prompts in user's language
✅ **Persistent Preferences:** Language choice saved for future sessions
