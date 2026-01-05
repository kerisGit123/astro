# n8n Webhook Setup Guide

## Current Issue
Your ngrok tunnel `healthy-mustang-liked.ngrok-free.app` is **offline**.

Error message:
```
The endpoint healthy-mustang-liked.ngrok-free.app is offline. (ERR_NGROK_3200)
```

## Why This Happens
- ngrok free tunnels expire when the ngrok process stops
- Each time you restart ngrok, you get a **new random URL**
- Your `.env.local` still has the old URL

## Solution: Restart ngrok and Update URL

### Step 1: Start ngrok
```bash
# If n8n is running on port 5678
ngrok http 5678

# Or if on different port
ngrok http YOUR_N8N_PORT
```

### Step 2: Copy New URL
ngrok will show something like:
```
Forwarding  https://new-random-name.ngrok-free.app -> http://localhost:5678
```

### Step 3: Update .env.local
Open `d:\gemini\astro\.env.local` and update:
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF=https://new-random-name.ngrok-free.app/webhook/personal-analysis
```

### Step 4: Restart Next.js
```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Update n8n Webhook Node
In your n8n workflow:
1. Open the webhook node
2. Update the webhook URL to match the new ngrok URL
3. Save the workflow

## Alternative: Use ngrok Static Domain (Paid)
If you have ngrok Pro/Enterprise:
```bash
ngrok http 5678 --domain=your-static-domain.ngrok-free.app
```

This gives you a permanent URL that doesn't change.

## Alternative: Deploy n8n to Cloud
For production, deploy n8n to:
- **n8n Cloud** (official hosting)
- **Railway.app** (easy deployment)
- **Heroku** (free tier available)
- **DigitalOcean** (droplet)
- **AWS/GCP/Azure** (enterprise)

Then use the permanent cloud URL in `.env.local`.

## Testing After Setup

1. Check ngrok is running:
   - Visit the ngrok URL in browser
   - Should see n8n or webhook endpoint

2. Check environment variable:
   ```bash
   # In your Next.js terminal
   echo $NEXT_PUBLIC_N8N_WEBHOOK_URL_SELF
   ```

3. Test analyze button:
   - Click "Analyze" on any person
   - Check browser console for logs
   - Check server terminal for API logs
   - Check n8n for incoming webhook

## Current Webhook URL
Your old URL (offline):
```
https://healthy-mustang-liked.ngrok-free.app/api/n8n/personal-analysis
```

You need to:
1. Restart ngrok
2. Get new URL
3. Update `.env.local`
4. Restart Next.js dev server

## Webhook Payload Structure
When analyze is triggered, this is sent to n8n:
```json
{
  "personId": "uuid",
  "userId": "clerk_user_id",
  "name": "Person Name",
  "birthInfo": "born: 3 September 1985 --:-- --, Female, selangor, malaysia",
  "additionalInfo": "",
  "familyZodiac": "",
  "currentBusiness": "",
  "language": "en",
  "selectedTopic": "Career & Wealth",
  "topicPrompt": ""
}
```

n8n should process this and POST results back to:
```
https://your-nextjs-app.com/api/n8n/personal-analysis
```

## Troubleshooting

### Webhook not received
- Check ngrok is running: `curl https://your-ngrok-url.ngrok-free.app`
- Check n8n is running: Visit n8n UI
- Check webhook node is active in n8n workflow
- Check logs in Next.js terminal for API calls

### Wrong URL
- Verify `.env.local` has correct ngrok URL
- Restart Next.js after changing `.env.local`
- Check browser console for actual URL being called

### 404 Error
- Verify webhook path matches n8n webhook node path
- Check n8n workflow is activated (not just saved)
