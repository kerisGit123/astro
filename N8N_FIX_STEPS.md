# n8n Love Analysis Fix - Step by Step

## 🔴 The Problem

Your n8n is sending **person UUIDs** as `userId`, but the database needs the **Clerk user ID**.

**What n8n sends:**
```json
{
  "userId": "fc9ec249-b485-445c-a7c9-24ec0e8aad84"  ← Person UUID ❌
}
```

**What database expects:**
```json
{
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a"  ← Clerk user ID ✅
}
```

---

## 📋 Step 1: Find Your Correct User ID

Run this SQL query in your database:

```sql
SELECT 
    p.id as person_id,
    p.name as person_name,
    p.created_by_user_id as user_id
FROM people p
WHERE p.id IN (
    '1716e5d0-285f-40bd-bf98-bb09d746a2d6',
    'fc9ec249-b485-445c-a7c9-24ec0e8aad84'
);
```

**Result will show:**
```
person_id                              | person_name      | user_id
---------------------------------------|------------------|---------------------------
1716e5d0-285f-40bd-bf98-bb09d746a2d6  | tang shang wey   | user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a
fc9ec249-b485-445c-a7c9-24ec0e8aad84  | ng lee peng      | user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a
```

**Copy the `user_id` value** - this is what n8n needs to send!

---

## 📋 Step 2: Find Your Compatibility ID

Run this SQL to find the pending analysis:

```sql
SELECT 
    ca.id as compatibility_id,
    ca.user_id,
    ca.person_a_id,
    ca.person_b_id,
    ca.created_at
FROM compatibility_analyses ca
WHERE 
    (ca.person_a_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6' 
     AND ca.person_b_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84')
    OR
    (ca.person_a_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84' 
     AND ca.person_b_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6')
ORDER BY ca.created_at DESC
LIMIT 1;
```

**Copy the `compatibility_id`** - this is what n8n should send back!

---

## 📋 Step 3: Fix Your n8n Workflow

### Option A: Pass compatibilityId (Recommended)

In your n8n workflow, when you receive the initial webhook from `/api/compatibility/analyze`, it contains:

```json
{
  "type": "love",
  "compatibilityId": "uuid-here",  ← SAVE THIS
  "userId": "user_xxx",             ← SAVE THIS
  "language": "zh",
  "personA": { "id": "...", ... },
  "personB": { "id": "...", ... }
}
```

**In your HTTP Request node that sends back to `/api/n8n/love-analysis`:**

```json
{
  "compatibilityId": "{{ $('Webhook').item.json.compatibilityId }}",
  "language": "{{ $('Webhook').item.json.language }}",
  "analysisType": "{{ $('Webhook').item.json.type }}",
  "personA": {
    "personId": "{{ $('Webhook').item.json.personA.id }}",
    "overview": "{{ $json.personA_overview }}"
  },
  "personB": {
    "personId": "{{ $('Webhook').item.json.personB.id }}",
    "overview": "{{ $json.personB_overview }}"
  },
  "relationshipDynamics": { ... },
  "marriagePotential": { ... },
  "strengths": [...],
  "challenges": [...],
  "longTermOutlook": "...",
  "advice": "...",
  "SelectedTopic": "恋爱与婚姻匹配分析",
  "Question": "..."
}
```

### Option B: Pass Correct userId (Fallback)

If you can't access the initial webhook data, hardcode the correct userId:

```json
{
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",  ← From Step 1
  "personA": {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "overview": "..."
  },
  "personB": {
    "personId": "fc9ec249-b485-445c-a7c9-24ec0e8aad84",
    "overview": "..."
  },
  ...
}
```

---

## 📋 Step 4: Test the Fix

1. **Trigger a new analysis** from the frontend
2. **Check n8n execution logs** - what data is being sent?
3. **Check your server logs** for:
   ```
   [Love Analysis] Found compatibilityId: <uuid>
   [Love Analysis] Successfully updated compatibility record
   ```
4. **Refresh the frontend** - the analysis should appear with the score!

---

## 🐛 Debugging Checklist

If still not working:

### Check 1: Is the analysis created?
```sql
SELECT * FROM compatibility_analyses 
WHERE person_a_id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6'
ORDER BY created_at DESC LIMIT 1;
```

### Check 2: What userId is in the database?
```sql
SELECT user_id FROM compatibility_analyses 
WHERE id = '<compatibility_id_from_step_2>';
```

### Check 3: What is n8n sending?
Look at n8n execution logs → HTTP Request node → Request body

### Check 4: What is the backend receiving?
Check server logs for:
```
[Love Analysis] userId extracted: <what_was_sent>
[Love Analysis] personA.personId: <what_was_sent>
[Love Analysis] personB.personId: <what_was_sent>
```

---

## ✅ Success Indicators

You'll know it's working when you see:

**Server logs:**
```
[Love Analysis] === n8n Webhook Received ===
[Love Analysis] Found data in body.output
[Love Analysis] Extracted personId from personA: 1716e5d0-285f-40bd-bf98-bb09d746a2d6
[Love Analysis] Found compatibilityId by both person IDs: <uuid>
[Love Analysis] Successfully updated compatibility record
```

**Frontend:**
- Analysis card shows score (80%)
- "View" button is enabled
- Clicking "View" shows full report

---

## 🎯 Quick Reference

**Correct n8n payload structure:**
```json
{
  "compatibilityId": "from-initial-webhook",
  "personA": {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "overview": "..."
  },
  "personB": {
    "personId": "fc9ec249-b485-445c-a7c9-24ec0e8aad84",
    "overview": "..."
  },
  "marriagePotential": {
    "overallScore": 80,
    ...
  },
  "strengths": [...],
  "challenges": [...],
  "longTermOutlook": "...",
  "advice": "...",
  "SelectedTopic": "...",
  "Question": "..."
}
```

**DO NOT include:**
- ❌ `userId` at root level (unless it's the correct Clerk user ID)
- ❌ `personId` at root level (it should be inside personA/personB)

**DO include:**
- ✅ `compatibilityId` from initial webhook
- ✅ `personA.personId` and `personB.personId`
- ✅ All analysis fields (marriagePotential, strengths, etc.)

---

## 📞 Still Having Issues?

1. Run the SQL queries in `FIND_CORRECT_USERID.sql`
2. Check the results - do you see a `user_id` starting with `user_`?
3. If not, the people records might not be linked to a user
4. Share the SQL results and I can help further
