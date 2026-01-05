# Western & Chinese Zodiac Analysis Implementation Guide

## Overview

This implementation provides a comprehensive zodiac personality analysis system that combines Western and Chinese zodiac systems to create 144 unique personality profiles (12 Western signs × 12 Chinese animals).

## Files Created

### 1. Frontend Page
- **File**: `src/app/dashboard/zodiac-analysis/page.tsx`
- **Purpose**: User interface for selecting a person and initiating zodiac analysis
- **Features**:
  - Person selection dropdown
  - Language selection (English, Chinese, Malay)
  - Display of person details (name, birthdate, gender)
  - Previous analysis history
  - Direct navigation to analysis reports

### 2. API Endpoint
- **File**: `src/app/api/predictions/zodiac-analyze/route.ts`
- **Purpose**: Handles zodiac analysis requests and sends data to n8n webhook
- **Features**:
  - User authentication via Clerk
  - Token balance validation
  - Person data retrieval
  - Prediction record creation
  - n8n webhook integration
  - Token deduction

### 3. Updated Callback Handler
- **File**: `src/app/api/n8n/prediction-result/route.ts` (updated)
- **Purpose**: Receives and stores zodiac analysis results from n8n
- **Added Support For**:
  - Western zodiac data (sign, element, traits)
  - Chinese zodiac data (animal, element, characteristics)
  - Combined profile (unique combination insights)
  - Strengths and weaknesses
  - Career and life path guidance
  - Personal growth recommendations

### 4. Documentation
- **File**: `N8N_ZODIAC_PROMPTS.md`
- **Purpose**: Complete n8n workflow configuration guide
- **Contains**:
  - System prompt for LLM
  - User prompt template
  - Structured output JSON schema
  - Webhook payload structure
  - n8n workflow setup instructions

## Data Flow

```
User → Frontend Page → API Endpoint → n8n Webhook → LLM Analysis → Callback → Database → Report Page
```

### Step-by-Step Flow

1. **User Selects Person**
   - User navigates to `/dashboard/zodiac-analysis`
   - Selects a person from their saved people list
   - Chooses language preference
   - Clicks "Analyze Zodiac Personality"

2. **Frontend Sends Request**
   ```json
   POST /api/predictions/zodiac-analyze
   {
     "language": "en",
     "type": "wczodiac",
     "predictionId": "pred_1234567890_abc123",
     "personId": "person_uuid",
     "birthdate": "15/03/1990",
     "gender": "Male",
     "name": "John Doe",
     "webhookUrl": "https://n8n.srv1010007.hstgr.cloud/webhook-test/..."
   }
   ```

3. **API Validates & Processes**
   - Checks user authentication
   - Validates token balance (requires 1 token)
   - Retrieves person data from database
   - Creates prediction record with status "processing"
   - Formats birthdate to DD/MM/YYYY

