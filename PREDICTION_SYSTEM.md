# Prediction System Documentation

## Overview
The prediction system allows users to get monthly and yearly fortune/luck predictions for individuals based on their birth chart data.

---

## Database Schema

### Table: `predictions`

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  person_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- 'monthly' or 'yearly'
  target_month TEXT,           -- 'YYYY-MM' for monthly
  target_year TEXT,            -- 'YYYY' for yearly
  life_focus TEXT,             -- optional: 'family' | 'team' | 'friend' | 'career' | 'finance' | 'health'
  current_concern TEXT,        -- optional user concern
  language TEXT DEFAULT 'zh',
  result_data JSONB NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Unique Constraints:**
- Monthly: `(user_id, person_id, target_month, analysis_type)`
- Yearly: `(user_id, person_id, target_year, analysis_type)`

---

## API Endpoints

### 1. Trigger Prediction Analysis

**POST** `/api/predictions/analyze`

**Request Body:**
```json
{
  "personId": "uuid",
  "analysisType": "monthly",  // or "yearly"
  "targetMonth": "2026-01",   // required for monthly
  "targetYear": "2026",       // required for yearly
  "lifeFocus": "career",      // optional
  "currentConcern": "...",    // optional
  "language": "zh"            // optional, default: 'zh'
}
```

**Response:**
```json
{
  "success": true,
  "predictionId": "uuid",
  "message": "Monthly prediction analysis started"
}
```

---

### 2. n8n Callback Endpoint

**POST** `/api/n8n/prediction-result`

**Headers:**
```
x-n8n-secret: <N8N_CALLBACK_SHARED_SECRET>
```

**Request Body from n8n:**
```json
{
  "predictionId": "uuid",
  "analysisType": "monthly",
  
  // Common fields
  "overview": "Overall prediction summary",
  "luckyElements": {
    "colors": ["red", "gold"],
    "numbers": [3, 8],
    "directions": ["east", "south"]
  },
  "challenges": ["Challenge 1", "Challenge 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "advice": "General advice text",
  
  // Focus areas
  "career": {
    "forecast": "Career outlook",
    "score": 85,
    "advice": "Career advice"
  },
  "finance": {
    "forecast": "Financial outlook",
    "score": 78,
    "advice": "Financial advice"
  },
  "health": {
    "forecast": "Health outlook",
    "score": 90,
    "advice": "Health advice"
  },
  "relationships": {
    "forecast": "Relationship outlook",
    "score": 82,
    "advice": "Relationship advice"
  },
  "family": {
    "forecast": "Family outlook",
    "score": 88,
    "advice": "Family advice"
  },
  
  // Monthly specific
  "monthlyHighlights": "Key events for the month",
  "importantDates": [
    {
      "date": "2026-01-15",
      "event": "Lucky day for career",
      "type": "positive"
    }
  ],
  "weeklyBreakdown": {
    "week1": "First week forecast",
    "week2": "Second week forecast",
    "week3": "Third week forecast",
    "week4": "Fourth week forecast"
  },
  
  // Yearly specific
  "yearlyTheme": "Main theme for the year",
  "quarterlyForecast": {
    "Q1": "First quarter outlook",
    "Q2": "Second quarter outlook",
    "Q3": "Third quarter outlook",
    "Q4": "Fourth quarter outlook"
  },
  "majorEvents": [
    {
      "period": "March-April",
      "event": "Career breakthrough opportunity",
      "impact": "high"
    }
  ],
  "annualGoals": "Recommended goals for the year"
}
```

---

### 3. List Predictions

**GET** `/api/predictions/list?analysisType=monthly&personId=uuid`

**Query Parameters:**
- `analysisType` (optional): Filter by 'monthly' or 'yearly'
- `personId` (optional): Filter by person

**Response:**
```json
[
  {
    "id": "uuid",
    "analysis_type": "monthly",
    "target_month": "2026-01",
    "target_year": null,
    "life_focus": "career",
    "result_data": { ... },
    "person": {
      "id": "uuid",
      "name": "John Doe",
      "birth_date": "1990-01-15"
    },
    "created_at": "2026-01-01T10:00:00Z"
  }
]
```

---

### 4. Get Single Prediction

**GET** `/api/predictions/[id]`

**Response:**
```json
{
  "id": "uuid",
  "user_id": "user_xxx",
  "person_id": "uuid",
  "analysis_type": "monthly",
  "target_month": "2026-01",
  "life_focus": "career",
  "current_concern": "Job change",
  "language": "zh",
  "result_data": { ... },
  "person": {
    "id": "uuid",
    "name": "John Doe",
    "birth_date": "1990-01-15",
    "gender": "male"
  },
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:05:00Z"
}
```

---

### 5. Delete Prediction

**DELETE** `/api/predictions/[id]/delete`

**Response:**
```json
{
  "success": true,
  "message": "Prediction deleted successfully"
}
```

---

## n8n Workflow Setup

### 1. Webhook Trigger Node

**URL:** Set in environment variable `N8N_PREDICTION_WEBHOOK_URL`

