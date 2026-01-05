# N8N Western & Chinese Zodiac Analysis Prompts

## System Prompt

```
You are an expert astrologer specializing in both Western and Chinese zodiac systems. You have deep knowledge of the 144 unique personality combinations that result from combining the 12 Western zodiac signs with the 12 Chinese zodiac animals.

Your expertise includes:
- Western Zodiac: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
- Chinese Zodiac: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig
- Understanding how these systems interact to create nuanced personality profiles
- Analyzing personality traits, strengths, weaknesses, career tendencies, relationship patterns, and life path guidance

Based on a person's birthdate and gender, you will:
1. Determine their Western zodiac sign
2. Determine their Chinese zodiac animal
3. Provide a comprehensive personality analysis combining both systems
4. Offer insights into their unique combination's characteristics
5. Provide practical guidance for personal growth and life decisions

Always provide balanced, insightful, and actionable analysis. Be specific about the unique traits that emerge from the combination of both zodiac systems.
```

## User Prompt Template

```
Analyze the personality and characteristics for the following person:

**Name:** {{name}}
**Gender:** {{gender}}
**Birthdate:** {{birthdate}} (DD/MM/YYYY format)
**Language:** {{language}}

Please provide a comprehensive zodiac analysis that includes:

1. **Western Zodiac Sign**: Identify the sign and its core traits
2. **Chinese Zodiac Animal**: Identify the animal and its core characteristics
3. **Combined Personality Profile**: Analyze how these two systems interact to create a unique personality (this is 1 of 144 possible combinations)
4. **Strengths**: Key strengths from this zodiac combination
5. **Weaknesses**: Areas for growth and potential challenges
6. **Career & Life Path**: Suitable career paths and life direction
7. **Relationships**: Relationship patterns and compatibility insights
8. **Personal Growth Advice**: Actionable guidance for personal development

Ensure the analysis is personalized, insightful, and considers the unique interaction between Western and Chinese zodiac systems.
```

## Structured Output Schema (JSON)

```json
{
  "type": "object",
  "properties": {
    "westernZodiac": {
      "type": "object",
      "properties": {
        "sign": {
          "type": "string",
          "description": "Western zodiac sign (e.g., Aries, Taurus)"
        },
        "element": {
          "type": "string",
          "description": "Element (Fire, Earth, Air, Water)"
        },
        "dates": {
          "type": "string",
          "description": "Date range for this sign"
        },
        "coreTraits": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Core personality traits"
        }
      },
      "required": ["sign", "element", "dates", "coreTraits"]
    },
    "chineseZodiac": {
      "type": "object",
      "properties": {
        "animal": {
          "type": "string",
          "description": "Chinese zodiac animal (e.g., Rat, Ox)"
        },
        "element": {
          "type": "string",
          "description": "Chinese element (Metal, Water, Wood, Fire, Earth)"
        },
        "years": {
          "type": "string",
          "description": "Example years for this animal"
        },
        "coreCharacteristics": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Core characteristics"
        }
      },
      "required": ["animal", "element", "years", "coreCharacteristics"]
    },
    "combinedProfile": {
      "type": "object",
      "properties": {
        "combinationName": {
          "type": "string",
          "description": "Name of combination (e.g., 'Aries Rat')"
        },
        "combinationNumber": {
          "type": "string",
          "description": "Which of 144 combinations (e.g., '1 of 144')"
        },
        "overview": {
          "type": "string",
          "description": "Comprehensive overview of the combined personality (200-300 words)"
        },
        "uniqueTraits": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Unique traits from this specific combination"
        }
      },
      "required": ["combinationName", "combinationNumber", "overview", "uniqueTraits"]
    },
    "strengths": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "strength": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        }
      },
      "description": "Key strengths (5-7 items)"
    },
    "weaknesses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "weakness": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        }
      },
      "description": "Areas for growth (5-7 items)"
    },
    "careerAndLifePath": {
      "type": "object",
      "properties": {
        "suitableCareers": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Recommended career paths"
        },
        "workStyle": {
          "type": "string",
          "description": "Work style and approach"
        },
        "lifeDirection": {
          "type": "string",
          "description": "Overall life path guidance"
        }
      },
      "required": ["suitableCareers", "workStyle", "lifeDirection"]
    },
    "relationships": {
      "type": "object",
      "properties": {
        "loveStyle": {
          "type": "string",
          "description": "Approach to romantic relationships"
        },
        "friendshipStyle": {
          "type": "string",
          "description": "Approach to friendships"
        },
        "compatibleSigns": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Most compatible zodiac combinations"
        },
        "challengingSigns": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Potentially challenging combinations"
        }
      },
      "required": ["loveStyle", "friendshipStyle", "compatibleSigns", "challengingSigns"]
    },
    "personalGrowth": {
      "type": "object",
      "properties": {
        "keyAdvice": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Actionable personal growth advice (5-7 items)"
        },
        "areasToFocus": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Specific areas for development"
        },
        "lifeLessons": {
          "type": "string",
          "description": "Key life lessons for this combination"
        }
      },
      "required": ["keyAdvice", "areasToFocus", "lifeLessons"]
    },
    "summary": {
      "type": "string",
      "description": "Concise summary of the entire analysis (100-150 words)"
    }
  },
  "required": [
    "westernZodiac",
    "chineseZodiac",
    "combinedProfile",
    "strengths",
    "weaknesses",
    "careerAndLifePath",
    "relationships",
    "personalGrowth",
    "summary"
  ]
}
```

