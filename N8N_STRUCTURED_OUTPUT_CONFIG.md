# 🎯 n8n Structured Output Configuration - Step by Step

Your JSON structure is correct! Now you need to configure n8n to **enforce** this structure so the AI returns JSON, not text.

---

## 🔧 Option 1: OpenAI Structured Output (Recommended)

If you're using **OpenAI** (GPT-4, GPT-4o, etc.), use their structured output feature:

### Step 1: Use OpenAI Node (not generic AI node)

Add **"OpenAI"** node to your workflow

### Step 2: Configure the Node

**Model:** `gpt-4o` or `gpt-4-turbo` (must support structured output)

**Operation:** `Message a Model`

**Prompt:**
```
You are a ZiWei Dou Shu (紫微斗数) destiny analysis expert.

Analyze this person's birth chart in {{ $json.language || 'Chinese' }} language:

Name: {{ $json.name }}
Birth: {{ $json.birthInfo }}
Additional Info: {{ $json.additionalInfo }}
Family Zodiac: {{ $json.familyZodiac }}
Current Business: {{ $json.currentBusiness }}

Provide comprehensive destiny analysis covering:
1. Overall Structure - general analysis
2. 5 Element - exact counts for wood, fire, earth, metal, water
3. Energy Chart - text representation
4. Major Luck Cycles - current period and all life cycles
5. Career Direction - suitable and unsuitable careers
6. Risk Periods - major risks, secondary risks, risk types
7. Future 5 - predictions for next 5 years (wealth, career, relationship, health)
8. Future 10 - predictions for next 10 years (wealth, career, relationship, health)

Include personId: {{ $json.personId }} and userId: {{ $json.userId }} in response.
```

### Step 3: Enable Structured Output

In the OpenAI node settings:

**Response Format:** `JSON Schema`

**JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "Overall Structure": {
      "type": "string",
      "description": "Overall destiny analysis in requested language"
    },
    "5 Element": {
      "type": "object",
      "properties": {
        "wood": {"type": "number"},
        "fire": {"type": "number"},
        "earth": {"type": "number"},
        "metal": {"type": "number"},
        "water": {"type": "number"}
      },
      "required": ["wood", "fire", "earth", "metal", "water"]
    },
    "Energy Chart": {
      "type": "string",
      "description": "Text representation of energy distribution"
    },
    "Major Luck Cycles": {
      "type": "object",
      "properties": {
        "current": {
          "type": "object",
          "properties": {
            "age": {"type": "string"},
            "element": {"type": "string"},
            "description": {"type": "string"}
          }
        },
        "cycles": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "age": {"type": "string"},
              "element": {"type": "string"},
              "description": {"type": "string"}
            }
          }
        }
      }
    },
    "Career Direction": {
      "type": "object",
      "properties": {
        "suitable": {
          "type": "array",
          "items": {"type": "string"}
        },
        "unsuitable": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "Risk Periods": {
      "type": "object",
      "properties": {
        "major": {
          "type": "array",
          "items": {"type": "string"}
        },
        "secondary": {
          "type": "array",
          "items": {"type": "string"}
        },
        "risk_type": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "Future 5": {
      "type": "object",
      "properties": {
        "wealth": {"type": "string"},
        "career": {"type": "string"},
        "relationship": {"type": "string"},
        "health": {"type": "string"}
      }
    },
    "Future 10": {
      "type": "object",
      "properties": {
        "wealth": {"type": "string"},
        "career": {"type": "string"},
        "relationship": {"type": "string"},
        "health": {"type": "string"}
      }
    },
    "personId": {"type": "string"},
    "userId": {"type": "string"}
  },
  "required": ["Overall Structure", "5 Element", "Energy Chart", "Major Luck Cycles", "Career Direction", "Risk Periods", "Future 5", "Future 10", "personId", "userId"]
}
```

### Step 4: Add Set Node to Include IDs

After OpenAI node, add **"Set"** node:

**Mode:** `Manual Mapping`

**Fields to Set:**
- `personId` = `{{ $('Webhook').item.json.personId }}`
- `userId` = `{{ $('Webhook').item.json.userId }}`

**Keep All Other Fields:** ✅ Enabled

This ensures personId and userId are included in the output.

---

## 🔧 Option 2: Claude with JSON Mode

If you're using **Anthropic Claude**:

### Step 1: Use HTTP Request Node

**URL:** `https://api.anthropic.com/v1/messages`

**Method:** `POST`

**Headers:**
```json
{
  "x-api-key": "YOUR_ANTHROPIC_API_KEY",
  "anthropic-version": "2023-06-01",
  "content-type": "application/json"
}
```

**Body (JSON):**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "You are a ZiWei Dou Shu expert. Analyze this person and return ONLY valid JSON with this exact structure:\n\n{\n  \"Overall Structure\": \"analysis text\",\n  \"5 Element\": {\"wood\": 3, \"fire\": 2, \"earth\": 4, \"metal\": 6, \"water\": 3},\n  \"Energy Chart\": \"text chart\",\n  \"Major Luck Cycles\": {\"current\": {\"age\": \"43-52\", \"element\": \"Fire\", \"description\": \"...\"}, \"cycles\": [{\"age\": \"3-12\", \"element\": \"Water\", \"description\": \"...\"}]},\n  \"Career Direction\": {\"suitable\": [\"...\"], \"unsuitable\": [\"...\"]},\n  \"Risk Periods\": {\"major\": [\"...\"], \"secondary\": [\"...\"], \"risk_type\": [\"...\"]},\n  \"Future 5\": {\"wealth\": \"...\", \"career\": \"...\", \"relationship\": \"...\", \"health\": \"...\"},\n  \"Future 10\": {\"wealth\": \"...\", \"career\": \"...\", \"relationship\": \"...\", \"health\": \"...\"},\n  \"personId\": \"{{ $json.personId }}\",\n  \"userId\": \"{{ $json.userId }}\"\n}\n\nPerson: {{ $json.name }}\nBirth: {{ $json.birthInfo }}\nLanguage: {{ $json.language || 'Chinese' }}"
    }
  ]
}
```

### Step 2: Extract Response

Add **"Set"** node after HTTP Request:

**Expression:** `{{ $json.content[0].text }}`

Then add **"Code"** node to parse:

```javascript
const response = JSON.parse($input.item.json);
return [{ json: response }];
```

---

## 🔧 Option 3: Generic AI with Strict Prompt

If using a generic AI node without structured output support:

### Enhanced Prompt with JSON Enforcement

```
You are a ZiWei Dou Shu (紫微斗数) destiny analysis expert.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY valid JSON
2. Do NOT include any text before or after the JSON
3. Do NOT use markdown code blocks
4. Return raw JSON object only