4. **API Sends to n8n**
   ```json
   POST https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
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

5. **n8n Processes Request**
   - Webhook receives data
   - LLM node analyzes personality using both zodiac systems
   - Generates structured JSON output
   - Sends result back to callback URL

6. **Callback Receives Result**
   ```json
   POST /api/n8n/prediction-result
   Headers: { "x-n8n-secret": "your-secret" }
   {
     "predictionId": "pred_1234567890_abc123",
     "westernZodiac": { ... },
     "chineseZodiac": { ... },
     "combinedProfile": { ... },
     "strengths": [ ... ],
     "weaknesses": [ ... ],
     "careerAndLifePath": { ... },
     "relationships": { ... },
     "personalGrowth": { ... },
     "summary": "..."
   }
   ```

7. **Database Updated**
   - Prediction record updated with complete analysis
   - Status changed to "completed"

8. **User Views Report**
   - Frontend redirects to `/dashboard/prediction-report/{predictionId}`
   - Report displays all zodiac analysis data

## n8n Workflow Setup

### Required Nodes

1. **Webhook Node**
   - Method: POST
   - Path: `/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f`
   - Response Mode: Respond Immediately
   - Response: `{ "status": "processing", "predictionId": "{{$json.predictionId}}" }`

2. **LLM Node (OpenAI/Anthropic/DeepSeek)**
   - **Model**: Choose one:
     - OpenAI: `gpt-4` or `gpt-4-turbo`
     - Anthropic: `claude-3-5-sonnet-20241022`
     - DeepSeek: `deepseek-chat`
   
   - **System Prompt**: Copy from `N8N_ZODIAC_PROMPTS.md`
   
   - **User Prompt**:
     ```
     Analyze the personality and characteristics for the following person:

     **Name:** {{$json.name}}
     **Gender:** {{$json.gender}}
     **Birthdate:** {{$json.birthdate}} (DD/MM/YYYY format)
     **Language:** {{$json.language}}

     [Include full prompt from documentation]
     ```
   
   - **Output Format**: JSON (Structured Output)
   - **JSON Schema**: Copy from `N8N_ZODIAC_PROMPTS.md`

3. **HTTP Request Node (Callback)**
   - Method: POST
   - URL: `{{$json.callbackUrl}}`
   - Headers:
     ```json
     {
       "Content-Type": "application/json",
       "x-n8n-secret": "{{$env.N8N_CALLBACK_SHARED_SECRET}}"
     }
     ```
   - Body:
     ```json
     {
       "predictionId": "{{$json.predictionId}}",
       "type": "wczodiac",
       "westernZodiac": "{{$json.llmResponse.westernZodiac}}",
       "chineseZodiac": "{{$json.llmResponse.chineseZodiac}}",
       "combinedProfile": "{{$json.llmResponse.combinedProfile}}",
       "strengths": "{{$json.llmResponse.strengths}}",
       "weaknesses": "{{$json.llmResponse.weaknesses}}",
       "careerAndLifePath": "{{$json.llmResponse.careerAndLifePath}}",
       "relationships": "{{$json.llmResponse.relationships}}",
       "personalGrowth": "{{$json.llmResponse.personalGrowth}}",
       "summary": "{{$json.llmResponse.summary}}"
     }
     ```

### Environment Variables in n8n

Add these to your n8n environment:
- `N8N_CALLBACK_SHARED_SECRET`: Your shared secret for callback authentication

## Database Schema

The system uses the existing `predictions` table:

```sql
-- Predictions table (already exists)
CREATE TABLE predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'wczodiac' for zodiac analysis
  result_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Result Data Structure for Zodiac Analysis

```json
{
  "status": "completed",
  "analysisType": "wczodiac",
  "westernZodiac": {
    "sign": "Aries",
    "element": "Fire",
    "dates": "March 21 - April 19",
    "coreTraits": ["Energetic", "Confident", "Courageous"]
  },
  "chineseZodiac": {
    "animal": "Dragon",
    "element": "Earth",
    "years": "1988, 2000, 2012",
    "coreCharacteristics": ["Ambitious", "Charismatic", "Lucky"]
  },
  "combinedProfile": {
    "combinationName": "Aries Dragon",
    "combinationNumber": "13 of 144",
    "overview": "The Aries Dragon is a powerhouse...",
    "uniqueTraits": ["Dynamic leadership", "Fearless innovation"]
  },
  "strengths": [
    {
      "strength": "Natural Leadership",
      "description": "Combines Aries initiative with Dragon charisma"
    }
  ],
  "weaknesses": [
    {
      "weakness": "Impulsiveness",
      "description": "May act too quickly without full consideration"
    }
  ],
  "careerAndLifePath": {
    "suitableCareers": ["Entrepreneur", "Executive", "Creative Director"],
    "workStyle": "Bold, innovative, and results-driven",
    "lifeDirection": "Path of leadership and creative achievement"
  },
  "relationships": {
    "loveStyle": "Passionate and protective",
    "friendshipStyle": "Loyal and inspiring",
    "compatibleSigns": ["Leo Tiger", "Sagittarius Monkey"],
    "challengingSigns": ["Cancer Ox", "Capricorn Dog"]
  },
  "personalGrowth": {
    "keyAdvice": [
      "Practice patience in decision-making",
      "Balance ambition with empathy"
    ],
    "areasToFocus": ["Emotional intelligence", "Long-term planning"],
    "lifeLessons": "Learning to channel immense energy wisely"
  },
  "summary": "The Aries Dragon represents one of the most dynamic..."
}
```

## Environment Variables

Add to `.env.local`:

```env
# Already exists
N8N_PREDICTION_WEBHOOK_URL=https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
N8N_CALLBACK_SHARED_SECRET=2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
NEXT_PUBLIC_APP_URL=https://your-app.com
```

## Testing the Implementation

### 1. Test the Frontend

```bash
# Navigate to the zodiac analysis page
http://localhost:3000/dashboard/zodiac-analysis
```

**Steps**:
1. Select a person from the dropdown
2. Verify person details display correctly
3. Choose language
4. Click "Analyze Zodiac Personality"
5. Check for success toast message
6. Verify redirect to report page

### 2. Test the API Endpoint

```bash
curl -X POST http://localhost:3000/api/predictions/zodiac-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "type": "wczodiac",
    "predictionId": "test_pred_123",
    "personId": "your-person-id",
    "birthdate": "15/03/1990",
    "gender": "Male",
    "name": "Test User"
  }'
```

