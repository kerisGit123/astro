# n8n Prediction System Endpoints

## Overview
This document describes the n8n webhook endpoints for the prediction system (monthly and yearly predictions).

---

## 1. Outgoing Webhook (Frontend → n8n)

### Environment Variable
```bash
N8N_PREDICTION_WEBHOOK_URL=https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
```

### Endpoint
**URL:** `https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Payload Structure

#### Monthly Prediction
```json
{
  "predictionId": "uuid-here",
  "userId": "user_xxx",
  "personId": "uuid-here",
  "type": "monthly",
  "language": "zh",
  "person": {
    "name": "John Doe",
    "birthdate": "15/03/1990",
    "birthtime": "14:30",
    "birthplace": "Kuala Lumpur",
    "gender": "male"
  },
  "targetMonth": "2026-01",
  "timezone": "Asia/Kuala_Lumpur",
  "lifeFocus": "career",
  "currentConcern": "Looking for new opportunities"
}
```

#### Yearly Prediction
```json
{
  "predictionId": "uuid-here",
  "userId": "user_xxx",
  "personId": "uuid-here",
  "type": "yearly",
  "language": "zh",
  "person": {
    "name": "John Doe",
    "birthdate": "15/03/1990",
    "birthtime": "14:30",
    "birthplace": "Kuala Lumpur",
    "gender": "male"
  },
  "targetYear": "2026",
  "lifeFocus": "finance",
  "currentConcern": "Planning for financial growth"
}
```

### Field Descriptions
- **predictionId**: UUID of the prediction record in database
- **userId**: Clerk user ID
- **personId**: UUID of the person being analyzed
- **type**: Either `"monthly"` or `"yearly"` (sent as `type` to n8n, not `analysisType`)
- **language**: Language code (default: `"zh"`)
- **person.birthdate**: Format `DD/MM/YYYY`
- **targetMonth**: Format `YYYY-MM` (monthly only)
- **targetYear**: Format `YYYY` (yearly only)
- **timezone**: Timezone string (monthly only)
- **lifeFocus**: Optional - `"career"` | `"finance"` | `"health"` | `"family"` | `"friend"` | `"team"`
- **currentConcern**: Optional - User's text input

---

## 2. Callback Endpoint (n8n → Backend)

### Endpoint
**URL:** `https://your-domain.com/api/n8n/prediction-result`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Required Headers
```
x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
```

### Callback Payload Structure

#### Monthly Prediction Result
```json
{
  "predictionId": "uuid-here",
  "userId": "user_xxx",
  "personId": "uuid-here",
  "type": "monthly",
  "targetMonth": "2026-01",
  
  "overview": "General overview of the month...",
  
  "luckyElements": {
    "colors": ["red", "gold", "blue"],
    "numbers": [3, 7, 9],
    "directions": ["north", "east"]
  },
  
  "career": {
    "forecast": "Career outlook for the month...",
    "score": 85,
    "advice": "Focus on networking..."
  },
  
  "finance": {
    "forecast": "Financial outlook...",
    "score": 75,
    "advice": "Be cautious with investments..."
  },
  
  "health": {
    "forecast": "Health outlook...",
    "score": 80,
    "advice": "Maintain regular exercise..."
  },
  
  "relationships": {
    "forecast": "Relationship outlook...",
    "score": 90,
    "advice": "Good time for communication..."
  },
  
  "family": {
    "forecast": "Family dynamics...",
    "score": 88,
    "advice": "Spend quality time..."
  },
  
  "monthlyHighlights": "Key highlights for this month...",
  
  "importantDates": [
    {
      "date": "2026-01-05",
      "event": "Favorable day for career decisions",
      "type": "positive"
    },
    {
      "date": "2026-01-15",
      "event": "Be cautious with finances",
      "type": "caution"
    }
  ],
  
  "weeklyBreakdown": {
    "week1": "First week outlook...",
    "week2": "Second week outlook...",
    "week3": "Third week outlook...",
    "week4": "Fourth week outlook..."
  },
  
  "challenges": [
    "Potential challenge 1...",
    "Potential challenge 2..."
  ],
  
  "opportunities": [
    "Opportunity 1...",
    "Opportunity 2..."
  ],
  
  "advice": "General advice for the month..."
}
```

