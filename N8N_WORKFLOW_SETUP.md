# n8n Workflow Setup Guide

## Overview

This guide walks you through setting up n8n workflows for ZiWei Path chart calculations and compatibility analysis.

---

## Prerequisites

- n8n installed (Docker or npm)
- Access to your Next.js application URL
- Basic understanding of n8n workflow concepts

---

## Installation Options

### Option 1: Docker (Recommended)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option 2: npm

```bash
npm install -g n8n
n8n start
```

Access n8n at: `http://localhost:5678`

---

## Environment Configuration

Add these to your Next.js `.env.local`:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_SCAN_WEBHOOK_PATH=/webhook/chart-calculation
N8N_COMPATIBILITY_WEBHOOK_PATH=/webhook/compatibility-analysis

# Your Next.js callback URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Workflow 1: Chart Calculation

### Workflow Overview

**Purpose:** Calculate Zi Wei, Western, and Chinese Zodiac charts for a person.

**Trigger:** Webhook from Next.js when user completes onboarding or adds a person.

**Output:** Three separate chart results sent back to Next.js.

### Step-by-Step Setup

#### 1. Create New Workflow

1. Open n8n at `http://localhost:5678`
2. Click "New Workflow"
3. Name it: `Chart Calculation - ZiWei Path`

#### 2. Add Webhook Trigger

1. Add node: **Webhook**
2. Configure:
   - **HTTP Method:** POST
   - **Path:** `chart-calculation`
   - **Response Mode:** Immediately
   - **Response Code:** 200

3. Test URL will be: `http://localhost:5678/webhook/chart-calculation`

#### 3. Add Function Node: Parse Birth Data

Add a **Function** node after the webhook:

```javascript
// Parse and validate incoming data
const personId = $input.item.json.personId;
const userId = $input.item.json.userId;
const name = $input.item.json.name;
const birthDate = $input.item.json.birthDate;
const birthTime = $input.item.json.birthTime;
const birthLocation = $input.item.json.birthLocation;
const gender = $input.item.json.gender;

// Validate required fields
if (!personId || !birthDate) {
  throw new Error('Missing required fields: personId and birthDate');
}

// Parse birth date
const [year, month, day] = birthDate.split('-').map(Number);

// Calculate time pillar (时辰) from birth time
function getTimePillar(timeString) {
  if (!timeString) return null;
  
  const hour = parseInt(timeString.split(':')[0]);
  const pillars = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // Each pillar covers 2 hours, starting from 23:00-01:00 (子)
  let pillarIndex;
  if (hour === 23) {
    pillarIndex = 0; // 子
  } else {
    pillarIndex = Math.floor((hour + 1) / 2);
  }
  
  return pillars[pillarIndex];
}

// Calculate Chinese Zodiac animal
function getChineseZodiac(year) {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                   'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  // 1900 was Year of the Rat
  const index = (year - 1900) % 12;
  return animals[index < 0 ? index + 12 : index];
}

// Calculate Western Zodiac sign
function getWesternZodiac(month, day) {
  const signs = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];
  
  for (const { sign, start, end } of signs) {
    if ((month === start[0] && day >= start[1]) || 
        (month === end[0] && day <= end[1])) {
      return sign;
    }
  }
  return 'Capricorn'; // Default
}

return {
  json: {
    personId,
    userId,
    name,
    birthData: {
      year,
      month,
      day,
      time: birthTime,
      location: birthLocation,
      gender
    },
    timePillar: getTimePillar(birthTime),
    chineseZodiac: getChineseZodiac(year),
    westernZodiac: getWesternZodiac(month, day)
  }
};
```

#### 4. Add Function Node: Calculate Zi Wei Chart (Stub)

Add a **Function** node for Zi Wei calculation:

