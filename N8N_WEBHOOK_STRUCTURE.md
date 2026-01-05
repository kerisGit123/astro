# 📡 n8n Webhook Integration - Complete Structure

## 🔄 Data Flow Overview

```
Next.js App → n8n Webhook → AI Processing → n8n Callback → Next.js API → Database
```

---

## 📤 SENDING TO n8n (Trigger Analysis)

### Endpoint
**File:** `src/app/api/people/[id]/reanalyze/route.ts`

### When It's Called
- User clicks "Re-analyze Destiny Profile" in Settings
- Only works for "self" profiles (is_user_self = true)

### POST Request to n8n

**URL:** `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body Structure:**
```json
{
  "personId": "uuid-of-person",
  "userId": "clerk-user-id",
  "name": "tang shang wey",
  "birthInfo": "born: 02 September 1980 23:00, male, tawau, sabah, malaysia",
  "additionalInfo": "Life events and milestones...",
  "familyZodiac": "Family zodiac information...",
  "currentBusiness": "Current business details...",
  "language": "zh"
}
```

### Field Details

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `personId` | UUID | Database ID of the person | `"1716e5d0-285f-40bd-bf98-bb09d746a2d6"` |
| `userId` | String | Clerk authentication user ID | `"user_2abc123xyz"` |
| `name` | String | Full name of the person | `"tang shang wey"` |
| `birthInfo` | String | Formatted birth details | `"born: 02 September 1980 23:00, male, tawau, sabah, malaysia"` |
| `additionalInfo` | String | Life events, milestones | `""` (optional) |
| `familyZodiac` | String | Family zodiac information | `""` (optional) |
| `currentBusiness` | String | Current business details | `""` (optional) |
| `language` | String | Analysis language code | `"zh"`, `"en"`, `"ms"`, `"ja"` |

### Code Example
```typescript
const n8nResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    personId: person.id,
    userId: userId,
    name: person.name,
    birthInfo: birthInfo,
    additionalInfo: person.additional_info || "",
    familyZodiac: person.family_zodiac || "",
    currentBusiness: person.current_business || "",
    language: language,
  }),
})
```

---

## 📥 RECEIVING FROM n8n (Callback with Results)

### Endpoint
**File:** `src/app/api/n8n/personal-analysis/route.ts`

**URL:** `https://your-app.com/api/n8n/personal-analysis`

### Security
**Header Required:**
```
x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
```

Must match `process.env.N8N_CALLBACK_SHARED_SECRET`

### Expected Data Format from n8n

**Method:** `POST`

**Two Formats Supported:**

#### Format 1: Array Format (Recommended)
```json
[
  {
    "personId": "uuid-of-person",
    "userId": "clerk-user-id",
    "language": "zh",
    "Overall Structure": "此命八字日主乙木...",
    "5 Element": "{\"wood\":3,\"fire\":2,\"earth\":4,\"metal\":6,\"water\":3}",
    "Energy Chart": "木 (Wood): 3\n火 (Fire): 2\n土 (Earth): 4\n金 (Metal): 6\n水 (Water): 3",
    "Major Luck Cycles": "{\"current\":{\"age\":\"43-52\",\"element\":\"Fire\",\"description\":\"...\"},\"next\":{...}}",
    "Career Direction": "{\"strengths\":[\"...\"],\"recommendations\":[\"...\"]}",
    "Risk Periods": "{\"periods\":[{\"year\":2025,\"risk\":\"high\",\"description\":\"...\"}]}",
    "Future 5": "{\"year\":2025,\"prediction\":\"...\"}",
    "Future 10": "{\"year\":2030,\"prediction\":\"...\"}"
  }
]
```

#### Format 2: Object Format (Legacy)
```json
{
  "personId": "uuid-of-person",
  "userId": "clerk-user-id",
  "language": "zh",
  "overallStructure": "此命八字日主乙木...",
  "fiveElements": {"wood":3,"fire":2,"earth":4,"metal":6,"water":3},
  "energyChart": "木 (Wood): 3\n...",
  "majorLuckCycles": {...},
  "careerDirection": {...},
  "riskPeriods": {...},
  "future5Years": {...},
  "future10Years": {...}
}
```