**Receives:**
```json
{
  "predictionId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "analysisType": "monthly",
  "language": "zh",
  "person": {
    "name": "John Doe",
    "birthdate": "15/01/1990",
    "birthtime": "14:30",
    "birthplace": "Kuala Lumpur",
    "gender": "male"
  },
  "targetMonth": "2026-01",
  "timezone": "Asia/Kuala_Lumpur",
  "lifeFocus": "career",
  "currentConcern": "Considering job change"
}
```

### 2. AI Analysis Node

Process the data and generate predictions based on:
- Birth chart analysis
- Current time period (month/year)
- Life focus area
- User concerns

### 3. HTTP Request Node (Callback)

**Method:** POST  
**URL:** `https://yourdomain.com/api/n8n/prediction-result`  
**Headers:**
```
x-n8n-secret: <N8N_CALLBACK_SHARED_SECRET>
```

**Body:** Send the prediction results as shown in the callback endpoint section above.

---

## Environment Variables

Add to `.env.local`:

```bash
# n8n Prediction Webhook
N8N_PREDICTION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/prediction

# Shared secret for n8n callbacks (same as compatibility)
N8N_CALLBACK_SHARED_SECRET=your-secret-key-here
```

---

## Frontend Integration

### Pages Created

#### 1. Monthly Prediction Page
**Path:** `/dashboard/monthly-prediction`  
**File:** `src/app/dashboard/monthly-prediction/page.tsx`

**Features:**
- Person selection dropdown (fetches from `/api/people/list`)
- Month picker (HTML5 month input, defaults to current month)
- Optional life focus selector (career, finance, health, family, friend, team)
- Optional current concern textarea
- "Get Monthly Prediction" button triggers analysis
- Loading state with spinner
- Previous predictions list showing:
  - Person name and target month
  - Creation date and life focus
  - Status indicator (pending/completed)
  - View and Delete actions
- Real-time status updates
- Toast notifications for success/error states

#### 2. Yearly Prediction Page
**Path:** `/dashboard/yearly-prediction`  
**File:** `src/app/dashboard/yearly-prediction/page.tsx`

**Features:**
- Person selection dropdown
- Year selector (dropdown with current year ± 5 to +10 range)
- Optional life focus selector
- Optional current concern textarea
- "Get Yearly Prediction" button
- Loading state with spinner
- Previous predictions list showing:
  - Person name and target year
  - Creation date and life focus
  - Status indicator
  - View and Delete actions
- Toast notifications

#### 3. Prediction Report Page
**Path:** `/dashboard/prediction-report`  
**File:** `src/app/dashboard/prediction-report/page.tsx`

**Features:**
- Dynamic report display based on analysis type (monthly/yearly)
- Sections displayed:
  - **Header:** Person name, period, life focus badge
  - **Overview:** General prediction summary
  - **Lucky Elements:** Colors, numbers, directions with badges
  - **Focus Areas:** Career, Finance, Health, Relationships, Family (with scores and advice)
  - **Monthly Specific:**
    - Monthly highlights
    - Important dates with type badges
    - Weekly breakdown (week 1-4)
  - **Yearly Specific:**
    - Yearly theme
    - Quarterly forecast (Q1-Q4)
    - Major events with impact badges
    - Annual goals
  - **Challenges & Opportunities:** Side-by-side display with color coding
  - **General Advice:** Overall recommendations
- Back button navigation
- Loading and error states
- Responsive grid layout

### UI Components Used
- shadcn/ui components: Card, Button, Select, Input, Textarea, Badge
- Lucide React icons: Calendar, Sparkles, TrendingUp, Users, etc.
- Sonner toast notifications
- Responsive grid layouts (md:grid-cols-2)

### State Management
- React useState for local state
- useEffect for data fetching
- useRouter for navigation
- useSearchParams for URL parameters

### API Integration
All pages integrate with the backend APIs:
- `POST /api/predictions/analyze` - Trigger new prediction
- `GET /api/predictions/list?analysisType=monthly|yearly` - Fetch predictions
- `GET /api/predictions/[id]` - Fetch single prediction
- `DELETE /api/predictions/[id]/delete` - Delete prediction

---

## Data Flow

1. **User triggers prediction** → Frontend calls `/api/predictions/analyze`
2. **Backend creates pending record** → Saves to `predictions` table
3. **Backend sends to n8n** → Webhook with person data + prediction params
4. **n8n processes** → AI analysis based on birth chart + time period
5. **n8n sends results back** → POST to `/api/n8n/prediction-result`
6. **Backend updates record** → Saves results to `predictions` table
7. **Frontend polls/refreshes** → Shows completed prediction

---

## Example Use Cases

### Monthly Prediction
- "What's my luck for January 2026?"
- "Career focus for next month"
- "Health outlook for February"

### Yearly Prediction
- "What's my fortune for 2026?"
- "Career prospects for the year"
- "Financial outlook for 2026"

---

## Migration Instructions

1. Run the migration:
   ```bash
   psql -h <host> -U <user> -d <database> -f migrations/005_add_predictions_table.sql
   ```

2. Add environment variables to `.env.local`

3. Configure n8n webhook URL

4. Test with API endpoints

---

## Notes

- Predictions are unique per (user, person, period, type)
- Re-analyzing updates the existing prediction
- Results stored as JSONB for flexibility
- Supports multiple life focus areas
- Language-aware (default: Chinese)