#### Yearly Prediction Result
```json
{
  "predictionId": "uuid-here",
  "userId": "user_xxx",
  "personId": "uuid-here",
  "type": "yearly",
  "targetYear": "2026",
  
  "overview": "General overview of the year...",
  
  "luckyElements": {
    "colors": ["green", "white"],
    "numbers": [1, 6, 8],
    "directions": ["south", "west"]
  },
  
  "career": {
    "forecast": "Career outlook for the year...",
    "score": 82,
    "advice": "Focus on skill development..."
  },
  
  "finance": {
    "forecast": "Financial outlook...",
    "score": 78,
    "advice": "Plan long-term investments..."
  },
  
  "health": {
    "forecast": "Health outlook...",
    "score": 85,
    "advice": "Maintain healthy lifestyle..."
  },
  
  "relationships": {
    "forecast": "Relationship outlook...",
    "score": 88,
    "advice": "Year of growth in relationships..."
  },
  
  "family": {
    "forecast": "Family dynamics...",
    "score": 90,
    "advice": "Strong family bonds..."
  },
  
  "yearlyTheme": "Overall theme for 2026...",
  
  "quarterlyForecast": {
    "Q1": "First quarter outlook (Jan-Mar)...",
    "Q2": "Second quarter outlook (Apr-Jun)...",
    "Q3": "Third quarter outlook (Jul-Sep)...",
    "Q4": "Fourth quarter outlook (Oct-Dec)..."
  },
  
  "majorEvents": [
    {
      "period": "Q1 2026",
      "event": "Career breakthrough opportunity",
      "impact": "high"
    },
    {
      "period": "Q3 2026",
      "event": "Financial planning needed",
      "impact": "medium"
    }
  ],
  
  "annualGoals": "Recommended goals for the year...",
  
  "challenges": [
    "Annual challenge 1...",
    "Annual challenge 2..."
  ],
  
  "opportunities": [
    "Annual opportunity 1...",
    "Annual opportunity 2..."
  ],
  
  "advice": "General advice for the year..."
}
```

---

## 3. n8n Workflow Setup

### Step 1: Create Webhook Trigger
1. Add **Webhook** node
2. Set **HTTP Method**: POST
3. Set **Path**: `/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f`
4. **Authentication**: None (handled by shared secret on callback)

### Step 2: Process Prediction Request
1. Extract `type` field to determine monthly vs yearly
2. Extract person data and prediction parameters
3. Call your AI service (OpenAI, DeepSeek, etc.) with the data
4. Format the response according to the structure above

### Step 3: Send Results Back
1. Add **HTTP Request** node
2. **Method**: POST
3. **URL**: `https://your-domain.com/api/n8n/prediction-result`
4. **Headers**:
   ```json
   {
     "Content-Type": "application/json",
     "x-n8n-secret": "2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p"
   }
   ```
5. **Body**: JSON with prediction results

---

## 4. Testing

### Test Monthly Prediction
```bash
curl -X POST https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f \
  -H "Content-Type: application/json" \
  -d '{
    "predictionId": "test-uuid",
    "userId": "user_test",
    "personId": "person-uuid",
    "type": "monthly",
    "language": "zh",
    "person": {
      "name": "Test User",
      "birthdate": "15/03/1990",
      "birthtime": "14:30",
      "birthplace": "Kuala Lumpur",
      "gender": "male"
    },
    "targetMonth": "2026-01",
    "timezone": "Asia/Kuala_Lumpur"
  }'
```

### Test Yearly Prediction
```bash
curl -X POST https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f \
  -H "Content-Type: application/json" \
  -d '{
    "predictionId": "test-uuid",
    "userId": "user_test",
    "personId": "person-uuid",
    "type": "yearly",
    "language": "zh",
    "person": {
      "name": "Test User",
      "birthdate": "15/03/1990",
      "birthtime": "14:30",
      "birthplace": "Kuala Lumpur",
      "gender": "male"
    },
    "targetYear": "2026"
  }'
```

### Test Callback
```bash
curl -X POST https://your-domain.com/api/n8n/prediction-result \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p" \
  -d '{
    "predictionId": "test-uuid",
    "userId": "user_test",
    "personId": "person-uuid",
    "type": "monthly",
    "targetMonth": "2026-01",
    "overview": "Test overview...",
    "advice": "Test advice..."
  }'
```

---

## 5. Important Notes

1. **Single Webhook for Both Types**: Use the same webhook URL for both monthly and yearly predictions. Differentiate using the `type` field.

2. **Security**: The callback endpoint validates the `x-n8n-secret` header to ensure requests come from your n8n instance.

3. **Error Handling**: If n8n processing fails, the prediction record remains in `pending` status. Users can retry or delete it.

4. **Flexible Response**: The `result_data` field in the database is JSONB, so you can add additional fields as needed.

5. **Language Support**: Currently defaults to `"zh"` (Chinese) but can be changed per request.

---

## 6. Database Query Examples

### Find pending predictions
```sql
SELECT * FROM predictions 
WHERE result_data->>'status' = 'pending' 
ORDER BY created_at DESC;
```

### Find predictions for a specific month
```sql
SELECT * FROM predictions 
WHERE target_month = '2026-01' 
AND analysis_type = 'monthly';
```

### Find predictions for a specific year
```sql
SELECT * FROM predictions 
WHERE target_year = '2026' 
AND analysis_type = 'yearly';
```