---

## 🔍 Output Structure Parser

### Field Mapping

| n8n Field Name | Database Column | Type | Notes |
|----------------|----------------|------|-------|
| `personId` | `person_id` | UUID | **Required** - Links to people table |
| `userId` | N/A | String | For validation only |
| `language` | `language` | String | `zh`, `en`, `ms`, `ja` |
| `Overall Structure` | `overall_structure` | TEXT | Main analysis text |
| `5 Element` | `five_elements` | JSONB | **Must be valid JSON string** |
| `Energy Chart` | `energy_chart` | TEXT | ASCII/text representation |
| `Major Luck Cycles` | `major_luck_cycles` | JSONB | **Must be valid JSON string** |
| `Career Direction` | `career_direction` | JSONB | **Must be valid JSON string** |
| `Risk Periods` | `risk_periods` | JSONB | **Must be valid JSON string** |
| `Future 5` | `future_5` | JSONB | **Must be valid JSON string** |
| `Future 10` | `future_10` | JSONB | **Must be valid JSON string** |

### JSON Field Structures

#### 1. Five Elements (5 Element)
```json
{
  "wood": 3,
  "fire": 2,
  "earth": 4,
  "metal": 6,
  "water": 3
}
```

#### 2. Major Luck Cycles
```json
{
  "current": {
    "age": "43-52",
    "element": "Fire",
    "description": "Current period analysis..."
  },
  "next": {
    "age": "53-62",
    "element": "Earth",
    "description": "Next period analysis..."
  },
  "cycles": [
    {
      "age": "3-12",
      "element": "Water",
      "description": "..."
    }
  ]
}
```

#### 3. Career Direction
```json
{
  "strengths": [
    "Leadership abilities",
    "Strategic thinking"
  ],
  "recommendations": [
    "Consider management roles",
    "Develop communication skills"
  ],
  "suitableIndustries": [
    "Technology",
    "Finance"
  ]
}
```

#### 4. Risk Periods
```json
{
  "periods": [
    {
      "year": 2025,
      "risk": "high",
      "description": "Health concerns, financial caution needed"
    },
    {
      "year": 2026,
      "risk": "medium",
      "description": "Relationship challenges"
    }
  ]
}
```

#### 5. Future 5 / Future 10
```json
{
  "year": 2025,
  "prediction": "Career advancement opportunities...",
  "keyEvents": [
    "Job promotion",
    "Financial growth"
  ],
  "advice": "Focus on networking and skill development"
}
```

---

## 🔧 How the Parser Works

### Step 1: Detect Format
```typescript
if (Array.isArray(body) && body.length > 0) {
  // Array format from n8n
  const data = body[0]
  personId = data.personId
  overallStructure = data["Overall Structure"]
  fiveElements = safeJSONParse(data["5 Element"])
  // ...
} else {
  // Object format (legacy)
  personId = body.personId
  overallStructure = body.overallStructure
  // ...
}
```

### Step 2: Safe JSON Parsing
```typescript
const safeJSONParse = (value: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (e) {
      console.error('JSON parse error:', e, 'Value:', value)
      return value
    }
  }
  return value
}
```

### Step 3: Database Storage
```typescript
// All JSONB fields are stringified before insertion
await pool.query(
  `INSERT INTO personal_analysis (
    person_id,
    overall_structure,
    five_elements,
    energy_chart,
    major_luck_cycles,
    career_direction,
    risk_periods,
    future_5,
    future_10,
    language,
    analyzed_at
  ) VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10, NOW())`,
  [
    personId,
    overallStructure,
    JSON.stringify(fiveElements),      // ← Stringified
    energyChart,
    JSON.stringify(majorLuckCycles),   // ← Stringified
    JSON.stringify(careerDirection),   // ← Stringified
    JSON.stringify(riskPeriods),       // ← Stringified
    JSON.stringify(future5),           // ← Stringified
    JSON.stringify(future10),          // ← Stringified
    language,
  ]
)
```