```javascript
// STUB: Zi Wei Dou Shu calculation
// In production, this would call an actual Zi Wei calculation library or API

const data = $input.item.json;

// Placeholder calculation - replace with actual Zi Wei logic
const ziweiChart = {
  personId: data.personId,
  chartType: 'ziwei',
  chartData: {
    palaces: {
      life: {
        position: '子',
        stars: ['紫微', '天府'],
        interpretation: 'Strong leadership qualities and natural authority. Emperor archetype with noble bearing.'
      },
      wealth: {
        position: '丑',
        stars: ['武曲', '天相'],
        interpretation: 'Steady wealth accumulation through hard work. Financial stability in middle age.'
      },
      career: {
        position: '寅',
        stars: ['天机', '太阴'],
        interpretation: 'Intellectual pursuits and strategic thinking. Success in planning and analysis.'
      },
      relationships: {
        position: '卯',
        stars: ['天同', '巨门'],
        interpretation: 'Harmonious relationships with occasional communication challenges.'
      }
    },
    majorStars: ['紫微', '天府', '武曲', '天机'],
    elements: {
      metal: 2,
      wood: 1,
      water: 3,
      fire: 1,
      earth: 2
    },
    luckyPeriods: [
      { age: '24-33', focus: 'Career foundation', luck: 'High' },
      { age: '34-43', focus: 'Wealth accumulation', luck: 'Very High' }
    ],
    summary: `Based on birth data, this person has ${data.chineseZodiac} characteristics with strong leadership potential. The presence of 紫微 (Purple Star) indicates natural authority and noble bearing.`
  }
};

return { json: ziweiChart };
```

#### 5. Add Function Node: Calculate Western Chart (Stub)

Add a **Function** node for Western astrology:

```javascript
// STUB: Western Astrology calculation
// In production, integrate with an ephemeris library

const data = $input.item.json;

const westernChart = {
  personId: data.personId,
  chartType: 'western',
  chartData: {
    sunSign: data.westernZodiac,
    moonSign: 'Cancer', // Placeholder - needs actual calculation
    risingSign: 'Virgo', // Placeholder - needs birth time and location
    planets: {
      mercury: { sign: 'Gemini', house: 3, interpretation: 'Quick thinking and communication skills' },
      venus: { sign: 'Taurus', house: 2, interpretation: 'Values stability and material comfort' },
      mars: { sign: 'Aries', house: 1, interpretation: 'Direct action and assertive energy' }
    },
    houses: {
      first: 'Virgo',
      second: 'Libra',
      tenth: 'Gemini'
    },
    aspects: [
      { planets: ['Sun', 'Moon'], aspect: 'Trine', interpretation: 'Harmonious emotional expression' },
      { planets: ['Venus', 'Mars'], aspect: 'Square', interpretation: 'Tension between desires and actions' }
    ],
    summary: `${data.westernZodiac} Sun with strong emphasis on communication and analytical thinking. Practical approach to life with attention to detail.`
  }
};

return { json: westernChart };
```

#### 6. Add Function Node: Calculate Chinese Zodiac Chart (Stub)

Add a **Function** node for Chinese Zodiac:

```javascript
// STUB: Chinese Zodiac and Five Elements calculation

const data = $input.item.json;

// Calculate Five Elements balance (simplified)
function calculateElements(year) {
  const heavenlyStem = year % 10;
  const elements = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];
  return elements[heavenlyStem];
}

const chineseChart = {
  personId: data.personId,
  chartType: 'chinese',
  chartData: {
    zodiacAnimal: data.chineseZodiac,
    element: calculateElements(data.birthData.year),
    yinYang: data.birthData.year % 2 === 0 ? 'Yang' : 'Yin',
    characteristics: {
      personality: `${data.chineseZodiac} individuals are known for their unique traits and strengths.`,
      strengths: ['Intelligent', 'Adaptable', 'Resourceful'],
      challenges: ['Can be overly cautious', 'May overthink situations'],
      luckyColors: ['Blue', 'Gold', 'Green'],
      luckyNumbers: [2, 3, 8]
    },
    compatibility: {
      best: ['Dragon', 'Monkey', 'Ox'],
      challenging: ['Horse', 'Rooster']
    },
    fiveElements: {
      metal: 2,
      wood: 2,
      water: 2,
      fire: 2,
      earth: 2
    },
    summary: `${data.chineseZodiac} with ${calculateElements(data.birthData.year)} element. Balanced five elements suggest harmonious life flow.`
  }
};

return { json: chineseChart };
```

#### 7. Add HTTP Request Nodes: Send Results to Next.js

Add **three HTTP Request nodes** (one for each chart type):

**Configuration for each:**
- **Method:** POST
- **URL:** `{{$env.NEXT_PUBLIC_APP_URL}}/api/n8n/chart-result`
- **Authentication:** None (add API key in production)
- **Body Content Type:** JSON
- **Body:** `{{ $json }}`

Connect each calculation node to its own HTTP Request node.

#### 8. Test the Workflow

1. Click "Execute Workflow"
2. Send test data from your Next.js app or use curl:

