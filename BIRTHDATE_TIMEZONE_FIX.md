# Birth Date Timezone Issue - Fix Documentation

## Problem
When saving birth date `3/9/1985`, the system displays `2/9/1985` (off by one day).

## Root Cause
PostgreSQL DATE columns store dates without timezone information. When JavaScript creates a Date object from a string like `"1985-09-03"`, it interprets it as UTC midnight. When converted to local timezone (UTC+8), it becomes the previous day at 8 PM.

Example:
- Stored in DB: `1985-09-03` (DATE type, no timezone)
- JavaScript parses as: `1985-09-03T00:00:00.000Z` (UTC midnight)
- Converted to UTC+8: `1985-09-02T16:00:00.000+08:00` (previous day 4 PM)
- Date input shows: `1985-09-02` (wrong!)

## Solution
Always work with date strings in `YYYY-MM-DD` format without creating Date objects that involve timezone conversions.

## Files to Fix

### 1. Frontend: `src/app/dashboard/people/page.tsx`
- ✅ Already fixed in `handleEdit` to preserve YYYY-MM-DD format
- Form submission already sends birthDate as string

### 2. Backend: PostgreSQL stores DATE correctly
- No changes needed - DATE type is timezone-agnostic

### 3. API Response: Return dates as strings
- PostgreSQL already returns DATE as `YYYY-MM-DD` string
- No conversion needed

## Best Practices

1. **Never use `new Date()` for birth dates** - causes timezone shifts
2. **Store as DATE in PostgreSQL** - not TIMESTAMP
3. **Send as string** - `"YYYY-MM-DD"` format
4. **Display as string** - use `<input type="date">` with string value
5. **Parse carefully** - if you must parse, use UTC methods

## Testing
1. Edit person with birth date `3/9/1985`
2. Save and reload page
3. Edit again - should show `03/09/1985` (not `02/09/1985`)

## Current Status
✅ Fixed in `handleEdit` function
✅ Form submission sends string (no Date object)
✅ Database stores DATE type correctly
✅ Should work correctly now