---

## 🎯 n8n Workflow Configuration

### 1. Webhook Trigger Node
- **Method:** POST
- **Path:** `/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f`
- **Response:** Return data

### 2. AI Processing Node
Use the received data:
```javascript
const language = $json.language || 'zh';
const languageMap = {
  'zh': 'Chinese',
  'en': 'English',
  'ms': 'Malay',
  'ja': 'Japanese'
};

const prompt = `Generate a comprehensive destiny analysis in ${languageMap[language]} language for:
Name: ${$json.name}
Birth: ${$json.birthInfo}
Additional Info: ${$json.additionalInfo}
Family Zodiac: ${$json.familyZodiac}
Current Business: ${$json.currentBusiness}

Return analysis with these sections:
1. Overall Structure (in ${languageMap[language]})
2. 5 Element (JSON: {"wood":X,"fire":X,"earth":X,"metal":X,"water":X})
3. Energy Chart (text format)
4. Major Luck Cycles (JSON)
5. Career Direction (JSON)
6. Risk Periods (JSON)
7. Future 5 (JSON for next 5 years)
8. Future 10 (JSON for next 10 years)`;
```

### 3. HTTP Request Node (Callback)
- **Method:** POST
- **URL:** `https://your-app.com/api/n8n/personal-analysis`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "x-n8n-secret": "2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p"
  }
  ```
- **Body:**
  ```json
  [
    {
      "personId": "{{$json.personId}}",
      "userId": "{{$json.userId}}",
      "language": "{{$json.language}}",
      "Overall Structure": "{{$json.overallStructure}}",
      "5 Element": "{{$json.fiveElements}}",
      "Energy Chart": "{{$json.energyChart}}",
      "Major Luck Cycles": "{{$json.majorLuckCycles}}",
      "Career Direction": "{{$json.careerDirection}}",
      "Risk Periods": "{{$json.riskPeriods}}",
      "Future 5": "{{$json.future5}}",
      "Future 10": "{{$json.future10}}"
    }
  ]
  ```

---

## 🔐 Environment Variables

### Required in `.env.local`
```env
# n8n Webhook URL (for triggering analysis)
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f

# Shared Secret (for validating n8n callbacks)
N8N_CALLBACK_SHARED_SECRET=2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
```

---

## 🧪 Testing

### Test Trigger
```bash
curl -X POST http://localhost:3000/api/people/YOUR_PERSON_ID/reanalyze \
  -H "Content-Type: application/json" \
  -d '{"language": "zh"}'
```

### Test Callback (Simulate n8n)
```bash
curl -X POST http://localhost:3000/api/n8n/personal-analysis \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p" \
  -d '[{
    "personId": "YOUR_PERSON_ID",
    "userId": "YOUR_USER_ID",
    "language": "zh",
    "Overall Structure": "Test analysis",
    "5 Element": "{\"wood\":3,\"fire\":2,\"earth\":4,\"metal\":6,\"water\":3}",
    "Energy Chart": "Test chart",
    "Major Luck Cycles": "{}",
    "Career Direction": "{}",
    "Risk Periods": "{}",
    "Future 5": "{}",
    "Future 10": "{}"
  }]'
```

---

## 📝 Summary

**Sending to n8n:**
- Endpoint: `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF`
- Includes: `personId`, `userId`, `name`, `birthInfo`, `language`
- Triggered by: Re-analyze button in Settings

**Receiving from n8n:**
- Endpoint: `/api/n8n/personal-analysis`
- Security: `x-n8n-secret` header required
- Format: Array with analysis results
- All JSON fields must be valid JSON strings
- Automatically parses and stores in database

**Key Fields:**
- `personId` - Links everything together
- `userId` - For validation
- `language` - Determines AI output language
- All JSONB fields - Must be valid JSON strings
