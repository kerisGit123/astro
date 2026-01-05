# Zodiac Analysis - Quick Start Guide

## What Was Created

A complete Western & Chinese Zodiac personality analysis system that combines both zodiac systems to create 144 unique personality profiles.

## Files Created

1. **`src/app/dashboard/zodiac-analysis/page.tsx`** - Frontend page for zodiac analysis
2. **`src/app/api/predictions/zodiac-analyze/route.ts`** - API endpoint to handle requests
3. **`N8N_ZODIAC_PROMPTS.md`** - Complete n8n prompts and configuration
4. **`ZODIAC_ANALYSIS_IMPLEMENTATION.md`** - Detailed implementation guide

## Updated Files

- **`src/app/api/n8n/prediction-result/route.ts`** - Added zodiac result handling

## How to Use

### 1. Access the Page
Navigate to: `http://localhost:3000/dashboard/zodiac-analysis`

### 2. Select a Person
- Choose from your saved people list
- Person must have gender information
- Birthdate is automatically retrieved

### 3. Choose Language
- English (en)
- Chinese (zh)
- Malay (ms)

### 4. Analyze
Click "Analyze Zodiac Personality" button

### 5. View Results
Automatically redirected to the prediction report page

## Data Sent to n8n

```json
{
  "language": "en",
  "type": "wczodiac",
  "predictionId": "pred_1234567890_abc123",
  "personId": "person_uuid",
  "userId": "user_clerk_id",
  "birthdate": "15/03/1990",
  "gender": "Male",
  "name": "John Doe",
  "callbackUrl": "https://your-app.com/api/n8n/prediction-result"
}
```

## n8n Webhook URL

```
https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
```

Already configured in `.env.local` as `N8N_PREDICTION_WEBHOOK_URL`

## n8n Setup Required

### 1. Create Webhook Node
- Method: POST
- Response: `{ "status": "processing", "predictionId": "{{$json.predictionId}}" }`

### 2. Add LLM Node
- Use system prompt from `N8N_ZODIAC_PROMPTS.md`
- Use user prompt template with variables
- Configure structured JSON output
- Use the JSON schema provided

### 3. Add HTTP Request Node (Callback)
- POST to: `{{$json.callbackUrl}}`
- Header: `x-n8n-secret: your-secret`
- Body: Include all LLM response fields

## Prompts Location

All prompts are in **`N8N_ZODIAC_PROMPTS.md`**:
- System Prompt (copy to n8n)
- User Prompt Template (copy to n8n)
- Structured Output JSON Schema (copy to n8n)

## What the Analysis Provides

1. **Western Zodiac** - Sign, element, traits
2. **Chinese Zodiac** - Animal, element, characteristics
3. **Combined Profile** - Unique combination insights (1 of 144)
4. **Strengths** - Key strengths from the combination
5. **Weaknesses** - Areas for growth
6. **Career & Life Path** - Career guidance and life direction
7. **Relationships** - Love and friendship patterns
8. **Personal Growth** - Actionable advice

## Token Cost

- 1 token per analysis
- User must have sufficient token balance

## Testing

### Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/predictions/zodiac-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "your-person-id",
    "birthdate": "15/03/1990",
    "gender": "Male",
    "name": "Test User",
    "language": "en"
  }'
```

### Test n8n Webhook
```bash
curl -X POST https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Important Notes

1. **Person must have gender** - Required for analysis
2. **Birthdate format** - Automatically converted to DD/MM/YYYY
3. **Token required** - 1 token deducted per analysis
4. **Callback security** - Uses shared secret for authentication
5. **Analysis type** - Set as "wczodiac" in database

## Environment Variables

Already configured in `.env.local`:
```env
N8N_PREDICTION_WEBHOOK_URL=https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
N8N_CALLBACK_SHARED_SECRET=2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
NEXT_PUBLIC_APP_URL=https://your-app.com
```

## Next Steps

1. ✅ Frontend page created
2. ✅ API endpoint created
3. ✅ Callback handler updated
4. ✅ Documentation complete
5. ⏳ **Configure n8n workflow** (use `N8N_ZODIAC_PROMPTS.md`)
6. ⏳ **Test end-to-end flow**
7. ⏳ **Add navigation link to dashboard**

## Support

For detailed information, see:
- **`ZODIAC_ANALYSIS_IMPLEMENTATION.md`** - Complete implementation guide
- **`N8N_ZODIAC_PROMPTS.md`** - All prompts and n8n configuration
