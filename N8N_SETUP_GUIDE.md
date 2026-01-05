# n8n Setup Guide for Destiny Analysis System

## Overview
This guide will help you set up n8n to process personal destiny analysis and send results back to your Next.js application.

---

## Step 1: Install n8n

### Option A: Using Docker (Recommended)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option B: Using npm
```bash
npm install -g n8n
n8n start
```

Access n8n at: `http://localhost:5678`

---

## Step 2: Create Personal Analysis Workflow

### Workflow Name: "Personal Destiny Analysis"

### Node 1: Webhook (Trigger)
1. Add **Webhook** node
2. Configure:
   - **HTTP Method**: POST
   - **Path**: `/webhook/personal-analysis`
   - **Response Mode**: Immediately
   - **Response Code**: 200

3. **Test URL**: `http://localhost:5678/webhook/personal-analysis`

### Node 2: Function - Parse Input Data
1. Add **Function** node
2. Name: "Parse Birth Data"
3. Code:
```javascript
// Extract data from webhook
const personId = $input.item.json.personId;
const userId = $input.item.json.userId;
const name = $input.item.json.name;
const birthInfo = $input.item.json.birthInfo;
const additionalInfo = $input.item.json.additionalInfo || "";
const familyZodiac = $input.item.json.familyZodiac || "";
const currentBusiness = $input.item.json.currentBusiness || "";

// Parse birth info
// Format: "born: 1980-09-02 22:10:00, male, tawau, sabah, malaysia"
const birthParts = birthInfo.split(',');
const birthDateTime = birthParts[0].replace('born: ', '').trim();
const gender = birthParts[1]?.trim() || 'unknown';
const location = birthParts.slice(2).join(',').trim();

return {
  personId,
  userId,
  name,
  birthDateTime,
  gender,
  location,
  additionalInfo,
  familyZodiac,
  currentBusiness,
  language: 'zh' // Default to Chinese, can be parameterized
};
```

### Node 3: HTTP Request - Call AI/Calculation Service
1. Add **HTTP Request** node
2. Name: "Calculate Destiny Analysis"
3. Configure:
   - **Method**: POST
   - **URL**: Your AI service endpoint (e.g., OpenAI, Claude, or custom service)
   - **Authentication**: Add your API key
   - **Body**:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional Chinese astrology and Zi Wei Dou Shu expert. Analyze the person's destiny based on their birth information and life events. Return analysis in the exact JSON format specified."
    },
    {
      "role": "user",
      "content": "Analyze this person:\nName: {{$node['Parse Birth Data'].json.name}}\nBirth: {{$node['Parse Birth Data'].json.birthDateTime}}\nGender: {{$node['Parse Birth Data'].json.gender}}\nLocation: {{$node['Parse Birth Data'].json.location}}\nLife Events: {{$node['Parse Birth Data'].json.additionalInfo}}\nFamily Zodiac: {{$node['Parse Birth Data'].json.familyZodiac}}\nCurrent Business: {{$node['Parse Birth Data'].json.currentBusiness}}\n\nProvide analysis in this exact JSON format:\n{\n  \"Overall Structure\": \"detailed analysis text\",\n  \"5 Element\": \"{\\\"wood\\\":4,\\\"fire\\\":3,\\\"earth\\\":3,\\\"metal\\\":4,\\\"water\\\":5}\",\n  \"Energy Chart\": \"energy distribution text\",\n  \"Major Luck Cycles\": \"[{\\\"ageRange\\\":\\\"12-22\\\",\\\"luckType\\\":\\\"比劫运\\\",\\\"keyEvents\\\":\\\"events\\\"}]\",\n  \"Career Direction\": \"{\\\"suitable\\\":[\\\"career1\\\"],\\\"unsuitable\\\":[\\\"career2\\\"]}\",\n  \"Risk Periods\": \"{\\\"major\\\":[\\\"2008-2012\\\"],\\\"secondary\\\":[\\\"1992-1995\\\"],\\\"risk_type\\\":[\\\"type\\\"]}\",\n  \"Future 5\": \"{\\\"wealth\\\":\\\"text\\\",\\\"career\\\":\\\"text\\\",\\\"relationship\\\":\\\"text\\\",\\\"health\\\":\\\"text\\\"}\",\n  \"Future 10\": \"{\\\"wealth\\\":\\\"text\\\",\\\"career\\\":\\\"text\\\",\\\"relationship\\\":\\\"text\\\",\\\"health\\\":\\\"text\\\"}\"\n}"
    }
  ]
}
```

### Node 4: Function - Format Response
1. Add **Function** node
2. Name: "Format for Next.js"
3. Code:
```javascript
// Get AI response
const aiResponse = $input.item.json.choices[0].message.content;

// Parse the JSON from AI response
let analysis;
try {
  analysis = JSON.parse(aiResponse);
} catch (e) {
  // If AI returned markdown code block, extract JSON
  const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    analysis = JSON.parse(jsonMatch[1]);
  } else {
    throw new Error('Failed to parse AI response');
  }
}

// Add metadata
analysis.personId = $node['Parse Birth Data'].json.personId;
analysis.userId = $node['Parse Birth Data'].json.userId;
analysis.language = $node['Parse Birth Data'].json.language;

// Return as array (Next.js endpoint expects array)
return [analysis];
```

### Node 5: HTTP Request - Send to Next.js
1. Add **HTTP Request** node
2. Name: "Send to Next.js"
3. Configure:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/n8n/personal-analysis`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body**: `{{ $json }}`
   - **Response Format**: JSON

---

## Step 3: Configure Environment Variables