## Data to POST to N8N Webhook

```json
{
  "language": "en",
  "type": "wczodiac",
  "predictionId": "uuid-generated-by-frontend",
  "personId": "person-uuid-from-database",
  "userId": "user-uuid-from-clerk",
  "birthdate": "15/03/1990",
  "gender": "Male",
  "name": "John Doe"
}
```

## N8N Workflow Configuration

### 1. Webhook Node
- **Method**: POST
- **Path**: `/webhook-test/8d907582-8e00-4f56-9e0e-416800f1550f`
- **Response Mode**: Respond Immediately
- **Response Data**: `{ "status": "processing", "predictionId": "{{$json.predictionId}}" }`

### 2. LLM Node (OpenAI/Anthropic/DeepSeek)
- **Model**: gpt-4 / claude-3-5-sonnet / deepseek-chat
- **System Prompt**: Use the System Prompt above
- **User Prompt**: Use the User Prompt Template with variables:
  - `{{$json.name}}`
  - `{{$json.gender}}`
  - `{{$json.birthdate}}`
  - `{{$json.language}}`
- **Output Format**: JSON (Structured Output)
- **JSON Schema**: Use the Structured Output Schema above

### 3. HTTP Request Node (Send Result Back)
- **Method**: POST
- **URL**: `{{$json.callbackUrl}}` or your app's callback endpoint
- **Body**:
```json
{
  "predictionId": "{{$json.predictionId}}",
  "status": "completed",
  "result": "{{$json.llmResponse}}"
}
```

## Example Complete Payload

```json
{
  "language": "en",
  "type": "wczodiac",
  "predictionId": "pred_abc123xyz",
  "personId": "person_def456uvw",
  "userId": "user_ghi789rst",
  "birthdate": "21/04/1988",
  "gender": "Female",
  "name": "Sarah Chen",
  "callbackUrl": "https://your-app.com/api/n8n/prediction-result"
}
```

## Notes

1. **144 Combinations**: 12 Western signs × 12 Chinese animals = 144 unique personality profiles
2. **Birthdate Format**: Always use DD/MM/YYYY format
3. **Language Support**: Can be 'en', 'zh', 'ms', etc.
4. **Gender**: Used for personalized insights (Male/Female/Other)
5. **Callback**: N8N should send results back to your app's callback endpoint
6. **Error Handling**: Include proper error handling in N8N workflow for invalid dates or missing data
