# 🔧 Fix: n8n Sending Body as String

## Problem

Your n8n is sending:
```
"body": "=[{\"personId\":..."
```

The `=` at the start means n8n is treating it as a **string literal**, not evaluating the expression.

---

## ✅ Solution: Fix HTTP Request Body

### Option 1: Use Expression Editor Correctly

1. **In HTTP Request node**, scroll to **Body** section
2. **Click the gear icon** next to the Body field
3. **Select "Expression"** (not "Fixed")
4. **In the expression editor, paste:**

```javascript
{{ JSON.stringify([{
  "personId": $json.personId,
  "userId": $json.userId,
  "language": $json.language || "zh",
  "Overall Structure": $json["Overall Structure"],
  "5 Element": $json["5 Element"],
  "Energy Chart": $json["Energy Chart"],
  "Major Luck Cycles": $json["Major Luck Cycles"],
  "Career Direction": $json["Career Direction"],
  "Risk Periods": $json["Risk Periods"],
  "Future 5": $json["Future 5"],
  "Future 10": $json["Future 10"]
}]) }}
```

**IMPORTANT:** Use `{{ }}` not `={{ }}`

---

### Option 2: Add Code Node (RECOMMENDED)

This is more reliable. Add a **Code** node before HTTP Request:

**Node Name:** "Format JSON Body"

**Code:**
```javascript
// Get input data
const data = $input.all()[0].json;

// Create properly formatted array
const body = [{
  personId: data.personId,
  userId: data.userId,
  language: data.language || "zh",
  "Overall Structure": data["Overall Structure"],
  "5 Element": data["5 Element"],
  "Energy Chart": data["Energy Chart"],
  "Major Luck Cycles": data["Major Luck Cycles"],
  "Career Direction": data["Career Direction"],
  "Risk Periods": data["Risk Periods"],
  "Future 5": data["Future 5"],
  "Future 10": data["Future 10"]
}];

return body;
```

Then in **HTTP Request node**:

**Send Body:** `ON`

**Body Content Type:** `JSON`

**Specify Body:** `JSON/RAW`

**Body:** `{{ $json }}`

(Just `{{ $json }}` - this will use the output from the Code node)

---

## Why This Happens

When you use `={{ ... }}` in n8n:
- The `=` tells n8n to treat it as a **string**
- It doesn't evaluate the expression
- It sends literally: `"=[{...}]"`

Correct syntax:
- Use `{{ ... }}` for expressions
- Or use a Code node to prepare the data

---

## Test After Fix

### 1. Check Code Node Output
Click on "Format JSON Body" node → Output tab

Should see:
```json
[{
  "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
  "language": "zh",
  "Overall Structure": "日主偏弱...",
  ...
}]
```

### 2. Check HTTP Request
Click on HTTP Request node → Output tab

Should see:
```json
{
  "success": true,
  "analysis": { ... }
}
```

Status: `200 OK`

### 3. Check Next.js Terminal
```
POST /api/n8n/personal-analysis 200 in 123ms
```

### 4. Check Database
```bash
psql $env:DATABASE_URL -c "SELECT person_id, language, analyzed_at FROM personal_analysis ORDER BY analyzed_at DESC LIMIT 1;"
```

Should show new record.

### 5. View Report
Go to `http://localhost:3000/dashboard/report`

Should see all your analysis data with the Five Elements radar chart!

---

## Quick Fix Checklist

- [ ] Remove `=` from expression (use `{{ }}` not `={{ }}`)
- [ ] OR add Code node to format data
- [ ] HTTP Request body shows actual JSON (not string)
- [ ] Test execution returns 200
- [ ] Data appears in database
- [ ] Report page displays correctly

---

## Your Data is Ready!

I can see from your error message that the data is correctly formatted:
- ✅ personId: `1716e5d0-285f-40bd-bf98-bb09d746a2d6`
- ✅ userId: `user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a`
- ✅ All analysis fields present

**You just need to fix the body expression syntax in n8n!**

Use the Code node approach - it's the most reliable way to ensure the data is sent correctly.