In your Next.js `.env.local`:
```bash
# n8n webhook URL for personal analysis
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=http://localhost:5678/webhook/personal-analysis

# Your AI service API key
OPENAI_API_KEY=your_api_key_here
```

---

## Step 4: Test the Integration

### Test 1: Trigger from Next.js
1. Go to your app: `http://localhost:3000/dashboard/people`
2. Edit your self profile
3. Add personal information:
   - Life Events: "1992-1995 bullied, 1999-2000 study turning point"
   - Family Zodiac: "father tiger, mother rabbit, wife ox"
   - Current Business: "drink retail, software service"
4. Click "Update Person"
5. Go to Settings or Report page
6. Click "Re-analyze" button

### Test 2: Check n8n Execution
1. Go to n8n: `http://localhost:5678`
2. Click "Executions" in left sidebar
3. You should see a new execution
4. Click on it to see the flow
5. Check each node's output

### Test 3: Verify Database
```bash
psql $DATABASE_URL -c "SELECT * FROM personal_analysis ORDER BY analyzed_at DESC LIMIT 1;"
```

You should see the analysis data saved.

### Test 4: View in App
1. Go to `http://localhost:3000/dashboard/report`
2. You should see your analysis displayed in all tabs

---

## Step 5: Language Support

### To support multiple languages:

1. **In Next.js**: Add language parameter when triggering n8n
```typescript
// In /api/people/[id]/reanalyze/route.ts
body: JSON.stringify({
  personId: person.id,
  userId: userId,
  name: person.name,
  birthInfo: birthInfo,
  additionalInfo: person.additional_info || "",
  familyZodiac: person.family_zodiac || "",
  currentBusiness: person.current_business || "",
  language: 'zh' // or 'en', 'ms' based on user preference
}),
```

2. **In n8n**: Modify the AI prompt based on language
```javascript
// In "Parse Birth Data" node
const language = $input.item.json.language || 'zh';

let systemPrompt;
if (language === 'en') {
  systemPrompt = "You are a professional Chinese astrology expert. Provide analysis in English.";
} else if (language === 'ms') {
  systemPrompt = "You are a professional Chinese astrology expert. Provide analysis in Malay.";
} else {
  systemPrompt = "你是专业的中国占星术和紫微斗数专家。请用中文提供分析。";
}

return { ...data, systemPrompt, language };
```

---

## Receive Endpoint Details

### Endpoint: `POST /api/n8n/personal-analysis`

### Expected Input Format (from n8n):
```json
[
  {
    "personId": "uuid-here",
    "userId": "clerk-user-id",
    "language": "zh",
    "Overall Structure": "日主壬水，生于八月...",
    "5 Element": "{\"wood\":4,\"fire\":3,\"earth\":3,\"metal\":4,\"water\":5}",
    "Energy Chart": "五行能量分布\n\n水  ██████...",
    "Major Luck Cycles": "[{\"ageRange\":\"12-22\",\"luckType\":\"比劫运\",\"keyEvents\":\"...\"}]",
    "Career Direction": "{\"suitable\":[\"软件服务\"],\"unsuitable\":[\"黄金典当\"]}",
    "Risk Periods": "{\"major\":[\"2008-2012\"],\"secondary\":[\"1992-1995\"],\"risk_type\":[\"人际冲突\"]}",
    "Future 5": "{\"wealth\":\"2025-2030年财运整体良好...\",\"career\":\"...\",\"relationship\":\"...\",\"health\":\"...\"}",
    "Future 10": "{\"wealth\":\"2030年后财运趋于稳定...\",\"career\":\"...\",\"relationship\":\"...\",\"health\":\"...\"}"
  }
]
```

### What the Endpoint Does:
1. Receives array with analysis data
2. Parses JSON strings in fields
3. Saves to `personal_analysis` table
4. Returns success response

### Database Schema:
```sql
personal_analysis (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  overall_structure TEXT,
  five_elements JSONB,
  energy_chart TEXT,
  major_luck_cycles JSONB,
  career_direction JSONB,
  risk_periods JSONB,
  future_5 JSONB,
  future_10 JSONB,
  language VARCHAR(10),
  analyzed_at TIMESTAMP
)
```

---

## Troubleshooting

### Issue: n8n webhook not receiving data
**Solution**: Check that `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF` is correct and n8n is running.

### Issue: AI response format incorrect
**Solution**: Update the AI prompt to be more specific about JSON format. Add validation in n8n.

### Issue: Data not saving to database
**Solution**: Check n8n execution logs. Verify the HTTP request to Next.js succeeded. Check Next.js API logs.

### Issue: Language not working
**Solution**: Verify language parameter is passed through entire chain: Next.js → n8n → AI → Next.js → Database.

---

## Production Deployment

### 1. Deploy n8n
- Use n8n Cloud: https://n8n.io/cloud/
- Or self-host with Docker on your server

### 2. Update Webhook URL
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=https://your-n8n-instance.com/webhook/personal-analysis
```

### 3. Secure the Webhook
Add authentication header in n8n webhook node and verify in Next.js.

### 4. Set up Monitoring
- Enable n8n execution logging
- Set up alerts for failed executions
- Monitor API response times

---

## Summary

✅ **Receive Endpoint**: `POST /api/n8n/personal-analysis`
✅ **Webhook URL**: Set in `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF`
✅ **Data Format**: Array with analysis object containing JSON strings
✅ **Language Support**: Pass `language` parameter ('zh', 'en', 'ms')
✅ **Database**: Automatically saves to `personal_analysis` table

Your system is now ready to receive and process destiny analysis from n8n!
