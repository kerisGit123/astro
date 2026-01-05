# 🔧 n8n AI Prompt - Must Return Valid JSON

## ❌ Current Problem

Your AI is returning **plain text** instead of **JSON objects**:

```
❌ Wrong: "金3水3木2火2土2"
✅ Correct: {"wood":3,"fire":2,"earth":4,"metal":6,"water":3}

❌ Wrong: "适合技术及创新驱动行业..."
✅ Correct: {"suitable":["Technology","Finance"],"unsuitable":["Agriculture"]}
```

---

## ✅ Fix Your AI Prompt in n8n

### Update Your AI Node Prompt

Replace your current AI prompt with this:

```
You are a ZiWei Dou Shu (紫微斗数) destiny analysis expert.

Analyze the following person's birth chart and provide a comprehensive destiny analysis in {{ $json.language || 'Chinese' }} language.

**Person Details:**
- Name: {{ $json.name }}
- Birth Info: {{ $json.birthInfo }}
- Additional Info: {{ $json.additionalInfo }}
- Family Zodiac: {{ $json.familyZodiac }}
- Current Business: {{ $json.currentBusiness }}

**CRITICAL: You MUST return ONLY valid JSON with these exact fields. Do NOT include any explanatory text outside the JSON.**

Return this exact JSON structure:

{
  "Overall Structure": "Overall analysis text in requested language...",
  "5 Element": {"wood": 3, "fire": 2, "earth": 4, "metal": 6, "water": 3},
  "Energy Chart": "木 (Wood): 3\n火 (Fire): 2\n土 (Earth): 4\n金 (Metal): 6\n水 (Water): 3",
  "Major Luck Cycles": {
    "current": {
      "age": "43-52",
      "element": "Fire",
      "description": "Current period analysis..."
    },
    "cycles": [
      {"age": "3-12", "element": "Water", "description": "..."},
      {"age": "13-22", "element": "Wood", "description": "..."}
    ]
  },
  "Career Direction": {
    "suitable": ["Technology", "Finance", "Healthcare"],
    "unsuitable": ["Agriculture", "Heavy Industry"]
  },
  "Risk Periods": {
    "major": ["2024-2026: Health concerns, financial caution"],
    "secondary": ["2027-2028: Relationship challenges"],
    "risk_type": ["Health", "Financial", "Relationship"]
  },
  "Future 5": {
    "wealth": "Wealth forecast for next 5 years...",
    "career": "Career forecast...",
    "relationship": "Relationship forecast...",
    "health": "Health forecast..."
  },
  "Future 10": {
    "wealth": "Wealth forecast for next 10 years...",
    "career": "Career forecast...",
    "relationship": "Relationship forecast...",
    "health": "Health forecast..."
  },
  "personId": "{{ $json.personId }}",
  "userId": "{{ $json.userId }}"
}

**IMPORTANT RULES:**
1. Return ONLY the JSON object, no other text
2. All numeric values in "5 Element" must be numbers, not strings
3. All arrays must be valid JSON arrays with square brackets []
4. All objects must be valid JSON objects with curly braces {}
5. Use the language specified: {{ $json.language || 'Chinese' }}
6. Keep all field names in English as shown above
7. Content inside fields should be in the requested language
```

---

## 📋 Correct JSON Structure Examples

### 5 Element (MUST be JSON object with numbers)
```json
{
  "wood": 3,
  "fire": 2,
  "earth": 4,
  "metal": 6,
  "water": 3
}
```

### Major Luck Cycles (MUST be JSON object)
```json
{
  "current": {
    "age": "43-52",
    "element": "Fire",
    "description": "此大运以火为主，事业发展旺盛..."
  },
  "cycles": [
    {
      "age": "3-12",
      "element": "Water",
      "description": "童年时期，学业基础..."
    },
    {
      "age": "13-22",
      "element": "Wood",
      "description": "青年时期，事业起步..."
    }
  ]
}
```

### Career Direction (MUST be JSON object with arrays)
```json
{
  "suitable": [
    "软件开发",
    "数字金融",
    "饮品零售",
    "黄金行业"
  ],
  "unsuitable": [
    "农业",
    "重工业",
    "高风险投资"
  ]
}
```

### Risk Periods (MUST be JSON object with arrays)
```json
{
  "major": [
    "2024-2026丙寅、丁卯年：火木偏旺，需注意身体健康",
    "2028-2030：财务压力增加"
  ],
  "secondary": [
    "2027年：人际关系挑战"
  ],
  "risk_type": [
    "健康风险",
    "财务风险",
    "人际关系"
  ]
}
```

### Future 5 & Future 10 (MUST be JSON objects)
```json
{
  "wealth": "2025-2029：财运稳步提升，饮品及软件业务扩张...",
  "career": "事业发展稳定，有晋升机会...",
  "relationship": "感情深厚但需注意夫妻沟通...",
  "health": "需定期检查肝胆和压力管理"
}
```

---

## 🎯 AI Model Configuration

### Recommended Settings

**Model:** GPT-4 or Claude 3.5 Sonnet (best for JSON output)

**Temperature:** 0.3 (lower = more consistent JSON)

**Max Tokens:** 4000

**Response Format:** JSON (if available in your AI provider)

---

## 🔧 Alternative: Use Structured Output

If your AI provider supports it, use **structured output** or **function calling**:

### OpenAI Function Calling Example
```json
{
  "name": "destiny_analysis",
  "description": "Generate ZiWei Dou Shu destiny analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "Overall Structure": {"type": "string"},
      "5 Element": {
        "type": "object",
        "properties": {
          "wood": {"type": "number"},
          "fire": {"type": "number"},
          "earth": {"type": "number"},
          "metal": {"type": "number"},
          "water": {"type": "number"}
        }
      },
      "Major Luck Cycles": {"type": "object"},
      "Career Direction": {
        "type": "object",
        "properties": {
          "suitable": {"type": "array", "items": {"type": "string"}},
          "unsuitable": {"type": "array", "items": {"type": "string"}}
        }
      }
    }
  }
}
```

---

## 🧪 Test Your AI Output

After updating the prompt, test it:

1. **Run your n8n workflow**
2. **Check the AI node output**
3. **Verify it's valid JSON:**
   - Copy the output
   - Paste into https://jsonlint.com
   - Should show "Valid JSON"

---

## ⚠️ Common Mistakes

❌ **Don't return:**
```
金3水3木2火2土2
```

✅ **Do return:**
```json
{"wood":3,"fire":2,"earth":4,"metal":6,"water":3}
```

❌ **Don't return:**
```
适合技术及创新驱动行业
```

✅ **Do return:**
```json
{"suitable":["技术","创新","金融"],"unsuitable":["农业"]}
```

---

## 📝 Summary

**The Problem:** AI is returning plain text descriptions instead of JSON objects

**The Solution:** Update your AI prompt to explicitly request JSON format with exact structure

**Critical Points:**
1. AI must return ONLY JSON, no extra text
2. Numbers must be numbers, not strings
3. Arrays must use `[]` brackets
4. Objects must use `{}` braces
5. Test output with JSON validator

After fixing the AI prompt, your workflow will work correctly!
