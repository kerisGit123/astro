# n8n API Integration Guide

## Overview

This document describes the API endpoints and data flow between the ZiWei Path application and n8n workflows for chart calculations and compatibility analysis.

## Architecture

```
Next.js App → n8n Webhook (Trigger) → Chart Calculation → n8n Callback → Next.js API
```

## Environment Variables

Add these to your `.env.local`:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_SCAN_WEBHOOK_PATH=/webhook/chart-calculation
N8N_COMPATIBILITY_WEBHOOK_PATH=/webhook/compatibility-analysis

# Callback URL (your Next.js app URL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 1. Chart Calculation Workflow

### 1.1 Trigger Chart Calculation (Next.js → n8n)

**Endpoint:** `POST /api/charts/calculate`

**Purpose:** Triggers n8n workflow to calculate Zi Wei, Western, and Chinese Zodiac charts.

**Request Body:**
```json
{
  "personId": "uuid-of-person"
}
```

**What Next.js Does:**
1. Validates user authentication
2. Fetches person's birth data from database
3. Sends data to n8n webhook

**n8n Webhook URL:** `${N8N_BASE_URL}${N8N_SCAN_WEBHOOK_PATH}`

**Payload Sent to n8n:**
```json
{
  "personId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user_2abc123xyz",
  "name": "John Doe",
  "birthDate": "1990-05-15",
  "birthTime": "14:30:00",
  "birthLocation": "New York, USA",
  "gender": "male"
}
```

### 1.2 n8n Chart Calculation Workflow

**n8n Workflow Steps:**

1. **Webhook Trigger** - Receives person data
2. **Zi Wei Calculation Node** - Calculate 紫微斗數 chart
3. **Western Zodiac Node** - Calculate Western astrology chart
4. **Chinese Zodiac Node** - Calculate 生肖/五行 chart
5. **HTTP Request Node** - Send results back to Next.js

**Expected n8n Processing:**
- Parse birth date/time/location
- Calculate chart positions and houses
- Generate interpretation data
- Format as JSON

### 1.3 Receive Chart Results (n8n → Next.js)

**Endpoint:** `POST /api/n8n/chart-result`

**Purpose:** Receives calculated chart data from n8n and stores in database.

**Request Body (from n8n):**
```json
{
  "personId": "550e8400-e29b-41d4-a716-446655440000",
  "chartType": "ziwei",
  "chartData": {
    "palaces": {
      "life": {
        "stars": ["紫微", "天府"],
        "position": "子",
        "interpretation": "Strong leadership qualities..."
      },
      "wealth": {
        "stars": ["武曲", "天相"],
        "position": "丑",
        "interpretation": "Steady wealth accumulation..."
      }
    },
    "majorStars": ["紫微", "天府", "武曲"],
    "elements": {
      "metal": 2,
      "wood": 1,
      "water": 3,
      "fire": 1,
      "earth": 2
    },
    "summary": "Overall life direction analysis..."
  }
}
```

**Chart Types:**
- `"ziwei"` - 紫微斗數 (Zi Wei Dou Shu)
- `"western"` - Western Zodiac
- `"chinese"` - Chinese Zodiac (生肖/五行)

**Response:**
```json
{
  "success": true,
  "chart": {
    "id": "chart-uuid",
    "person_id": "person-uuid",
    "chart_type": "ziwei",
    "chart_data": { ... },
    "calculated_at": "2025-12-30T10:42:00Z"
  }
}
```

### 1.4 Retrieve Charts (Next.js Frontend)

**Endpoint:** `GET /api/charts/:personId`

**Purpose:** Fetch all calculated charts for a person.

**Response:**
```json
[
  {
    "id": "chart-uuid-1",
    "person_id": "person-uuid",
    "chart_type": "ziwei",
    "chart_data": { ... },
    "calculated_at": "2025-12-30T10:42:00Z"
  },
  {
    "id": "chart-uuid-2",
    "person_id": "person-uuid",
    "chart_type": "western",
    "chart_data": { ... },
    "calculated_at": "2025-12-30T10:42:05Z"
  },
  {
    "id": "chart-uuid-3",
    "person_id": "person-uuid",
    "chart_type": "chinese",
    "chart_data": { ... },
    "calculated_at": "2025-12-30T10:42:08Z"
  }
]
```

---

## 2. Compatibility Analysis Workflow

### 2.1 Trigger Compatibility Analysis (Next.js → n8n)

**Endpoint:** `POST /api/compatibility/analyze` (to be created)

**Purpose:** Analyzes compatibility between two people.

**Request Body:**
```json
{
  "personAId": "uuid-person-a",
  "personBId": "uuid-person-b",
  "analysisType": "love"
}
```

**Analysis Types:**
- `"love"` - Romantic compatibility
- `"business"` - Business partnership compatibility
- `"friendship"` - Friendship compatibility

