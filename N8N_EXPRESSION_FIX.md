# 🔧 n8n Expression Fix - Proper Syntax

## ❌ Your Current Code (Wrong)
```javascript
[{
  "personId": {{ $json.personId }},
  "userId": {{ $json.userId }},
  "language": {{ $json.language || "zh" }},
  ...
}]
```

**Problem:** Missing quotes around the expression values!

---

## ✅ CORRECT Expression Syntax

Replace your entire JSON field with this:

```javascript
[{
  "personId": "{{ $json.personId }}",
  "userId": "{{ $json.userId }}",
  "language": "{{ $json.language || 'zh' }}",
  "Overall Structure": "{{ $json['Overall Structure'] }}",
  "5 Element": "{{ $json['5 Element'] }}",
  "Energy Chart": "{{ $json['Energy Chart'] }}",
  "Major Luck Cycles": "{{ $json['Major Luck Cycles'] }}",
  "Career Direction": "{{ $json['Career Direction'] }}",
  "Risk Periods": "{{ $json['Risk Periods'] }}",
  "Future 5": "{{ $json['Future 5'] }}",
  "Future 10": "{{ $json['Future 10'] }}"
}]
```

---

## 🎯 Key Differences

### Wrong ❌
```javascript
"personId": {{ $json.personId }}
```

### Correct ✅
```javascript
"personId": "{{ $json.personId }}"
```

**Notice:** The expression `{{ }}` is wrapped in **double quotes** `""`

---

## 📋 Step-by-Step Fix

1. **Open your HTTP Request node**
2. **Go to Body section**
3. **Click on the JSON field**
4. **Make sure you're in Expression mode** (not Fixed)
5. **Delete everything**
6. **Copy and paste this EXACT code:**

```javascript
[{
  "personId": "{{ $json.personId }}",
  "userId": "{{ $json.userId }}",
  "language": "{{ $json.language || 'zh' }}",
  "Overall Structure": "{{ $json['Overall Structure'] }}",
  "5 Element": "{{ $json['5 Element'] }}",
  "Energy Chart": "{{ $json['Energy Chart'] }}",
  "Major Luck Cycles": "{{ $json['Major Luck Cycles'] }}",
  "Career Direction": "{{ $json['Career Direction'] }}",
  "Risk Periods": "{{ $json['Risk Periods'] }}",
  "Future 5": "{{ $json['Future 5'] }}",
  "Future 10": "{{ $json['Future 10'] }}"
}]
```

7. **Click Execute Node**

---

## 🔄 Alternative: Use Code Node (Simpler & More Reliable)

**Instead of using Expression mode, use a Code node:**

### Add Code Node Before HTTP Request

**Node Name:** "Format for API"

**Code:**
```javascript
// Get the input data
const input = $input.item.json;

// Format as array with all fields
return [{
  json: {
    personId: input.personId,
    userId: input.userId,
    language: input.language || 'zh',
    "Overall Structure": input["Overall Structure"],
    "5 Element": input["5 Element"],
    "Energy Chart": input["Energy Chart"],
    "Major Luck Cycles": input["Major Luck Cycles"],
    "Career Direction": input["Career Direction"],
    "Risk Periods": input["Risk Periods"],
    "Future 5": input["Future 5"],
    "Future 10": input["Future 10"]
  }
}];
```

### Then in HTTP Request Node

**Body Content Type:** `JSON`
**Specify Body:** `Using JSON`
**JSON field:** Just use `{{ $json }}` (in Expression mode)

This is cleaner and less error-prone!

---

## 🎯 Why Code Node is Better

✅ **Pros:**
- No quote escaping issues
- Easier to debug
- Can add logic if needed
- Clearer to read

❌ **Expression Mode Issues:**
- Need to escape quotes correctly
- Hard to debug
- Easy to make syntax errors

---

## 📊 Expected Result

After fixing, n8n will send:

```json
[
  {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
    "language": "zh",
    "Overall Structure": "此命格日主偏强，以金水为用神...",
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

---

## ✅ Recommended Solution

**Use the Code Node approach** - it's much simpler and less error-prone than expression syntax!

### Workflow:
```
AI Node → Code Node (Format) → HTTP Request → Done
```
