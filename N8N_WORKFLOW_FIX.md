# 🔧 n8n Workflow Fix - Empty Body Issue

## Problem
Your n8n HTTP Request node is sending:
```json
{ "body": { "": "" } }
```

Instead of the actual analysis data.

## Root Cause
The HTTP Request node is not properly configured to send the JSON data.

---

## ✅ Solution: Fix n8n HTTP Request Node

### Step 1: Configure HTTP Request Node

1. **Open your n8n workflow**
2. **Click on the HTTP Request node** (the one sending to Next.js)
3. **Configure these settings:**

**Method:** `POST`

**URL:** `https://healthy-mustang-liked.ngrok-free.app/api/n8n/personal-analysis`

**Authentication:** `None`

**Send Headers:** `ON`
- Header 1:
  - Name: `Content-Type`
  - Value: `application/json`
- Header 2:
  - Name: `x-n8n-secret`
  - Value: `2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p`

**Send Body:** `ON`

**Body Content Type:** `JSON`

**Specify Body:** `Using Fields Below`

**Body Parameters:**
- Click "Add Parameter"
- In the JSON editor, paste:

```json
[
  {
    "personId": "={{ $json.personId }}",
    "userId": "={{ $json.userId }}",
    "language": "={{ $json.language || 'zh' }}",
    "Overall Structure": "={{ $json['Overall Structure'] }}",
    "5 Element": "={{ $json['5 Element'] }}",
    "Energy Chart": "={{ $json['Energy Chart'] }}",
    "Major Luck Cycles": "={{ $json['Major Luck Cycles'] }}",
    "Career Direction": "={{ $json['Career Direction'] }}",
    "Risk Periods": "={{ $json['Risk Periods'] }}",
    "Future 5": "={{ $json['Future 5'] }}",
    "Future 10": "={{ $json['Future 10'] }}"
  }
]
```

---

## Alternative: Use Code Node

If the above doesn't work, add a **Code** node before the HTTP Request:

### Code Node Configuration

**Name:** `Format for Next.js`

**Language:** `JavaScript`

**Code:**
```javascript
// Get data from previous node
const data = $input.all()[0].json;

// Format as array for Next.js
const formatted = [{
  personId: data.personId,
  userId: data.userId,
  language: data.language || 'zh',
  "Overall Structure": data["Overall Structure"],
  "5 Element": data["5 Element"],
  "Energy Chart": data["Energy Chart"],
  "Major Luck Cycles": data["Major Luck Cycles"],
  "Career Direction": data["Career Direction"],
  "Risk Periods": data["Risk Periods"],
  "Future 5": data["Future 5"],
  "Future 10": data["Future 10"]
}];

return formatted;
```

Then in HTTP Request node:
- **Send Body:** `ON`
- **Body Content Type:** `JSON`
- **Specify Body:** `JSON/RAW`
- **Body:** `={{ JSON.stringify($json) }}`

---

## Workflow Structure Should Be:

```
1. Webhook Trigger
   ↓
2. Function: Parse Input
   (Extract personId, userId, birthInfo, etc.)
   ↓
3. HTTP Request: Call AI
   (DeepSeek/OpenAI/Claude)
   ↓
4. Function: Format AI Response
   (Add personId, userId, format JSON strings)
   ↓
5. Code: Format for Next.js
   (Create array structure)
   ↓
6. HTTP Request: Send to Next.js
   (POST to /api/n8n/personal-analysis)
```

---

## Example: Complete Format Node

```javascript
// Node: Format for Next.js
const input = $input.all()[0].json;

// Ensure personId and userId are passed through
const personId = input.personId || $node["Webhook"].json.body.personId;
const userId = input.userId || $node["Webhook"].json.body.userId;

// Format the complete response
const response = [{
  personId: personId,
  userId: userId,
  language: input.language || 'zh',
  "Overall Structure": input.overall_structure || input["Overall Structure"],
  "5 Element": typeof input.five_elements === 'string' 
    ? input.five_elements 
    : JSON.stringify(input.five_elements),
  "Energy Chart": input.energy_chart || input["Energy Chart"],
  "Major Luck Cycles": typeof input.major_luck_cycles === 'string'
    ? input.major_luck_cycles
    : JSON.stringify(input.major_luck_cycles),
  "Career Direction": typeof input.career_direction === 'string'
    ? input.career_direction
    : JSON.stringify(input.career_direction),
  "Risk Periods": typeof input.risk_periods === 'string'
    ? input.risk_periods
    : JSON.stringify(input.risk_periods),
  "Future 5": typeof input.future_5 === 'string'
    ? input.future_5
    : JSON.stringify(input.future_5),
  "Future 10": typeof input.future_10 === 'string'
    ? input.future_10
    : JSON.stringify(input.future_10)
}];

return response;
```

---

## Testing

### Test 1: Check Node Output
1. Run workflow in n8n
2. Click on "Format for Next.js" node
3. Check output - should see:
```json
[{
  "personId": "uuid-here",
  "userId": "clerk-user-id",
  "language": "zh",
  "Overall Structure": "...",
  ...
}]
```

### Test 2: Check HTTP Request
1. Click on HTTP Request node
2. Check "Input" tab - should show the array
3. Check "Output" tab - should show 200 response from Next.js

### Test 3: Check Next.js Logs
In your Next.js terminal, you should see:
```
POST /api/n8n/personal-analysis 200
```

Not:
```
POST /api/n8n/personal-analysis 400
```

---

## Common Issues

### Issue 1: "Body is empty"
**Solution:** Make sure "Send Body" is ON and "Body Content Type" is "JSON"

### Issue 2: "personId is undefined"
**Solution:** Make sure personId is passed from Webhook → through all nodes → to final HTTP Request

### Issue 3: "JSON strings not parsing"
**Solution:** Ensure JSON fields are stringified: `JSON.stringify(data.five_elements)`

---

## Quick Fix Checklist

- [ ] HTTP Request node has "Send Body" = ON
- [ ] Body Content Type = JSON
- [ ] Headers include x-n8n-secret
- [ ] personId is in the data
- [ ] userId is in the data
- [ ] Data is formatted as array: `[{...}]`
- [ ] Test execution shows data in node output
- [ ] Next.js returns 200 (not 400)

---

## Your Current Error

```
Request body: { "": "" }
```

This means n8n is not sending any data. You need to:
1. Add a Code node to format the data properly
2. Configure HTTP Request node to send the formatted data
3. Ensure personId and userId are included

**The key is: n8n must send the data as JSON in the request body, not as empty object.**
