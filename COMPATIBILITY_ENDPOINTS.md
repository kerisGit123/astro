# Compatibility Analysis Endpoints

Complete documentation for all compatibility analysis types (love, business, work, family, friend).

---

## 🔄 Flow Overview

```
Frontend → Analyze API → n8n Webhook → AI Processing → Callback API → Database
```

---

## 📡 Endpoints

### 1. Trigger Analysis

**Endpoint:** `POST /api/compatibility/analyze`

**Purpose:** Start a new compatibility analysis

**Authentication:** Required (Clerk)

**Request Body:**
```json
{
  "personAId": "uuid",
  "personBId": "uuid",
  "language": "zh|en",
  "analysisType": "love|business|work|family|friend"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compatibility analysis triggered successfully",
  "compatibilityId": "uuid",
  "personAId": "uuid",
  "personBId": "uuid"
}
```

**What it does:**
1. Validates both people exist and belong to user
2. Creates a pending record in `compatibility_analyses` table
3. Sends webhook to n8n with person details
4. Returns immediately (analysis happens async)

---

### 2. n8n Callback (Receive Results)

**Endpoint:** `POST /api/n8n/love-analysis`

**Purpose:** Receive analysis results from n8n

**Authentication:** Shared secret header

**Headers:**
```
x-n8n-secret: your-shared-secret
```

**Request Body (from n8n):**

The endpoint accepts data in multiple formats and extracts from `body.output` if present.

#### Common Fields (All Types)
```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": { "name": "...", "birthdate": "..." },
  "personB": { "name": "...", "birthdate": "..." },
  "strengths": ["strength1", "strength2"],
  "longTermOutlook": "...",
  "advice": "...",
  "SelectedTopic": "...",
  "Question": "..."
}
```

#### Love-Specific Fields
```json
{
  "relationshipDynamics": "...",
  "marriagePotential": {
    "overallScore": 85,
    "emotionalConnection": "...",
    "communicationStyle": "...",
    "conflictResolution": "..."
  },
  "challenges": ["challenge1", "challenge2"]
}
```

#### Business-Specific Fields
```json
{
  "partnershipPotential": {
    "overallScore": 78,
    "financialSynergy": "...",
    "conflictManagement": "...",
    "longTermViability": "..."
  },
  "risks": ["risk1", "risk2"],
  "recommendedStructure": "..."
}
```

#### Work/Team-Specific Fields
```json
{
  "teamDynamics": "...",
  "collaborationStyle": "..."
}
```

#### Family-Specific Fields
```json
{
  "familyHarmony": "...",
  "generationalDynamics": "..."
}
```

#### Friend-Specific Fields
```json
{
  "friendshipCompatibility": "...",
  "socialDynamics": "..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": { ... }
}
```

**What it does:**
1. Validates shared secret
2. Extracts data from nested structure if needed
3. Finds compatibility record by ID or personId/userId
4. Updates record with all analysis results
5. Stores type-specific fields based on analysis type

---

### 3. List Analyses

**Endpoint:** `GET /api/compatibility/list`

**Purpose:** Get all compatibility analyses for user

**Authentication:** Required (Clerk)

**Query Parameters:**
- `personId` (optional): Filter by specific person

**Response:**
```json
[
  {
    "id": "uuid",
    "person_a_id": "uuid",
    "person_b_id": "uuid",
    "analysis_type": "business",
    "result_data": { ... },
    "created_at": "2026-01-01T...",
    "personA": {
      "id": "uuid",
      "name": "Person A",
      "birth_date": "1980-09-02"
    },
    "personB": {
      "id": "uuid",
      "name": "Person B",
      "birth_date": "1985-03-15"
    }
  }
]
```

---

### 4. Get Single Analysis

**Endpoint:** `GET /api/compatibility/[id]`

**Purpose:** Get detailed analysis by ID

**Authentication:** Required (Clerk)

**Response:**
```json
{
  "id": "uuid",
  "person_a_id": "uuid",
  "person_b_id": "uuid",
  "analysis_type": "business",
  "result_data": {
    "partnershipPotential": { ... },
    "strengths": [ ... ],
    "risks": [ ... ],
    ...
  },
  "created_at": "2026-01-01T...",
  "personA": { ... },
  "personB": { ... }
}
```

