# Setup Instructions

## Fix Neon Database Connection Error

If you're seeing this error when signing in with Google:

```
error: unsupported startup parameter in options: search_path
```

Follow these steps:

### 1. Get Your Neon Connection String

1. Go to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard** → **Connection Details**
4. **IMPORTANT**: Copy the **UNPOOLED** connection string
   - Look for the connection string that does NOT contain `-pooler` in the hostname
   - Example: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`
   - **DO NOT** use: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb`

### 2. Create `.env.local` File

Create a file named `.env.local` in the root directory (`d:\gemini\astro\.env.local`) with:

```env
# Use UNPOOLED connection string (without -pooler in hostname)
DATABASE_URL=postgresql://your-user:your-password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-key-here

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth credentials from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `AUTH_SECRET` value.

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add production URL later: `https://yourdomain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env.local`

### 5. Restart Development Server

```bash
npm run dev
```

## Why This Fixes the Error

- **Pooled connections** in Neon use connection pooling which doesn't support the `search_path` parameter
- **Unpooled connections** use WebSocket-based connections that support full PostgreSQL protocol
- Better Auth requires the ability to set `search_path` for schema management
- The fix configures Neon to use WebSocket connections via the `ws` package

## Verification

After setup, test the login flow:

1. Navigate to `http://localhost:3000`
2. Click "Sign In with Google"
3. You should be redirected to Google OAuth
4. After authentication, you should be redirected back to your app without errors

## Troubleshooting

### Still seeing connection errors?

1. Verify your `DATABASE_URL` does NOT contain `-pooler` in the hostname
2. Check that `ws` package is installed: `npm list ws`
3. Ensure `.env.local` is in the root directory (not in `src/`)
4. Restart your dev server after changing environment variables

### "Connection terminated unexpectedly"

This usually means:
- Wrong database credentials
- Database is not accessible (check Neon project status)
- Firewall blocking WebSocket connections

### OAuth errors

- Verify redirect URIs match exactly in Google Cloud Console
- Check that `NEXT_PUBLIC_APP_URL` matches your current URL
- Ensure OAuth credentials are correct