**n8n Webhook URL:** `${N8N_BASE_URL}${N8N_COMPATIBILITY_WEBHOOK_PATH}`

**Payload Sent to n8n:**
```json
{
  "userId": "user_2abc123xyz",
  "personA": {
    "id": "uuid-a",
    "name": "John Doe",
    "birthDate": "1990-05-15",
    "birthTime": "14:30:00",
    "charts": {
      "ziwei": { ... },
      "western": { ... },
      "chinese": { ... }
    }
  },
  "personB": {
    "id": "uuid-b",
    "name": "Jane Smith",
    "birthDate": "1992-08-22",
    "birthTime": "09:15:00",
    "charts": { ... }
  },
  "analysisType": "love"
}
```

### 2.2 n8n Compatibility Workflow

**n8n Workflow Steps:**

1. **Webhook Trigger** - Receives two people's data
2. **Fetch Charts Node** - Get existing charts or calculate if missing
3. **Zi Wei Compatibility** - Analyze palace interactions
4. **Western Compatibility** - Analyze zodiac compatibility
5. **Chinese Compatibility** - Analyze 五行 (elements) harmony
6. **Synthesis Node** - Combine all analyses
7. **HTTP Request Node** - Send results back to Next.js

### 2.3 Receive Compatibility Results (n8n → Next.js)

**Endpoint:** `POST /api/n8n/compatibility-result` (to be created)

**Request Body (from n8n):**
```json
{
  "userId": "user_2abc123xyz",
  "personAId": "uuid-a",
  "personBId": "uuid-b",
  "analysisType": "love",
  "resultData": {
    "overallScore": 78,
    "compatibility": {
      "ziwei": {
        "score": 75,
        "strengths": [
          "Complementary palace positions",
          "Harmonious major stars"
        ],
        "challenges": [
          "Potential conflicts in wealth palace"
        ]
      },
      "western": {
        "score": 82,
        "strengths": [
          "Fire and Air signs create dynamic energy",
          "Venus-Mars favorable aspect"
        ],
        "challenges": [
          "Moon signs may clash occasionally"
        ]
      },
      "chinese": {
        "score": 76,
        "strengths": [
          "Wood and Water elements support growth",
          "Compatible zodiac animals"
        ],
        "challenges": [
          "Metal element needs balance"
        ]
      }
    },
    "summary": "Strong overall compatibility with good communication potential...",
    "recommendations": [
      "Focus on shared creative projects",
      "Be mindful of financial decision-making styles",
      "Regular communication prevents misunderstandings"
    ]
  }
}
```

---

## 3. n8n Workflow Configuration

### 3.1 Chart Calculation Workflow

**Workflow Name:** `Chart Calculation - ZiWei Path`

**Nodes:**

1. **Webhook** (Trigger)
   - Method: POST
   - Path: `/webhook/chart-calculation`
   - Response: Immediately return 200 OK

2. **Function: Parse Birth Data**
   - Extract and validate birth information
   - Calculate lunar calendar date (for Zi Wei)
   - Determine time pillar (时辰)

3. **HTTP Request: Zi Wei Calculation**
   - Call external Zi Wei calculation service (or custom logic)
   - Parse palace positions and stars

4. **HTTP Request: Western Calculation**
   - Calculate sun sign, moon sign, rising sign
   - Determine planetary positions

5. **HTTP Request: Chinese Zodiac**
   - Calculate animal sign and element
   - Determine 五行 balance

6. **Function: Format Results**
   - Structure data for each chart type

7. **HTTP Request: Send to Next.js** (3 parallel requests)
   - URL: `${NEXT_PUBLIC_APP_URL}/api/n8n/chart-result`
   - Method: POST
   - Body: Chart data for each type

### 3.2 Compatibility Analysis Workflow

**Workflow Name:** `Compatibility Analysis - ZiWei Path`

**Nodes:**

1. **Webhook** (Trigger)
   - Method: POST
   - Path: `/webhook/compatibility-analysis`

2. **Function: Fetch Charts**
   - Get charts for both people from database
   - Trigger calculation if missing

3. **Function: Zi Wei Compatibility**
   - Compare palace positions
   - Analyze star interactions
   - Calculate harmony score

4. **Function: Western Compatibility**
   - Synastry analysis
   - Element compatibility
   - Aspect patterns

5. **Function: Chinese Compatibility**
   - 五行 (element) harmony
   - Zodiac animal compatibility
   - Stem-branch interactions

6. **Function: Synthesize Results**
   - Combine all scores
   - Generate recommendations

7. **HTTP Request: Send to Next.js**
   - URL: `${NEXT_PUBLIC_APP_URL}/api/n8n/compatibility-result`
   - Method: POST
   - Body: Compatibility analysis

---

## 4. Implementation Checklist

### Next.js Application