---

### 5. Create Share Link

**Endpoint:** `POST /api/compatibility/[id]/share`

**Purpose:** Generate shareable public link

**Authentication:** Required (Clerk)

**Response:**
```json
{
  "shareToken": "random-token",
  "shareUrl": "https://domain.com/shared/compatibility/token"
}
```

---

## 🗄️ Database Schema

### compatibility_analyses Table

```sql
CREATE TABLE compatibility_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  person_a_id UUID REFERENCES people(id) ON DELETE CASCADE,
  person_b_id UUID REFERENCES people(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,  -- 'love', 'business', 'work', 'family', 'friend'
  result_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### shared_compatibility_reports Table

```sql
CREATE TABLE shared_compatibility_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compatibility_id UUID REFERENCES compatibility_analyses(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_by_user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Environment Variables

```env
# n8n webhook URL for triggering analysis
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=https://your-n8n.com/webhook/compatibility

# Shared secret for n8n callbacks
N8N_CALLBACK_SHARED_SECRET=your-secret-here
```

---

## 📊 Analysis Types

| Type | analysisType | Primary Score Field | Icon |
|------|--------------|---------------------|------|
| Love & Romance | `love` | `marriagePotential.overallScore` | ❤️ |
| Business Partnership | `business` | `partnershipPotential.overallScore` | 💼 |
| Team Compatibility | `work` | `teamDynamics.overallScore` | 👥 |
| Family Harmony | `family` | `familyHarmony.overallScore` | 🏠 |
| Friendship Match | `friend` | `friendshipCompatibility.overallScore` | ⭐ |

---

## 🔄 Complete Business Analysis Example

### Step 1: Frontend triggers analysis

```javascript
const response = await fetch("/api/compatibility/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    personAId: "uuid-person-a",
    personBId: "uuid-person-b",
    language: "zh",
    analysisType: "business"
  })
})
```

### Step 2: Backend creates record and calls n8n

```javascript
// Creates pending record
INSERT INTO compatibility_analyses 
(user_id, person_a_id, person_b_id, analysis_type, result_data) 
VALUES ($1, $2, $3, 'business', '{"status":"pending"}')

// Sends to n8n
POST https://n8n.com/webhook/compatibility
{
  "type": "business",
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "language": "zh",
  "personA": { ... },
  "personB": { ... }
}
```

### Step 3: n8n processes and returns results

```javascript
POST /api/n8n/love-analysis
Headers: x-n8n-secret: secret
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "partnershipPotential": {
    "overallScore": 78,
    "financialSynergy": "...",
    "conflictManagement": "...",
    "longTermViability": "..."
  },
  "strengths": ["...", "..."],
  "risks": ["...", "..."],
  "recommendedStructure": "...",
  "longTermOutlook": "...",
  "advice": "...",
  "SelectedTopic": "商业合伙人匹配分析",
  "Question": "请从商业合作角度分析..."
}
```

### Step 4: Backend updates record

```javascript
UPDATE compatibility_analyses 
SET result_data = $1::jsonb,
    created_at = NOW()
WHERE id = $2
```

### Step 5: Frontend displays results

User can view on `/dashboard/compatibility-report?id=uuid`

---

## 🎯 Key Points

1. **Single endpoint for all types** - `/api/compatibility/analyze` handles all
2. **Type-specific fields** - Callback endpoint stores all fields regardless of type
3. **Flexible data structure** - JSONB allows different fields per type
4. **Unified UI** - Same page displays all types with type-specific rendering
5. **Async processing** - Analysis happens in background, results appear when ready

---

## 🐛 Troubleshooting

### Missing compatibilityId error
- Endpoint now has fallback to find by personId/userId
- Ensure n8n includes compatibilityId in response

### Wrong fields displayed
- Check `analysis_type` in database record
- Ensure n8n sends correct fields for the type

### Results not appearing
- Check n8n callback logs: `console.log('[Love Analysis]')`
- Verify shared secret matches
- Check database record was updated

---

## 📝 Notes

- The endpoint is named "love-analysis" but handles **all compatibility types**
- Consider renaming to `/api/n8n/compatibility-callback` for clarity
- All types use same database table with JSONB for flexibility
- Frontend determines which fields to display based on `analysis_type`