```bash
curl -X POST http://localhost:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "test-uuid",
    "userId": "test-user",
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30:00",
    "birthLocation": "New York, USA",
    "gender": "male"
  }'
```

3. Check n8n execution log
4. Verify data arrives at `/api/n8n/chart-result`

---

## Workflow 2: Compatibility Analysis (Future)

### Workflow Overview

**Purpose:** Analyze compatibility between two people across all three systems.

**Trigger:** Webhook from Next.js when user requests compatibility analysis.

**Output:** Comprehensive compatibility report with scores and recommendations.

### Quick Setup (Stub)

1. Create new workflow: `Compatibility Analysis - ZiWei Path`
2. Add Webhook trigger with path: `compatibility-analysis`
3. Add Function node to fetch both people's charts
4. Add Function nodes for:
   - Zi Wei compatibility (palace interactions)
   - Western compatibility (synastry analysis)
   - Chinese compatibility (element harmony)
5. Add Function node to synthesize results
6. Add HTTP Request to send back to `/api/n8n/compatibility-result`

---

## Production Considerations

### 1. Security

**Add API Key Authentication:**

In n8n HTTP Request nodes, add header:
```
X-API-Key: your-secret-key
```

Validate in Next.js `/api/n8n/chart-result`:
```typescript
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.N8N_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Error Handling

Add **Error Trigger** nodes to handle failures:
- Log errors to database
- Send notification to admin
- Retry failed calculations

### 3. Rate Limiting

Implement rate limiting in n8n:
- Limit calculations per user per day
- Queue requests during high load
- Use n8n's built-in rate limiter

### 4. Real Calculation Libraries

Replace stub functions with actual libraries:

**Zi Wei Dou Shu:**
- Research existing Zi Wei calculation libraries
- Or implement based on traditional texts
- Consider consulting with Zi Wei experts

**Western Astrology:**
- Use Swiss Ephemeris library
- Integrate with astrology APIs
- Calculate houses using birth time and location

**Chinese Zodiac:**
- Implement Four Pillars (Ba Zi) calculation
- Use lunar calendar conversion libraries
- Calculate element interactions

### 5. Caching Strategy

Implement caching in n8n:
- Cache common birth date calculations
- Store intermediate results
- Reduce redundant calculations

### 6. Monitoring

Set up monitoring:
- Track workflow execution times
- Monitor success/failure rates
- Alert on errors or slowdowns

---

## Testing Checklist

- [ ] Webhook receives data correctly
- [ ] Birth data parsing works
- [ ] All three chart types calculate
- [ ] Results sent back to Next.js successfully
- [ ] Data stored in database correctly
- [ ] Error handling works for invalid data
- [ ] Performance is acceptable (< 5 seconds)

---

## Troubleshooting

### Webhook not receiving data

**Check:**
- n8n is running on correct port
- Webhook path matches environment variable
- Firewall allows connections
- Next.js can reach n8n URL

### Charts not appearing in database

**Check:**
- HTTP Request URL is correct
- Next.js `/api/n8n/chart-result` endpoint is working
- Database connection is active
- Check n8n execution logs for errors

### Slow calculations

**Solutions:**
- Optimize calculation functions
- Add caching for common patterns
- Use async processing
- Scale n8n horizontally

---

## Next Steps

1. **Implement Real Calculations**
   - Research and integrate actual Zi Wei calculation logic
   - Use ephemeris for Western astrology
   - Implement proper Ba Zi calculations

2. **Build Compatibility Workflow**
   - Create compatibility analysis workflow
   - Implement synastry calculations
   - Generate actionable recommendations

3. **Add AI Interpretation Layer**
   - Use GPT-4 to generate natural language interpretations
   - Personalize insights based on user history
   - Create narrative reports

4. **Optimize Performance**
   - Profile slow calculations
   - Implement caching strategy
   - Consider pre-calculating common patterns

5. **Production Deployment**
   - Deploy n8n to production server
   - Set up SSL certificates
   - Configure monitoring and alerts
   - Implement backup strategy

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [Swiss Ephemeris](https://www.astro.com/swisseph/)
- [Zi Wei Dou Shu Resources](https://en.wikipedia.org/wiki/Zi_Wei_Dou_Shu)

---

## Support

For questions about n8n setup:
- Check n8n documentation
- Ask in n8n community forum
- Contact ZiWei Path development team

---

**Last Updated:** December 30, 2024
