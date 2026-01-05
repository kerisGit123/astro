# Personal Info Integration Guide

## Overview

This document explains how the personal info flow works with n8n for deep personal analysis.

---

## Data Flow

### 1. User Input (Onboarding/Profile Creation)

When a user creates their self profile, they provide:

**Required:**
- Name
- Birth Date

**Optional:**
- Birth Time
- Birth Location
- Gender

**Personal Context (Optional):**
- **Additional Info**: Life events and milestones
  - Example: `"1992-1995 bullied, 1999-2000 study turning point, 2008-2012 software tough, 2014 BTC, 2017 married, 2018 son, 2020 covid biz ok, 2024 grandma passed, 2025 new drink company"`
  
- **Family Zodiac**: Family members' zodiac animals
  - Example: `"father tiger, mother rabbit, wife ox, son dog, brother dog"`
  
- **Current Business**: Current business ventures or career
  - Example: `"drink retail, software service, gold pawnshop"`

---

## Database Schema

### People Table (Updated)

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY,
  created_by_user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  birth_timezone TEXT,
  gender TEXT,
  is_user_self BOOLEAN DEFAULT false,
  
  -- New personal info fields
  additional_info TEXT,
  family_zodiac TEXT,
  current_business TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Personal Analysis Table (New)

```sql
CREATE TABLE personal_analysis (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id) UNIQUE,
  overall_structure TEXT,
  five_elements JSONB,
  energy_chart TEXT,
  major_luck_cycles JSONB,
  career_direction JSONB,
  risk_periods JSONB,
  future_5_years JSONB,
  future_10_years JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### 1. Create Person (Trigger n8n)

**Endpoint:** `POST /api/people`

**Request Body:**
```json
{
  "name": "John Doe",
  "birthDate": "1980-09-02",
  "birthTime": "22:10:00",
  "birthLocation": "Tawau Sabah Malaysia",
  "gender": "male",
  "isUserSelf": true,
  "additionalInfo": "1992-1995 bullied, 1999-2000 study turning point, 2008-2012 software tough, 2014 BTC, 2017 married, 2018 son, 2020 covid biz ok, 2024 grandma passed, 2025 new drink company",
  "familyZodiac": "father tiger, mother rabbit, wife ox, son dog, brother dog",
  "currentBusiness": "drink retail, software service, gold pawnshop"
}
```

**What Happens:**
1. Person record created in database with all fields
2. Relationship created with `type = 'self'`
3. User's `onboarding_completed = true`
4. **n8n webhook triggered** with formatted data

**n8n Webhook Payload:**
```json
{
  "personId": "uuid-here",
  "userId": "clerk-user-id",
  "name": "John Doe",
  "birthInfo": "born: 1980-09-02 22:10:00, male, Tawau Sabah Malaysia",
  "additionalInfo": "1992-1995 bullied, 1999-2000 study turning point...",
  "familyZodiac": "father tiger, mother rabbit, wife ox, son dog, brother dog",
  "currentBusiness": "drink retail, software service, gold pawnshop"
}
```

**n8n Webhook URL:** `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF`

---

### 2. Receive n8n Analysis Results

**Endpoint:** `POST /api/n8n/personal-analysis`

**Request Body (from n8n):**
```json
[
  {
    "personId": "uuid-here",
    "Overall Structure": "日主壬水，生于八月，沙中藏水，日主偏弱...",
    "5 Element": "{\"wood\":4,\"fire\":3,\"earth\":3,\"metal\":4,\"water\":5}",
    "Energy Chart": "五行能量分布\n\n水  ██████      偏弱，日主所在\n木  ████...",
    "Major Luck Cycles": "[{\"ageRange\":\"12-22\",\"luckType\":\"比劫运\"...}]",
    "Career Direction": "{\"suitable\":[\"软件服务\",\"饮料零售\"...]}",
    "Risk Periods": "{\"major\":[\"2008-2012\",\"2024-2026\"]...}",
    "Future 5": "{\"wealth\":\"2025-2030年财运整体良好...\"}",
    "Future 10": "{\"wealth\":\"2030年后财运趋于稳定...\"}"
  }
]
```

**What Happens:**
1. Validates `personId` exists
2. Parses JSON string fields to objects
3. Inserts/updates `personal_analysis` table
4. Returns success response

---

### 3. Get Personal Analysis

**Endpoint:** `GET /api/personal-analysis/:personId`

**Response:**
```json
{
  "id": "uuid",
  "person_id": "uuid",
  "overall_structure": "日主壬水，生于八月...",
  "five_elements": {
    "wood": 4,
    "fire": 3,
    "earth": 3,
    "metal": 4,
    "water": 5
  },
  "energy_chart": "五行能量分布\n\n水  ██████...",
  "major_luck_cycles": [
    {
      "ageRange": "12-22",
      "luckType": "比劫运",
      "keyEvents": "1992-1995年受同辈压力..."
    }
  ],
  "career_direction": {
    "suitable": ["软件服务", "饮料零售", "信息技术"],
    "unsuitable": ["黄金典当", "传统制造业"]
  },
  "risk_periods": {
    "major": ["2008-2012", "2024-2026"],
    "secondary": ["1992-1995", "2017-2019"],
    "risk_type": ["人际冲突", "事业压力", "情感波动"]
  },
  "future_5_years": {
    "wealth": "2025-2030年财运整体良好...",
    "career": "适合调整事业结构...",
    "relationship": "婚姻稳定...",
    "health": "注意心脑血管..."
  },
  "future_10_years": {
    "wealth": "2030年后财运趋于稳定...",
    "career": "事业重心可从重资产...",
    "relationship": "家庭关系稳固...",
    "health": "持续关注慢性疾病..."
  },
  "analyzed_at": "2024-12-30T14:43:00Z"
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# n8n Personal Analysis Webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=https://n8n.srv1010007.hstgr.cloud/webhook/8d907582-8e00-4f56-9e0e-416800f1550f
```

---

## n8n Workflow Setup

### Webhook Configuration

1. **Webhook Node:**
   - Method: POST
   - Path: `/webhook/8d907582-8e00-4f56-9e0e-416800f1550f`
   - Response Mode: Immediately

2. **Expected Input:**
   ```json
   {
     "personId": "uuid",
     "userId": "clerk-id",
     "name": "John Doe",
     "birthInfo": "born: 02 September 1980 22:10, male, Tawau Sabah Malaysia",
     "additionalInfo": "1992-1995 bullied...",
     "familyZodiac": "father tiger...",
     "currentBusiness": "drink retail..."
   }
   ```

3. **Processing:**
   - Parse birth info
   - Analyze life events from `additionalInfo`
   - Consider family dynamics from `familyZodiac`
   - Tailor career advice based on `currentBusiness`
   - Generate comprehensive analysis

4. **Output to Next.js:**
   - HTTP Request to: `POST {NEXT_PUBLIC_APP_URL}/api/n8n/personal-analysis`
   - Body: Analysis results in specified format

---

## Migration Instructions

### Run Database Migration

```bash
psql $DATABASE_URL -f migrations/002_add_personal_info_fields.sql
```

This will:
- Add `additional_info`, `family_zodiac`, `current_business` columns to `people` table
- Create `personal_analysis` table
- Add necessary indexes

---

## UI Components

### Onboarding Form

Located: `src/app/onboarding/page.tsx`

**New Fields Added:**
1. **Life Events & Milestones**
   - Field: `additionalInfo`
   - Placeholder: "e.g., 1992-1995 bullied, 1999-2000 study turning point"
   
2. **Family Zodiac Animals**
   - Field: `familyZodiac`
   - Placeholder: "e.g., father tiger, mother rabbit, wife ox"
   
3. **Current Business/Career**
   - Field: `currentBusiness`
   - Placeholder: "e.g., drink retail, software service"

### Dashboard Display (Future)

Create a new page to display personal analysis:
- `src/app/dashboard/analysis/page.tsx`
- Show five elements chart
- Display luck cycles timeline
- List career recommendations
- Highlight risk periods
- Show future predictions

---

## Testing

### 1. Test Person Creation

```bash
curl -X POST http://localhost:3000/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "birthDate": "1980-09-02",
    "birthTime": "22:10:00",
    "birthLocation": "Tawau Sabah Malaysia",
    "gender": "male",
    "isUserSelf": true,
    "additionalInfo": "1992-1995 bullied, 1999-2000 study turning point",
    "familyZodiac": "father tiger, mother rabbit",
    "currentBusiness": "software service"
  }'
