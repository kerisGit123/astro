# n8n HTTP Request Node Configuration

## Based on Your Screenshot

I can see your n8n workflow has the data ready. Here's how to configure the HTTP Request node to send it to Next.js:

---

## Step-by-Step Configuration

### 1. Click on "HTTP Request7" Node

### 2. Configure Basic Settings

**Method:** `POST`

**URL:** `https://healthy-mustang-liked.ngrok-free.app/api/n8n/personal-analysis`

**Authentication:** `None`

---

### 3. Configure Headers

**Send Query Parameters:** `OFF`

**Send Headers:** `ON`

Click "Add Parameter" twice to add these headers:

**Header 1:**
- Name: `Content-Type`
- Value: `application/json`

**Header 2:**
- Name: `x-n8n-secret`
- Value: `2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p`

---

### 4. Configure Body (MOST IMPORTANT)

**Send Body:** `ON`

**Body Content Type:** `Raw/Custom`

**Content Type:** `application/json`

**Body (paste this exactly):**

```
={{ JSON.stringify([{
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

**IMPORTANT:** Make sure to use the expression editor (click the gear icon next to Body field and select "Expression")

---

## Alternative: Using JSON Fields

If the above doesn't work, try this approach:

**Body Content Type:** `JSON`

**Specify Body:** `Using Fields Below`

Then manually add each field:

1. Click "Add Field"
2. For each field, add:
   - **Name:** (exact field name)
   - **Value:** `={{ $json.fieldName }}`

Fields to add:
- `personId` → `={{ $json.personId }}`
- `userId` → `={{ $json.userId }}`
- `language` → `={{ $json.language || "zh" }}`
- `Overall Structure` → `={{ $json["Overall Structure"] }}`
- `5 Element` → `={{ $json["5 Element"] }}`
- `Energy Chart` → `={{ $json["Energy Chart"] }}`
- `Major Luck Cycles` → `={{ $json["Major Luck Cycles"] }}`
- `Career Direction` → `={{ $json["Career Direction"] }}`
- `Risk Periods` → `={{ $json["Risk Periods"] }}`
- `Future 5` → `={{ $json["Future 5"] }}`
- `Future 10` → `={{ $json["Future 10"] }}`

---

## Expected Request Format

Your HTTP Request should send this JSON:

```json
[{
  "personId": "uuid-here",
  "userId": "clerk-user-id",
  "language": "zh",
  "Overall Structure": "此命属日主己土...",
  "5 Element": "{\"wood\":3,\"fire\":3,\"earth\":7,\"metal\":4,\"water\":3}",
  "Energy Chart": "五行能量分布...",
  "Major Luck Cycles": "[{\"ageRange\":\"12-22\",\"luckType\":\"比劫运\"}]",
  "Career Direction": "{\"suitable\":[\"饮品零售\"],\"unsuitable\":[\"重资产\"]}",
  "Risk Periods": "{\"major\":[\"2024-2027\"],\"secondary\":[\"2030-2032\"]}",
  "Future 5": "{\"wealth\":\"...\",\"career\":\"...\"}",
  "Future 10": "{\"wealth\":\"...\",\"career\":\"...\"}"
}]
```

---

## How Next.js Processes the Data

### Step 1: Validate Secret
```typescript
const secret = req.headers.get('x-n8n-secret')
if (secret !== '2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p') {
  return 401 Unauthorized
}
```

### Step 2: Parse Array
```typescript
const body = await req.json()
const data = body[0]  // Get first item from array
```

### Step 3: Extract Fields
```typescript
personId = data.personId
userId = data.userId
language = data.language || 'zh'
overallStructure = data["Overall Structure"]
```

### Step 4: Parse JSON Strings
```typescript
fiveElements = JSON.parse(data["5 Element"])
// Result: {wood: 3, fire: 3, earth: 7, metal: 4, water: 3}

majorLuckCycles = JSON.parse(data["Major Luck Cycles"])
// Result: [{ageRange: "12-22", luckType: "比劫运", keyEvents: "..."}]
```

### Step 5: Save to Database
```sql
INSERT INTO personal_analysis (
  person_id,
  overall_structure,
  five_elements,
  energy_chart,
  major_luck_cycles,
  career_direction,
  risk_periods,
  future_5,
  future_10,
  language,
  analyzed_at
) VALUES (...)
```

### Step 6: Return Success
```json
{
  "success": true,
  "analysis": { ... }
}
```

---

## Testing

### Test 1: Check Node Output
1. Execute workflow in n8n
2. Click on HTTP Request node
3. Check "Output" tab
4. Should see: `200 OK` with response from Next.js

### Test 2: Check Next.js Logs
In your Next.js terminal:
```
POST /api/n8n/personal-analysis 200 in 123ms
```

### Test 3: Check Database
```bash
psql $env:DATABASE_URL -c "SELECT person_id, language, analyzed_at FROM personal_analysis ORDER BY analyzed_at DESC LIMIT 1;"
```

Should see new record with recent timestamp.

### Test 4: View in App
Go to `http://localhost:3000/dashboard/report`

Should see:
- Overall Structure text
- Five Elements radar chart
- All other analysis data

---

## Common Issues

### Issue: "Body is empty"
**Fix:** Make sure "Send Body" is ON and you're using Expression mode for the body

### Issue: "personId is missing"
**Fix:** Ensure personId is passed from Webhook through all nodes to HTTP Request

### Issue: "Invalid secret"
**Fix:** Check x-n8n-secret header matches exactly: `2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p`

### Issue: "Cannot parse JSON"
**Fix:** Make sure JSON fields are already stringified before sending (e.g., "5 Element" should be a string like `"{\"wood\":3}"`)

---

## Quick Checklist

- [ ] HTTP Request method = POST
- [ ] URL = `https://healthy-mustang-liked.ngrok-free.app/api/n8n/personal-analysis`
- [ ] Header: `Content-Type: application/json`
- [ ] Header: `x-n8n-secret: 2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p`
- [ ] Send Body = ON
- [ ] Body contains personId and userId
- [ ] Body is formatted as array: `[{...}]`
- [ ] Test execution shows 200 response
- [ ] Data appears in database
- [ ] Report page displays data

---

## Your Current Data (from screenshot)

I can see you have:
- ✅ Overall Structure
- ✅ 5 Element
- ✅ Energy Chart
- ✅ Major Luck Cycles
- ✅ Career Direction
- ✅ Risk Periods
- ✅ Future 5
- ✅ Future 10

**You just need to configure the HTTP Request node to send this data to your Next.js endpoint!**
