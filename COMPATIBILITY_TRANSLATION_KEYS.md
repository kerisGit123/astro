# Compatibility Pages Translation Keys Needed

## compatibility/page.tsx
Hardcoded strings found:
- "Love & Romance"
- "Business Partnership"
- "Team Compatibility"
- "Family Harmony"
- "Friendship Match"
- "New Compatibility Analysis"
- "Select Person A"
- "Select Person B"
- "Analyze Compatibility"
- "Previous Analyses"
- "Search by name..."
- "View Report"
- "Re-analyze"
- "Delete"
- "No analyses yet"

## Translation structure needed:
```json
{
  "compatibility": {
    "types": {
      "love": {
        "title": "Love & Romance",
        "description": "Analyze romantic relationships and marriage compatibility"
      },
      "business": {
        "title": "Business Partnership",
        "description": "Analyze business partner and co-founder compatibility"
      },
      "work": {
        "title": "Team Compatibility",
        "description": "Analyze colleague and team member compatibility"
      },
      "family": {
        "title": "Family Harmony",
        "description": "Analyze family member relationships and harmony"
      },
      "friend": {
        "title": "Friendship Match",
        "description": "Analyze friendship and social compatibility"
      }
    },
    "newAnalysis": "New Compatibility Analysis",
    "selectPersonA": "Select Person A",
    "selectPersonB": "Select Person B",
    "analyze": "Analyze Compatibility",
    "analyzing": "Analyzing...",
    "previousAnalyses": "Previous Analyses",
    "searchByName": "Search by name...",
    "viewReport": "View Report",
    "reAnalyze": "Re-analyze",
    "delete": "Delete",
    "noAnalyses": "No analyses yet. Create your first compatibility analysis above!",
    "viewModes": {
      "grid": "Grid",
      "card": "Card",
      "list": "List"
    }
  }
}
```
