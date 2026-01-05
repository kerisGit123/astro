# Dashboard Destiny Profile Data - Design Ideas

## Current State
Dashboard shows static placeholder data:
- Life Master Star: "Purple Star (Zi Wei)" - hardcoded
- Current Decade Luck: "24 - 33 Years" - hardcoded
- Monthly Focus: "Networking" - hardcoded
- Warning Signals: "Minor Conflict" - hardcoded

## Proposed Improvements

### 1. **Life Master Star Card**
**Data Source:** `personal_analysis.overall_structure` or dedicated field
**Display:**
- Main star name (e.g., "Purple Star", "Seven Killings Star")
- Brief archetype description
- Key personality traits

**Example:**
```
Life Master Star: Purple Star (紫微星)
Emperor archetype. Natural leader with authority.
```

### 2. **Current Decade Luck Card**
**Data Source:** `personal_analysis.major_luck_cycles`
**Display:**
- Calculate current age from birth_date
- Find matching luck cycle from major_luck_cycles array
- Show age range and dominant element
- Brief description of this period

**Example:**
```
Current Decade: 24-33 Years
Element: Wood (木)
Career growth period, focus on expansion
```

### 3. **Monthly Focus Card**
**Data Source:** `personal_analysis.timing_opportunities`
**Display:**
- Current month/season opportunities
- Recommended focus areas
- Favorable activities

**Example:**
```
This Month: Career Advancement
Good timing for: Networking, negotiations
Favorable element: Metal
```

### 4. **Warning Signals Card**
**Data Source:** `personal_analysis.risk_warnings`
**Display:**
- Current period risks
- Areas to be cautious
- Severity level (Minor/Moderate/Major)

**Example:**
```
Current Risks: Relationship Conflicts
Watch for: Communication issues
Severity: Moderate
```

## Implementation Plan

### Phase 1: Fetch User's Analysis Data
```typescript
const [analysis, setAnalysis] = useState<PersonalAnalysis | null>(null)

useEffect(() => {
  const fetchAnalysis = async () => {
    // Fetch self profile
    const peopleRes = await fetch("/api/people")
    const people = await peopleRes.json()
    const self = people.find(p => p.is_user_self)
    
    if (self) {
      // Fetch analysis
      const analysisRes = await fetch(`/api/people/${self.id}/analysis`)
      const data = await analysisRes.json()
      setAnalysis(data)
    }
  }
  fetchAnalysis()
}, [])
```

### Phase 2: Calculate Current Decade
```typescript
const getCurrentDecade = (birthDate: string, majorLuckCycles: any[]) => {
  const birthYear = new Date(birthDate).getFullYear()
  const currentYear = new Date().getFullYear()
  const currentAge = currentYear - birthYear
  
  return majorLuckCycles.find(cycle => 
    currentAge >= cycle.startAge && currentAge <= cycle.endAge
  )
}
```

### Phase 3: Extract Relevant Data
```typescript
// Life Master Star - extract from overall_structure or create dedicated field
const extractMasterStar = (overallStructure: string) => {
  // Parse text to find main star mention
  // Or add dedicated field in database
}

// Monthly Focus - from timing_opportunities
const getCurrentMonthFocus = (timingOpportunities: any[]) => {
  const currentMonth = new Date().getMonth() + 1
  return timingOpportunities.find(opp => 
    opp.period === 'monthly' && opp.month === currentMonth
  )
}

// Warning Signals - from risk_warnings
const getCurrentWarnings = (riskWarnings: any[]) => {
  return riskWarnings.filter(risk => 
    risk.timeframe === 'current' || risk.timeframe === 'near'
  )
}
```

### Phase 4: Update Dashboard Cards
Replace hardcoded values with dynamic data from analysis.

## Fallback Behavior

If no analysis available:
- Show "Complete Analysis" button
- Display generic welcome message
- Prompt user to analyze their profile

## Database Schema Considerations

May need to add fields to `personal_analysis` table:
- `master_star` TEXT - Main life star
- `master_star_description` TEXT - Brief description
- Current fields already support:
  - `major_luck_cycles` JSONB
  - `timing_opportunities` JSONB
  - `risk_warnings` JSONB

## UI/UX Notes

- Use loading states while fetching
- Show empty state if no analysis
- Add "View Full Report" link on each card
- Use appropriate icons and colors for each element type
- Animate card updates when data loads
