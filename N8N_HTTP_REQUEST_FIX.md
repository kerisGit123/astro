# 🔧 n8n HTTP Request JSON Error - FIXED

## ❌ The Problem

Your HTTP Request node shows:
```
JSON parameter needs to be valid JSON
```

**Why:** You're using `{{$json}}` which tries to send the raw object, but the nested fields contain JSON strings that need proper formatting.

---

## ✅ The Solution

### Option 1: Use Expression Mode (Recommended)

In your HTTP Request node:

1. **Body Content Type:** `JSON`
2. **Specify Body:** `Using JSON`
3. **JSON field:** Switch to **Expression** mode
4. **Enter this expression:**

```javascript
[{
  "personId": {{ $json.personId }},
  "userId": {{ $json.userId }},
  "language": {{ $json.language || "zh" }},
  "Overall Structure": {{ $json["Overall Structure"] }},
  "5 Element": {{ $json["5 Element"] }},
  "Energy Chart": {{ $json["Energy Chart"] }},
  "Major Luck Cycles": {{ $json["Major Luck Cycles"] }},
  "Career Direction": {{ $json["Career Direction"] }},
  "Risk Periods": {{ $json["Risk Periods"] }},
  "Future 5": {{ $json["Future 5"] }},
  "Future 10": {{ $json["Future 10"] }}
}]
```

---

### Option 2: Use Code Node (More Reliable)

**Add a "Code" node BEFORE your HTTP Request:**

```javascript
// Format data for API callback
const formattedData = [{
  "personId": $input.item.json.personId,
  "userId": $input.item.json.userId,
  "language": $input.item.json.language || "zh",
  "Overall Structure": $input.item.json["Overall Structure"],
  "5 Element": $input.item.json["5 Element"],
  "Energy Chart": $input.item.json["Energy Chart"],
  "Major Luck Cycles": $input.item.json["Major Luck Cycles"],
  "Career Direction": $input.item.json["Career Direction"],
  "Risk Periods": $input.item.json["Risk Periods"],
  "Future 5": $input.item.json["Future 5"],
  "Future 10": $input.item.json["Future 10"]
}];

return formattedData;
```

**Then in HTTP Request:**
- **Specify Body:** `Using JSON`
- **JSON:** `{{ $json }}`

---

## 🎯 Step-by-Step Fix (Option 1)

### 1. Open HTTP Request Node

Click on your "HTTP Request7" node

### 2. Configure Body Section

- **Body Content Type:** Select `JSON`
- **Specify Body:** Select `Using JSON`

### 3. Click on JSON Field

You'll see a text area with `{{$json}}`

### 4. Click the "Expression" Tab

Switch from "Fixed" to "Expression" mode

### 5. Clear and Paste This:

```javascript
[{
  "personId": {{ $json.personId }},
  "userId": {{ $json.userId }},
  "language": {{ $json.language || "zh" }},
  "Overall Structure": {{ $json["Overall Structure"] }},
  "5 Element": {{ $json["5 Element"] }},
  "Energy Chart": {{ $json["Energy Chart"] }},
  "Major Luck Cycles": {{ $json["Major Luck Cycles"] }},
  "Career Direction": {{ $json["Career Direction"] }},
  "Risk Periods": {{ $json["Risk Periods"] }},
  "Future 5": {{ $json["Future 5"] }},
  "Future 10": {{ $json["Future 10"] }}
}]
```

### 6. Save and Test

Click "Execute Node" to test

---

## 📋 What This Does

Your current setup tries to send:
```json
{
  "Overall Structure": "此命格日主偏强...",
  "5 Element": "金3水3木2火2土2...",
  ...
}
```

But the API expects an **array** with properly formatted JSON:
```json
[{
  "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
  "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
  "language": "zh",
  "Overall Structure": "此命格日主偏强...",
  "5 Element": "金3水3木2火2土2...",
  ...
}]
```

The expression properly wraps everything in an array `[{...}]` and includes the required `personId` and `userId` fields.

---

## 🔍 Expected Output

After fixing, your HTTP Request will send:

```json
[
  {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
    "language": "zh",
    "Overall Structure": "此命格日主偏强，以金水为用神...",
    "5 Element": "金3水3木2火2土2\nASCII分布图：...",
    "Energy Chart": "金水旺，木火土适中...",
    "Major Luck Cycles": "1991-2000（壬申、癸酉）...",
    "Career Direction": "适合技术及创新驱动行业...",
    "Risk Periods": "2024-2026丙寅、丁卯年...",
    "Future 5": "2025-2029：财运稳步提升...",
    "Future 10": "2025-2034：财运整体良好..."
  }
]
```

---

## ✅ Verification

After the fix, you should see:
- ✅ No JSON validation errors
- ✅ HTTP Request executes successfully
- ✅ Your Next.js API receives the data
- ✅ Data is saved to database

---

## 🚨 Common Mistakes to Avoid

❌ **Don't use:** `{{$json}}` directly in JSON field
❌ **Don't forget:** The array brackets `[{...}]`
❌ **Don't miss:** `personId` and `userId` fields
✅ **Do use:** Expression mode or Code node
✅ **Do include:** All required fields
✅ **Do test:** Execute node after changes
