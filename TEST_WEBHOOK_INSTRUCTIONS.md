# 🚨 Stripe Webhook Not Working - Final Solution

## Problem
The webhook at `/api/stripe/webhook` returns 404 even though the file exists at:
`src/app/api/stripe/webhook/route.ts`

## Root Cause
Next.js App Router may have cached routing or there's a conflict with the old webhook location.

## ✅ SOLUTION - Complete Steps

### Step 1: Kill ALL Node Processes
```powershell
# Stop ALL node processes completely
Get-Process node | Stop-Process -Force
```

### Step 2: Delete Build Cache
```powershell
# Remove .next folder completely
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Remove Old Webhook (if exists)
```powershell
# Delete the old webhook location to avoid conflicts
Remove-Item -Path "src\app\api\webhooks\stripe" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 4: Verify New Webhook File Exists
```powershell
# Should return True
Test-Path "src\app\api\stripe\webhook\route.ts"
```

### Step 5: Start Fresh Dev Server
```bash
pnpm run dev
```

### Step 6: Wait for Full Compilation
Look for this in terminal:
```
✓ Compiled /api/stripe/webhook
✓ Ready in [time]
```

### Step 7: Test Locally First
```powershell
# Test the endpoint directly
Invoke-WebRequest -Uri "http://localhost:3000/api/stripe/webhook" -Method POST -ContentType "application/json" -Body '{"test": true}'
```

**Expected:** Should get 400 error (signature verification failed) - this means route works!
**Bad:** 404 error means route still not recognized

### Step 8: If Still 404 - Alternative Approach

Move the webhook to a simpler path structure:

**Option A: Create at root API level**
```
src/app/api/webhook/route.ts
```
Then use URL: `/api/webhook`

**Option B: Use the existing working location**
Keep it at `/api/webhooks/stripe` and update Stripe dashboard URL to:
```
https://healthy-mustang-liked.ngrok-free.app/api/webhooks/stripe
```

## 🎯 Current Stripe Configuration

Your webhook secret is correct:
```
STRIPE_WEBHOOK_SECRET=whsec_LTDcAqdt3wyd9O7koOmhdEcf24l4ItBm
```

## 📊 Verification Checklist

- [ ] All node processes killed
- [ ] .next folder deleted
- [ ] Old webhook folder removed
- [ ] Dev server restarted
- [ ] Saw "Compiled /api/stripe/webhook" message
- [ ] Local test returns 400 (not 404)
- [ ] Ngrok shows 400 (not 404)
- [ ] Token purchase completes
- [ ] Tokens appear in balance

## 🔧 If Nothing Works

**Last Resort:** Use the working webhook location at `/api/webhooks/stripe` and just update your Stripe dashboard webhook URL to match it. The code is identical in both locations.

Current working file: `src/app/api/webhooks/stripe/route.ts`
Stripe URL should be: `https://healthy-mustang-liked.ngrok-free.app/api/webhooks/stripe`
