# Webhook Format Fix ✅

## Root Cause Found

**Problem:** n8n sends data as a plain object `{}`, not an array `[]`

**Old Code:**
```typescript
if (Array.isArray(body) && body.length > 0) {
  // Extract from array
} else {
  // Old format - but field names don't match!
}
```

**Result:** Code went to `else` block, tried to extract `body.overallStructure` but n8n sends `body["Overall Structure"]` → all fields became `null`

## The Fix

**New Code:**
```typescript
if (body["Overall Structure"] !== undefined || body["5 Element"] !== undefined) {
  // n8n format detected by field names
  const data = Array.isArray(body) ? body[0] : body
  overallStructure = data["Overall Structure"]
  selectedTopic = data["SelectedTopic"]
  question = data["Question"]
  // ... extract all fields correctly
} else {
  // Old format fallback
}
```

## What Changed

1. **Detection Method:** Check for n8n-specific field names instead of array type
2. **Flexible Input:** Handle both object and array formats
3. **Correct Extraction:** Use exact field names from n8n output

## Expected Behavior Now

When n8n sends:
```json
{
  "personId": "uuid",
  "Overall Structure": "此命身弱...",
  "SelectedTopic": "基于八字五行...",
  "Question": "教育代表学习..."
}
```

The webhook will:
1. ✅ Detect n8n format by checking for "Overall Structure"
2. ✅ Extract all fields with correct names
3. ✅ Save to database with proper values
4. ✅ Return complete analysis object

## Test Now

1. Trigger re-analysis from dashboard
2. Check console logs - should show:
   ```
   Extracting from n8n format
   Extracted values check: {
     hasOverallStructure: true,
     hasSelectedTopic: true,
     hasQuestion: true,
     hasFiveElements: true
   }
   ```
3. Check API response - all fields should have data, not `null`
4. Report page should display the analysis

The fix is deployed - try re-analyzing now!
