# Love & Compatibility Analysis - Implementation Summary

## Overview
Implemented compatibility analysis feature that sends Person A and Person B data to n8n webhook with type "love".

## API Endpoint
**File:** `src/app/api/compatibility/analyze/route.ts`

### Request Format
```json
POST /api/compatibility/analyze
{
  "personAId": "uuid-of-person-a",
  "personBId": "uuid-of-person-b"
}
```

### n8n Webhook Payload
```json
{
  "type": "love",
  "userId": "user_xxx",
  "personA": {
    "name": "tang shang wey",
    "birthdate": "02/09/1980",
    "birthtime": "22:10",
    "birthplace": "tawau, sabah, malaysia",
    "gender": "male",
    "zodiacInfo": "father tiger, mother rabbit, wife ox, son dog, brother dog"
  },
  "personB": {
    "name": "ng lee peng",
    "birthdate": "dd/mm/yyyy",
    "birthtime": "HH:mm",
    "birthplace": "location",
    "gender": "female",
    "zodiacInfo": "family zodiac info"
  }
}
```

## Key Features

### 1. Date Format
- **Format:** dd/mm/yyyy (e.g., 02/09/1980)
- Converts from database YYYY-MM-DD format
- Handles timezone properly to avoid date shifts

### 2. Gender Field
- ✅ Included in payload for both Person A and Person B
- Retrieved from `people.gender` column
- Empty string if not set

### 3. Type Field
- **Love & Compatibility:** `type: "love"`
- **People Management (Bazi):** `type: "bazi"`
- Allows n8n to differentiate between analysis types

### 4. Zodiac Info
- Uses `family_zodiac` field from database
- Contains family member zodiac animals
- Example: "father tiger, mother rabbit, wife ox, son dog, brother dog"

## Database Fields Used
```sql
SELECT 
  id, 
  name, 
  birth_date,      -- Formatted to dd/mm/yyyy
  birth_time,      -- HH:mm format
  birth_location,  -- birthplace
  gender,          -- male/female/other
  family_zodiac    -- zodiacInfo
FROM people
WHERE id IN (personAId, personBId) 
  AND created_by_user_id = userId
```

## Frontend Integration
**File:** `src/app/dashboard/love-compatibility/page.tsx`

### User Flow
1. User sees their profile (Person A) automatically
2. User selects Person B from dropdown
3. User clicks "Analyze Compatibility"
4. API sends data to n8n webhook
5. Success message shown to user
6. Results will be processed by n8n

## Webhook Configuration
**Environment Variable:** `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF`

**Current Value:**
```
https://n8n.srv1010007.hstgr.cloud/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f
```

## Error Handling

### Common Errors
1. **"Unauthorized"** - User not logged in
2. **"Both personAId and personBId are required"** - Missing IDs
3. **"One or both people not found"** - Invalid person IDs or access denied
4. **"Webhook URL not configured"** - Missing env variable
5. **"Failed to trigger compatibility analysis"** - n8n webhook error

### Debugging
- Check browser console for detailed logs
- Check server logs for `[Compatibility]` prefixed messages
- Verify n8n webhook is accessible
- Confirm both people exist in database

## Testing Checklist
- [x] API endpoint created
- [x] Date format changed to dd/mm/yyyy
- [x] Gender field included
- [x] Type field set to "love"
- [x] Zodiac info included
- [x] Frontend calls API correctly
- [ ] n8n receives webhook successfully
- [ ] n8n processes compatibility analysis
- [ ] Results stored in database
- [ ] Results displayed to user

## Next Steps
1. Configure n8n workflow to handle `type: "love"` requests
2. Process Person A and Person B data
3. Generate compatibility analysis
4. Store results in `compatibility_analyses` table
5. Create results display page
6. Add results polling/refresh mechanism
