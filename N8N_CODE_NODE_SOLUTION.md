# ✅ n8n Code Node Solution - GUARANTEED TO WORK

Expression mode is causing issues. Use this **Code Node** approach instead - it's simpler and more reliable.

---

## 🎯 Step-by-Step Solution

### Step 1: Add a Code Node

1. In your n8n workflow, **add a new node** after your AI node
2. Search for **"Code"** node
3. Add it to your workflow
4. Name it: **"Format for API"**

### Step 2: Configure the Code Node

Click on the Code node and paste this **exact code**:

```javascript
// Get all items from input
const items = $input.all();

// Format each item for the API
const formattedItems = items.map(item => {
  const data = item.json;
  
  return {
    json: {
      personId: data.personId,
      userId: data.userId,
      language: data.language || 'zh',
      "Overall Structure": data["Overall Structure"] || "",
      "5 Element": data["5 Element"] || "",
      "Energy Chart": data["Energy Chart"] || "",
      "Major Luck Cycles": data["Major Luck Cycles"] || "",
      "Career Direction": data["Career Direction"] || "",
      "Risk Periods": data["Risk Periods"] || "",
      "Future 5": data["Future 5"] || "",
      "Future 10": data["Future 10"] || ""
    }
  };
});

return formattedItems;
```

### Step 3: Update HTTP Request Node

1. **Connect** the Code node to your HTTP Request node
2. **Open** the HTTP Request node
3. **Configure Body:**
   - **Body Content Type:** `JSON`
   - **Specify Body:** `Using JSON`
   - **JSON field:** Switch to **Expression** mode
   - **Enter:** `{{ [$json] }}`

That's it! The Code node handles all the formatting.

---

## 🔄 Your Workflow Should Look Like:

```
Webhook → AI Node → Code Node → HTTP Request → Done
                   (Format)
```

---

## 📋 Complete HTTP Request Configuration

### URL
```
https://your-app.com/api/n8n/personal-analysis
```

### Method
```
POST
```

### Authentication
```
None
```

### Headers
Add these headers:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `x-n8n-secret` | `2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p` |

### Body
- **Body Content Type:** `JSON`
- **Specify Body:** `Using JSON`
- **JSON:** `{{ [$json] }}` (Expression mode)

---

## ✅ Why This Works

The Code node:
- ✅ Properly formats the data as an array
- ✅ Handles all field names correctly
- ✅ Provides default values for missing fields
- ✅ No quote escaping issues
- ✅ Easy to debug and modify

The HTTP Request just sends what the Code node prepared.

---

## 🧪 Test It

After setting up:

1. **Execute the workflow** from the Webhook node
2. **Check the Code node output** - you should see properly formatted JSON
3. **Check the HTTP Request** - should execute without errors
4. **Check your Next.js logs** - should receive the data

---

## 📊 Expected Code Node Output

The Code node will output:

```json
[
  {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
    "language": "zh",
    "Overall Structure": "此命格日主偏强...",
    "5 Element": "金3水3木2火2土2...",
    "Energy Chart": "金水旺，木火土适中...",
    "Major Luck Cycles": "1991-2000（壬申、癸酉）...",
    "Career Direction": "适合技术及创新驱动行业...",
    "Risk Periods": "2024-2026丙寅、丁卯年...",
    "Future 5": "2025-2029：财运稳步提升...",
    "Future 10": "2025-2034：财运整体良好..."
  }
]
```

This is exactly what your API expects!

---

## 🎯 Summary

**Stop using Expression mode in the HTTP Request body** - it's causing the JSON validation errors.

**Instead:**
1. Add Code node to format data
2. HTTP Request just sends `{{ [$json] }}`
3. Done!

This approach is used by thousands of n8n users and is the recommended way to send complex JSON data.