- [x] `POST /api/charts/calculate` - Trigger chart calculation
- [x] `POST /api/n8n/chart-result` - Receive chart results
- [x] `GET /api/charts/:personId` - Retrieve charts
- [ ] `POST /api/compatibility/analyze` - Trigger compatibility analysis
- [ ] `POST /api/n8n/compatibility-result` - Receive compatibility results
- [ ] `GET /api/compatibility/:id` - Retrieve compatibility analysis

### n8n Workflows

- [ ] Install n8n (Docker or npm)
- [ ] Create "Chart Calculation" workflow
- [ ] Create "Compatibility Analysis" workflow
- [ ] Configure webhook URLs
- [ ] Test end-to-end flow
- [ ] Set up error handling and retries

### Database

- [x] `charts` table created
- [x] `compatibility_analyses` table created
- [x] Indexes configured
- [ ] Run migration: `migrations/001_clerk_subscription_schema.sql`

---

## 5. Testing the Integration

### Test Chart Calculation

```bash
# 1. Trigger calculation
curl -X POST http://localhost:3000/api/charts/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"personId": "YOUR_PERSON_UUID"}'

# 2. n8n processes and sends back results to /api/n8n/chart-result

# 3. Retrieve charts
curl http://localhost:3000/api/charts/YOUR_PERSON_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Compatibility Analysis

```bash
# 1. Trigger analysis
curl -X POST http://localhost:3000/api/compatibility/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "personAId": "UUID_A",
    "personBId": "UUID_B",
    "analysisType": "love"
  }'

# 2. n8n processes and sends back results

# 3. Retrieve analysis
curl http://localhost:3000/api/compatibility/ANALYSIS_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Error Handling

### n8n Webhook Failures

If n8n is unavailable:
- Next.js returns success but logs error
- User sees "Chart calculation in progress"
- Retry mechanism can be implemented

### Chart Calculation Errors

n8n should send error response:
```json
{
  "personId": "uuid",
  "chartType": "ziwei",
  "error": "Invalid birth time format",
  "success": false
}
```

### Callback Failures

If n8n cannot reach Next.js:
- n8n should retry with exponential backoff
- Store results temporarily in n8n database
- Manual retry endpoint for admins

---

## 7. Security Considerations

1. **Webhook Authentication**
   - Add API key validation in n8n webhooks
   - Verify requests from n8n using shared secret

2. **Rate Limiting**
   - Limit chart calculations per user per day
   - Prevent abuse of n8n resources

3. **Data Privacy**
   - n8n should not store personal data permanently
   - Clear sensitive data after processing

---

## 8. Example n8n Function Nodes

### Parse Birth Data (JavaScript)

```javascript
// In n8n Function node
const birthDate = $input.item.json.birthDate;
const birthTime = $input.item.json.birthTime;
const birthLocation = $input.item.json.birthLocation;

// Calculate lunar date for Zi Wei
function toLunarDate(solarDate) {
  // Implement solar-to-lunar conversion
  // This is a placeholder - use actual lunar calendar library
  return {
    year: 1990,
    month: 4,
    day: 21,
    leapMonth: false
  };
}

// Calculate time pillar (时辰)
function getTimePillar(time) {
  const hour = parseInt(time.split(':')[0]);
  const pillars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return pillars[Math.floor((hour + 1) / 2) % 12];
}

return {
  json: {
    personId: $input.item.json.personId,
    solar: {
      date: birthDate,
      time: birthTime
    },
    lunar: toLunarDate(birthDate),
    timePillar: getTimePillar(birthTime),
    location: birthLocation
  }
};
```

### Format Chart Results

```javascript
// In n8n Function node
const chartData = $input.item.json;

return {
  json: {
    personId: chartData.personId,
    chartType: 'ziwei',
    chartData: {
      palaces: chartData.palaces,
      majorStars: chartData.majorStars,
      elements: chartData.elements,
      summary: chartData.interpretation,
      calculatedAt: new Date().toISOString()
    }
  }
};
```

---

## 9. Future Enhancements

1. **Real-time Updates**
   - WebSocket connection for live chart updates
   - Progress indicators during calculation

2. **Batch Processing**
   - Calculate multiple people's charts at once
   - Bulk compatibility analysis

3. **Caching Strategy**
   - Cache common chart patterns
   - Reduce calculation time for similar birth data

4. **AI Integration**
   - Use AI to generate natural language interpretations
   - Personalized insights based on user history

---

## Summary

This integration allows ZiWei Path to offload complex astrological calculations to n8n workflows while maintaining a clean separation of concerns:

- **Next.js**: User interface, authentication, data storage
- **n8n**: Chart calculations, compatibility analysis, workflow automation
- **Database**: Persistent storage of users, people, charts, and analyses

The asynchronous webhook pattern ensures the UI remains responsive while calculations happen in the background.
