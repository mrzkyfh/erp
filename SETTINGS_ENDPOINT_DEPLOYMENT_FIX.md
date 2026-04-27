# Settings Endpoint Not Found - Deployment Fix

## Problem
After deployment, the `/api/settings` endpoint returns "Endpoint tidak ditemukan" (404 Not Found).

## Root Cause Analysis
The code is **correct** locally. The issue is deployment-related:

### ✅ Verified Working Locally:
1. Route registered in `backend/src/routes/index.js` line 51: `router.route("/settings", businessSettingsRoutes);`
2. File `backend/src/routes/business-settings-routes.js` exists and exports correctly
3. Import statement correct: `import { businessSettingsRoutes } from "./business-settings-routes.js";`
4. App mounts router at `/api` in `backend/src/app.js` line 42: `app.route("/api", router);`
5. Full endpoint path: `/api/settings` ✅

### 🔍 Possible Deployment Issues:

#### 1. Backend Not Redeployed
- The `business-settings-routes.js` file was added in recent commits
- If backend wasn't redeployed after the last push, the file won't exist on production

#### 2. File Missing on Production Server
- The file might not have been uploaded during deployment
- Check if `backend/src/routes/business-settings-routes.js` exists on production

#### 3. Backend Service Not Restarted
- Even if files were deployed, the Node.js process needs to restart to pick up changes
- Cloudflare Workers auto-restart, but other platforms may not

#### 4. Build/Deployment Process Issue
- Some deployment platforms have specific build steps
- ES modules (`.js` with `import/export`) require proper Node.js configuration

## Solutions

### Solution 1: Verify Backend Deployment
```bash
# Check if the file exists on production
# SSH into your production server or check via deployment dashboard
ls -la backend/src/routes/business-settings-routes.js
```

### Solution 2: Redeploy Backend
```bash
# From project root
cd backend

# If using Cloudflare Workers:
npm run deploy

# If using other platforms, follow their deployment process
```

### Solution 3: Restart Backend Service
```bash
# If using PM2:
pm2 restart backend

# If using systemd:
sudo systemctl restart your-backend-service

# If using Docker:
docker restart your-backend-container

# If using Cloudflare Workers:
# Redeployment automatically restarts
```

### Solution 4: Test Endpoint Directly
```bash
# Test if endpoint exists (replace with your production URL)
curl -X GET https://your-backend-url.com/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
# {"data": {"business_name": "...", "work_start_time": "08:00:00", ...}}

# If 404:
# {"message": "Endpoint tidak ditemukan"}
```

### Solution 5: Check Backend Logs
Look for these in your backend logs:
- Import errors: `Cannot find module './business-settings-routes.js'`
- Route registration errors
- Server startup confirmation

### Solution 6: Verify Environment Variables
Check production environment has:
```env
# Backend .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-frontend-url.com
PORT=4001
```

```env
# Frontend .env (production)
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## Quick Fix Checklist

1. ✅ **Verify last commit was pushed**
   ```bash
   git log -1 --oneline
   # Should show: 7179b11 or later
   ```

2. ✅ **Check if file exists locally**
   ```bash
   ls -la backend/src/routes/business-settings-routes.js
   # Should exist
   ```

3. ✅ **Redeploy backend**
   ```bash
   cd backend
   npm run deploy  # or your deployment command
   ```

4. ✅ **Wait for deployment to complete**
   - Check deployment dashboard
   - Wait for "Deployment successful" message

5. ✅ **Test endpoint**
   ```bash
   curl https://your-backend-url.com/api/settings
   ```

6. ✅ **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito mode

7. ✅ **Test in frontend**
   - Login as owner
   - Navigate to "Pengaturan" menu
   - Should load without "Endpoint tidak ditemukan" error

## Expected Behavior After Fix

### GET /api/settings
**Response:**
```json
{
  "data": {
    "id": 1,
    "business_name": "Bisnis Anda",
    "latitude": 0,
    "longitude": 0,
    "attendance_radius_meters": 100,
    "work_start_time": "08:00:00",
    "tolerance_minutes": 15,
    "timezone": "Asia/Jakarta",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/settings (owner only)
**Request:**
```json
{
  "business_name": "Bisnis Anda",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "attendance_radius_meters": 100,
  "work_start_time": "09:00:00",
  "tolerance_minutes": 30
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "business_name": "Bisnis Anda",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "attendance_radius_meters": 100,
    "work_start_time": "09:00:00",
    "tolerance_minutes": 30,
    "timezone": "Asia/Jakarta",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

## Files Involved

### Backend:
- `backend/src/routes/index.js` - Main router registration
- `backend/src/routes/business-settings-routes.js` - Settings endpoint implementation
- `backend/src/app.js` - App initialization and route mounting
- `backend/src/index.js` - Server startup

### Frontend:
- `frontend/src/pages/SettingsPage.jsx` - Settings UI
- `frontend/src/lib/api.js` - API client
- `frontend/.env` - Environment variables (API base URL)

## Deployment Platform Specific Notes

### Cloudflare Workers
```bash
cd backend
npx wrangler deploy
# or
npm run deploy
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Railway/Render/Fly.io
- Push to main branch (auto-deploys)
- Or use platform CLI

### VPS/Dedicated Server
```bash
# Pull latest code
git pull origin main

# Restart service
pm2 restart backend
# or
sudo systemctl restart backend
```

## Next Steps

1. **Identify your deployment platform** (Cloudflare Workers, Vercel, VPS, etc.)
2. **Follow the appropriate deployment steps** above
3. **Verify the endpoint works** using curl or browser
4. **Test in the frontend** by navigating to Pengaturan page
5. **Report back** if issue persists with:
   - Deployment platform name
   - Backend URL
   - Error message from browser console
   - Backend logs (if accessible)