```

### 2. Test n8n Callback

```bash
curl -X POST http://localhost:3000/api/n8n/personal-analysis \
  -H "Content-Type: application/json" \
  -d '[{
    "personId": "your-person-uuid",
    "Overall Structure": "Test structure",
    "5 Element": "{\"wood\":4,\"fire\":3,\"earth\":3,\"metal\":4,\"water\":5}",
    "Energy Chart": "Test chart",
    "Major Luck Cycles": "[]",
    "Career Direction": "{}",
    "Risk Periods": "{}",
    "Future 5": "{}",
    "Future 10": "{}"
  }]'
```

### 3. Test Retrieval

```bash
curl http://localhost:3000/api/personal-analysis/your-person-uuid
```

---

## Summary

**Data Flow:**
1. User fills onboarding form → `POST /api/people`
2. Person created in DB with personal info
3. n8n webhook triggered with formatted data
4. n8n processes and analyzes
5. n8n sends results → `POST /api/n8n/personal-analysis`
6. Results stored in `personal_analysis` table
7. Frontend fetches → `GET /api/personal-analysis/:personId`

**Key Files:**
- Migration: `migrations/002_add_personal_info_fields.sql`
- API (Create): `src/app/api/people/route.ts`
- API (Receive): `src/app/api/n8n/personal-analysis/route.ts`
- API (Get): `src/app/api/personal-analysis/[personId]/route.ts`
- UI: `src/app/onboarding/page.tsx`

---

**Status:** ✅ Ready for n8n integration and testing
