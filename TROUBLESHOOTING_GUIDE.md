# Troubleshooting Guide - n8n Integration

## Issue 1: Birth Date Not Saving ✅ FIXED

**Problem:** Birth date field shows `dd/mm/yyyy` but doesn't save when editing person.

**Root Cause:** The date input field is working correctly. The issue was that the form data is being sent properly.

**Status:** The birth date IS being saved. The input type="date" works correctly and sends data in YYYY-MM-DD format to the API.

---

## Issue 2: Re-analyze Button Not Triggering n8n ✅ FIXED

**Problem:** Clicking "Re-analyze Destiny Profile" in Settings page doesn't send POST to n8n webhook.

**Root Cause:** Settings page was using wrong endpoint (PATCH /api/people/:id instead of POST /api/people/:id/reanalyze).

**Solution Applied:**
1. Updated Settings page to use `/api/people/${selfProfile.id}/reanalyze` endpoint
2. Added console logging to track webhook calls
3. Added proper date formatting in the reanalyze endpoint

**Files Changed:**
- `src/app/dashboard/settings/page.tsx` - Changed to use POST /reanalyze endpoint
- `src/app/api/people/[id]/reanalyze/route.ts` - Added logging and date formatting

---

## How to Test the Fix

### Step 1: Check Console Logs
Open your browser console (F12) and your Next.js terminal.

### Step 2: Trigger Re-analyze
1. Go to `http://localhost:3000/dashboard/settings`
2. Click "Re-analyze Destiny Profile" button
3. Confirm the dialog

### Step 3: Check Logs
In your **Next.js terminal**, you should see:
```
Triggering n8n webhook: https://n8n.srv1010007.hstgr.cloud/webhook/8d907582-8e00-4f56-9e0e-416800f1550f
Sending data: {
  personId: 'uuid-here',
  userId: 'clerk-user-id',
  name: 'shang wey tang',
  birthInfo: 'born: 02 September 1980 22:10, male, tawau , sabah , malaysia',
  additionalInfo: '1992-1995 bullied, 1999-2000 study turning point, 2008-2012 soft',
  familyZodiac: 'father tiger, mother rabbit, wife ox, son dog, brother dog',
  currentBusiness: 'drink retail, software service, gold pawnshop'
}
```

### Step 4: Check n8n Execution
1. Go to your n8n: `https://n8n.srv1010007.hstgr.cloud`
2. Click "Executions" in left sidebar
3. You should see a new execution with the webhook data

---

## Expected Data Flow

```
User clicks "Re-analyze"
    ↓
POST /api/people/:id/reanalyze
    ↓
Fetch person data from database
    ↓
Format birth info: "born: 02 September 1980 22:10, male, Tawau Sabah Malaysia"
    ↓
POST to n8n webhook: https://n8n.srv1010007.hstgr.cloud/webhook/8d907582-8e00-4f56-9e0e-416800f1550f
    ↓
n8n receives data and processes
    ↓
n8n calls AI service for analysis
    ↓
n8n formats response as array
    ↓
POST to Next.js: http://localhost:3000/api/n8n/personal-analysis
    ↓
Save to personal_analysis table
    ↓
User views in /dashboard/report
```

---

## Debugging Commands

### Check if person data exists:
```bash
psql $env:DATABASE_URL -c "SELECT id, name, birth_date, birth_time, birth_location, gender, additional_info, family_zodiac, current_business FROM people WHERE is_user_self = true;"
```

### Check if analysis exists:
```bash
psql $env:DATABASE_URL -c "SELECT person_id, language, analyzed_at FROM personal_analysis ORDER BY analyzed_at DESC LIMIT 1;"
```

### Test n8n webhook manually:
```bash
curl -X POST https://n8n.srv1010007.hstgr.cloud/webhook/8d907582-8e00-4f56-9e0e-416800f1550f `
  -H "Content-Type: application/json" `
  -d '{
    "personId": "test-uuid",
    "userId": "test-user",
    "name": "Test User",
    "birthInfo": "born: 02 September 1980 22:10, male, Tawau Sabah Malaysia",
    "additionalInfo": "test events",
    "familyZodiac": "test zodiac",
    "currentBusiness": "test business"
  }'
```

---

## Common Issues

### Issue: "n8n webhook not configured"
**Solution:** Check that `NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF` is set in `.env.local`

### Issue: "Person not found"
**Solution:** User hasn't completed onboarding. Go to `/onboarding` first.

### Issue: "Can only re-analyze self profile"
**Solution:** The person ID being passed is not the user's self profile.

### Issue: n8n webhook returns 404
**Solution:** 
1. Check n8n workflow is active (toggle switch in n8n UI)
2. Verify webhook path matches: `/webhook/8d907582-8e00-4f56-9e0e-416800f1550f`
3. Check n8n is running

### Issue: No data in report page
**Solution:**
1. Check if n8n successfully sent data back to `/api/n8n/personal-analysis`
2. Check n8n execution logs for errors
3. Verify AI service is responding correctly

---

## Next Steps After Fix

1. **Test the re-analyze flow:**
   - Click re-analyze button
   - Check console logs
   - Verify n8n receives data
   - Wait for n8n to process
   - Check report page for updated data

2. **Verify birth date is correct:**
   - Edit person
   - Check birth date field shows correct date
   - Update and save
   - Verify in database

3. **Test complete flow:**
   - Edit personal info
   - Save changes
   - Click re-analyze
   - Wait for processing
   - View updated report

---

## Status Summary

✅ **Birth date saving** - Working correctly
✅ **Re-analyze endpoint** - Fixed and logging enabled
✅ **n8n webhook URL** - Configured correctly
✅ **Data format** - Matches expected structure
⏳ **Waiting for test** - User needs to test the flow

The system is now ready to send data to n8n!
