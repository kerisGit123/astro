# n8n Compatibility Callback Fix

## 🔴 Critical Issue Identified

Your n8n is sending the **wrong userId** in the callback payload.

---

## ❌ Problem

**Your n8n payload:**
```json
{
  "userId": "fc9ec249-b485-445c-a7c9-24ec0e8aad84"  ← This is a PERSON ID, not a USER ID!
}
```

**What it should be:**
```json
{
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a"  ← This is the Clerk USER ID
}
```

---

## 🔍 How to Verify

Look at your database `compatibility_analyses` table:

```sql
SELECT id, user_id, person_a_id, person_b_id 
FROM compatibility_analyses 
ORDER BY created_at DESC 
LIMIT 5;
```

You'll see:
- `user_id` = `"user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a"` (Clerk user ID)
- `person_a_id` = `"1716e5d0-285f-40bd-bf98-bb09d746a2d6"` (Person UUID)
- `person_b_id` = `"fc9ec249-b485-445c-a7c9-24ec0e8aad84"` (Person UUID)

**Your n8n is sending `person_b_id` as `userId`!**

---

## ✅ Solution: Fix n8n Workflow

### Step 1: Check Initial Webhook Trigger

When you call `/api/compatibility/analyze`, the payload includes:

```json
{
  "type": "love",
  "compatibilityId": "uuid-of-analysis",
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",  ← CORRECT
  "language": "zh",
  "personA": {
    "id": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "name": "tang shang wey",
    ...
  },
  "personB": {
    "id": "fc9ec249-b485-445c-a7c9-24ec0e8aad84",
    "name": "ng lee peng",
    ...
  }
}
```

### Step 2: Fix n8n to Pass Through Correct Data

In your n8n workflow, when sending back to `/api/n8n/love-analysis`:

**❌ WRONG:**
```json
{
  "userId": "{{ $json.personB.id }}",  ← This is person_b_id!
  "personId": "{{ $json.personA.id }}"
}
```

**✅ CORRECT:**
```json
{
  "compatibilityId": "{{ $('Webhook').item.json.compatibilityId }}",
  "userId": "{{ $('Webhook').item.json.userId }}",
  "personA": {
    "personId": "{{ $('Webhook').item.json.personA.id }}",
    "overview": "..."
  },
  "personB": {
    "personId": "{{ $('Webhook').item.json.personB.id }}",
    "overview": "..."
  },
  ...
}
```

---

## 🎯 Required Fields in n8n Response

Send these fields back to `/api/n8n/love-analysis`:

### **Option 1: Include compatibilityId (Recommended)**
```json
{
  "compatibilityId": "uuid-from-initial-webhook",
  "personA": { ... },
  "personB": { ... },
  "marriagePotential": { ... },
  ...
}
```

### **Option 2: Include userId + both person IDs (Fallback)**
```json
{
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",  ← Clerk user ID
  "personA": {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6"
  },
  "personB": {
    "personId": "fc9ec249-b485-445c-a7c9-24ec0e8aad84"
  },
  ...
}
```

---

## 🔧 n8n Workflow Template

```
┌─────────────────┐
│ Webhook Trigger │ ← Receives from /api/compatibility/analyze
│ (Save to var)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Processing   │ ← Your LLM analysis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HTTP Request    │ ← Send back to /api/n8n/love-analysis
│                 │
│ Body:           │
│ {               │
│   "compatibilityId": "{{ $('Webhook').item.json.compatibilityId }}",
│   "userId": "{{ $('Webhook').item.json.userId }}",
│   "personA": {  │
│     "personId": "{{ $('Webhook').item.json.personA.id }}",
│     "overview": "{{ $json.personA_overview }}"
│   },            │
│   "personB": {  │
│     "personId": "{{ $('Webhook').item.json.personB.id }}",
│     "overview": "{{ $json.personB_overview }}"
│   },            │
│   "marriagePotential": { ... },
│   "strengths": [...],
│   ...           │
│ }               │
└─────────────────┘
```

---

## 🐛 Current Error Explained

**Error:** "Missing required field: compatibilityId"

**Why it happens:**

1. n8n sends `userId: "fc9ec249-b485-445c-a7c9-24ec0e8aad84"` (person UUID)
2. Backend searches: `WHERE user_id = 'fc9ec249-b485-445c-a7c9-24ec0e8aad84'`
3. Database has: `WHERE user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'`
4. No match found → Error

---

## ✅ Quick Fix Checklist

- [ ] In n8n, find where you set `userId` in the response
- [ ] Change it from `personB.id` to the original `userId` from webhook
- [ ] Add `compatibilityId` from the original webhook
- [ ] Test the workflow
- [ ] Check server logs for success message

---

## 📝 Expected Server Logs (Success)

```
[Love Analysis] === n8n Webhook Received ===
[Love Analysis] Found data in body.output
[Love Analysis] Extracted personId from personA: 1716e5d0-285f-40bd-bf98-bb09d746a2d6
[Love Analysis] Found compatibilityId by both person IDs: <uuid>
[Love Analysis] Successfully updated compatibility record
```

---

## 🎯 Summary

**The Fix:**
1. Pass `compatibilityId` from initial webhook to n8n response
2. OR pass correct `userId` (Clerk user ID, not person UUID)
3. Include both `personA.personId` and `personB.personId`

**Why it matters:**
- Without correct `userId`, database lookup fails
- Without `compatibilityId`, fallback search can't find the record
- Result: Analysis data is lost

---

## 📞 Need Help?

If still not working, check:
1. Server logs: `[Love Analysis]` messages
2. Database: `SELECT * FROM compatibility_analyses WHERE user_id = 'user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a'`
3. n8n execution logs: What data is being sent?
