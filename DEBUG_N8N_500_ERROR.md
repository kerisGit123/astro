# Debug: 500 Error When Saving to Database

## Current Status

✅ **n8n is sending data correctly** - Body is now proper JSON array
✅ **Secret validation passing** - x-n8n-secret header is correct
❌ **Database save failing** - Getting 500 error

---

## Next Steps to Debug

### 1. Check Your Next.js Terminal

Look for error messages in your Next.js terminal. You should see:

```
Error saving personal analysis: [error details]
Error details: [specific error message]
Stack: [stack trace]
```

**Common errors:**

#### Error: "column does not exist"
**Cause:** Database schema doesn't match code
**Fix:** Run migration again
```bash
psql $env:DATABASE_URL -f migrations/004_update_personal_analysis_structure.sql
```

#### Error: "invalid input syntax for type json"
**Cause:** JSON parsing issue
**Fix:** Already handled in code, but check if JSONB columns exist

#### Error: "null value in column violates not-null constraint"
**Cause:** Missing required field
**Fix:** Check which field is null

---

## 2. Verify Database Schema

Run this to check your `personal_analysis` table structure:

```bash
psql $env:DATABASE_URL -c "\d personal_analysis"
```

**Expected columns:**
- `id` - UUID
- `person_id` - UUID (references people)
- `overall_structure` - TEXT
- `five_elements` - JSONB
- `energy_chart` - TEXT
- `major_luck_cycles` - JSONB
- `career_direction` - JSONB
- `risk_periods` - JSONB
- `future_5` - JSONB
- `future_10` - JSONB
- `language` - VARCHAR(10)
- `analyzed_at` - TIMESTAMP

---

## 3. Test Database Insert Manually

Try inserting data manually to see if it works:

```sql
INSERT INTO personal_analysis (
  person_id,
  overall_structure,
  five_elements,
  energy_chart,
  major_luck_cycles,
  career_direction,
  risk_periods,
  future_5,
  future_10,
  language,
  analyzed_at
) VALUES (
  '1716e5d0-285f-40bd-bf98-bb09d746a2d6',
  'Test structure',
  '{"wood":3,"fire":2,"earth":4,"metal":7,"water":2}'::jsonb,
  'Test chart',
  '[{"ageRange":"12-21","luckType":"比劫运","keyEvents":"test"}]'::jsonb,
  '{"suitable":["软件服务"],"unsuitable":["重资产"]}'::jsonb,
  '{"major":["2008-2012"],"secondary":["1992-1995"],"risk_type":["人际冲突"]}'::jsonb,
  '{"wealth":"test","career":"test","relationship":"test","health":"test"}'::jsonb,
  '{"wealth":"test","career":"test","relationship":"test","health":"test"}'::jsonb,
  'zh',
  NOW()
);
```

If this fails, you'll see the exact error.

---

## 4. Check What Data is Being Received

I've added detailed error logging. After you trigger re-analysis again, check your Next.js terminal for:

1. **Received data:**
   - personId
   - userId
   - language
   - All analysis fields

2. **Parsed data:**
   - five_elements (should be object, not string)
   - major_luck_cycles (should be array)
   - etc.

3. **Error details:**
   - Exact error message
   - Stack trace

---

## 5. Common Issues and Fixes

### Issue: "future_5_years column does not exist"
**Fix:** The column is named `future_5` not `future_5_years`
**Status:** ✅ Already fixed in code

### Issue: "Cannot parse JSON"
**Fix:** Data is already stringified from n8n, needs to be parsed
**Status:** ✅ Already handled in code

### Issue: "Person not found"
**Fix:** Make sure person exists in database
**Check:**
```bash
psql $env:DATABASE_URL -c "SELECT id, name FROM people WHERE id = '1716e5d0-285f-40bd-bf98-bb09d746a2d6';"
```

---

## What to Do Now

1. **Trigger re-analysis** from Settings page
2. **Check Next.js terminal** for detailed error logs
3. **Copy the error message** and share it
4. **Check database schema** with `\d personal_analysis`

The detailed logging I added will show exactly what's failing.

---

## Your Data Looks Perfect

From the n8n request, I can see:
- ✅ personId: `1716e5d0-285f-40bd-bf98-bb09d746a2d6`
- ✅ userId: `user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a`
- ✅ All analysis fields present and properly formatted
- ✅ JSON strings are valid

The issue is likely:
1. Database schema mismatch
2. Column name difference
3. Data type mismatch

**Check your Next.js terminal logs to see the exact error!**