Analyze this person in {{ $json.language || 'Chinese' }} language:
- Name: {{ $json.name }}
- Birth: {{ $json.birthInfo }}
- Additional: {{ $json.additionalInfo }}
- Family Zodiac: {{ $json.familyZodiac }}
- Business: {{ $json.currentBusiness }}

Return this EXACT JSON structure (replace ... with actual analysis):

{"Overall Structure":"此命格日主偏强，以金水为用神...","5 Element":{"wood":3,"fire":2,"earth":4,"metal":6,"water":3},"Energy Chart":"木 (Wood): 3\n火 (Fire): 2\n土 (Earth): 4\n金 (Metal): 6\n水 (Water): 3","Major Luck Cycles":{"current":{"age":"43-52","element":"Fire","description":"当前大运分析..."},"cycles":[{"age":"3-12","element":"Water","description":"童年时期..."},{"age":"13-22","element":"Wood","description":"青年时期..."}]},"Career Direction":{"suitable":["软件开发","数字金融","饮品零售","黄金行业"],"unsuitable":["农业","重工业","高风险投资"]},"Risk Periods":{"major":["2024-2026丙寅、丁卯年：火木偏旺，需注意身体健康"],"secondary":["2027年：人际关系挑战"],"risk_type":["健康风险","财务风险","人际关系"]},"Future 5":{"wealth":"2025-2029：财运稳步提升，饮品及软件业务扩张","career":"事业发展稳定，有晋升机会","relationship":"感情深厚但需注意夫妻沟通","health":"需定期检查肝胆和压力管理"},"Future 10":{"wealth":"2025-2034：财运整体良好，创业机会多","career":"事业上轻微波动但总趋势向上","relationship":"感情稳定且有亲子乐","health":"着重心脑血管和肝胆保养，防范慢性病"},"personId":"{{ $json.personId }}","userId":"{{ $json.userId }}"}

IMPORTANT:
- All text content must be in {{ $json.language || 'Chinese' }}
- Numbers in "5 Element" must be actual numbers, not strings
- Arrays must use square brackets []
- Objects must use curly braces {}
- No line breaks in the JSON (single line)
```

### Add Code Node to Validate

After AI node, add **"Code"** node:

```javascript
let response = $input.item.json.output || $input.item.json.text || $input.item.json;

// If response is a string, try to parse it
if (typeof response === 'string') {
  // Remove markdown code blocks if present
  response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    response = JSON.parse(response);
  } catch (e) {
    throw new Error('AI did not return valid JSON: ' + response.substring(0, 200));
  }
}

// Validate required fields
const required = ['Overall Structure', '5 Element', 'Energy Chart', 'Major Luck Cycles', 'Career Direction', 'Risk Periods', 'Future 5', 'Future 10', 'personId', 'userId'];
for (const field of required) {
  if (!response[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}

return [{ json: response }];
```

---

## ✅ Recommended Workflow

```
Webhook 
  → OpenAI (with JSON Schema) 
  → Set (add personId/userId) 
  → Code (format for API) 
  → HTTP Request (send to your API)
```

**This guarantees valid JSON output!**

---

## 🧪 Test Your Configuration

After setup:

1. **Execute workflow**
2. **Check OpenAI node output**
3. **Verify it's valid JSON** (copy to jsonlint.com)
4. **Confirm all fields present**
5. **Check your Next.js API receives correct data**

---

## 📝 Summary

**Best Option:** OpenAI with JSON Schema (Option 1)
- ✅ Guaranteed JSON output
- ✅ Enforces structure
- ✅ No parsing errors
- ✅ Most reliable

**Alternative:** Claude with strict prompt (Option 2)
- ⚠️ Requires careful prompt engineering
- ⚠️ May need validation code

**Last Resort:** Generic AI with validation (Option 3)
- ❌ Least reliable
- ❌ AI may still return text
- ❌ Requires extensive error handling

Use **Option 1** (OpenAI with JSON Schema) for best results!