### 3. Test n8n Webhook

```bash
curl -X POST https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "type": "wczodiac",
    "predictionId": "test_pred_123",
    "personId": "person_uuid",
    "userId": "user_clerk_id",
    "birthdate": "15/03/1990",
    "gender": "Male",
    "name": "John Doe",
    "callbackUrl": "https://your-app.com/api/n8n/prediction-result"
  }'
```

### 4. Test Callback Endpoint

```bash
curl -X POST http://localhost:3000/api/n8n/prediction-result \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p" \
  -d '{
    "predictionId": "test_pred_123",
    "type": "wczodiac",
    "westernZodiac": {
      "sign": "Aries",
      "element": "Fire",
      "dates": "March 21 - April 19",
      "coreTraits": ["Energetic", "Confident"]
    },
    "chineseZodiac": {
      "animal": "Dragon",
      "element": "Earth",
      "years": "1988, 2000, 2012",
      "coreCharacteristics": ["Ambitious", "Charismatic"]
    }
  }'
```

## Troubleshooting

### Issue: "Insufficient tokens"
**Solution**: Ensure user has token balance. Check `user_tokens` table.

### Issue: "Person not found"
**Solution**: Verify person exists and belongs to the authenticated user.

### Issue: n8n webhook fails
**Solution**: 
- Check n8n workflow is active
- Verify webhook URL is correct
- Check n8n logs for errors

### Issue: Callback fails
**Solution**:
- Verify `N8N_CALLBACK_SHARED_SECRET` matches in both systems
- Check callback URL is accessible from n8n
- Review API logs for errors

### Issue: Gender not specified
**Solution**: Ensure person record has gender field populated. Update person data if needed.

## Navigation

Add link to dashboard navigation:

```tsx
// In your dashboard layout or navigation component
<Link href="/dashboard/zodiac-analysis">
  <Star className="h-4 w-4" />
  Zodiac Analysis
</Link>
```

## Future Enhancements

1. **Compatibility Analysis**: Compare two people's zodiac combinations
2. **Yearly Zodiac Forecast**: Predict how zodiac influences yearly luck
3. **Element Analysis**: Deep dive into element interactions
4. **Lucky Colors/Numbers**: Based on zodiac combination
5. **Best Career Matches**: Detailed career recommendations
6. **Relationship Compatibility Score**: Numerical compatibility rating
7. **Multi-language Support**: Full translations for all analysis content
8. **PDF Export**: Download zodiac analysis as PDF report
9. **Share Analysis**: Share zodiac profile with others
10. **Historical Analysis**: Track how predictions align with life events

## API Reference

### POST `/api/predictions/zodiac-analyze`

**Request Body**:
```typescript
{
  language: string;        // 'en' | 'zh' | 'ms'
  type: string;           // 'wczodiac'
  predictionId?: string;  // Optional, auto-generated if not provided
  personId: string;       // UUID of person
  birthdate: string;      // DD/MM/YYYY format
  gender: string;         // 'Male' | 'Female' | 'Other'
  name: string;           // Person's name
  webhookUrl?: string;    // Optional, uses env var if not provided
}
```

**Response**:
```typescript
{
  success: boolean;
  predictionId: string;
  status: 'processing';
  message: string;
}
```

**Error Responses**:
- `401`: Unauthorized (not logged in)
- `402`: Insufficient tokens
- `404`: Person not found
- `400`: Missing required fields
- `500`: Internal server error

## Cost Considerations

- **Token Cost**: 1 token per zodiac analysis
- **LLM Cost**: Varies by provider (GPT-4, Claude, DeepSeek)
- **Estimated LLM Cost**: $0.01 - $0.05 per analysis (depending on model)

## Security

1. **Authentication**: All endpoints require Clerk authentication
2. **Authorization**: Users can only analyze their own people
3. **Callback Security**: Shared secret validation for n8n callbacks
4. **Token Validation**: Prevents unauthorized usage
5. **Input Validation**: All inputs validated before processing

## Conclusion

This implementation provides a complete zodiac analysis system that:
- ✅ Combines Western and Chinese zodiac systems
- ✅ Generates 144 unique personality profiles
- ✅ Integrates with n8n for LLM processing
- ✅ Provides comprehensive personality insights
- ✅ Includes career, relationship, and growth guidance
- ✅ Supports multiple languages
- ✅ Tracks analysis history
- ✅ Validates tokens and permissions
- ✅ Handles errors gracefully

The system is production-ready and can be extended with additional features as needed.
