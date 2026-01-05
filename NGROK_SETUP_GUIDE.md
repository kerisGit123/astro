# Ngrok Setup Guide for n8n Callback

## ⚠️ Current Issue

Your ngrok tunnel `https://healthy-mustang-liked.ngrok-free.app` is **offline**. This prevents n8n from sending callback results to your app.

## 🔧 Solution Options

### Option 1: Restart Ngrok (Recommended for Development)

1. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

2. **Copy the new HTTPS URL** (e.g., `https://abc-123-def.ngrok-free.app`)

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-new-ngrok-url.ngrok-free.app
   ```

4. **Restart your Next.js app**:
   ```bash
   npm run dev
   ```

### Option 2: Use Production URL (Recommended for Production)

If you have a deployed production URL, use that instead:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Option 3: Use Localhost for Testing (Not Recommended)

Only works if n8n is on the same machine:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 What's Working Now

### ✅ Database Schema Fixed
- Added `'wczodiac'` to allowed `analysis_type` values
- Run migration: `migrations/018_add_wczodiac_analysis_type.sql`

### ✅ Callback Handler Updated
- `src/app/api/n8n/prediction-result/route.ts` now correctly saves:
  - `western_zodiac` → `westernZodiac`
  - `chinese_zodiac` → `chineseZodiac`
  - `personality_scores` → `personalityScores`
  - `combined_profile` → `combinedProfile`

### ✅ Report Display Created
- `src/app/dashboard/prediction-report/page.tsx` now displays:
  - Western Zodiac card with sign and traits
  - Chinese Zodiac card with animal, element, and traits
  - **Spider Chart** for personality scores (6 dimensions)
  - Combined Profile with strengths, challenges, and styles

## 🎯 Spider Chart Dimensions

The personality spider chart displays 6 scores (0-5):
1. **Execution** - Ability to get things done
2. **Leadership** - Leadership qualities
3. **Sensitivity** - Emotional awareness
4. **Sociability** - Social interaction skills
5. **Discipline** - Self-control and organization
6. **Adaptability** - Flexibility and change management

## 🚀 Testing Steps

1. **Run the migration**:
   ```sql
   ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_analysis_type_check;
   ALTER TABLE predictions ADD CONSTRAINT predictions_analysis_type_check 
   CHECK (analysis_type IN ('monthly', 'yearly', 'wczodiac'));
   ```

2. **Start ngrok** (if using for development):
   ```bash
   ngrok http 3000
   ```

3. **Update NEXT_PUBLIC_APP_URL** with new ngrok URL

4. **Restart your app**

5. **Test zodiac analysis**:
   - Go to Dashboard → Predictions → Zodiac Analysis
   - Select a person
   - Click "Analyze Zodiac Personality"
   - Wait for n8n to process
   - View report with spider chart

## 📝 n8n Callback URL

The callback URL that n8n will call:
```
${NEXT_PUBLIC_APP_URL}/api/n8n/prediction-result
```

Make sure this URL is accessible from n8n's server!

## 🔍 Debugging

Check console logs for:
```
[Zodiac Analysis] Sending to n8n webhook: ...
[Zodiac Analysis] Payload: { ... }
[Zodiac Analysis] n8n response status: 200
[Prediction Result] === n8n Webhook Received ===
```

If you see the first 3 logs but not the last one, the callback URL is not reachable.
