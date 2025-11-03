# 🔍 Daily Sync 404 Error - Debug Guide

## ❌ Problem
GitHub Actions workflow calling `/api/cron/daily-sync-optimized` returns **404 Not Found**

```
Response: <!DOCTYPE html>...404: This page could not be found...
HTTP Status: 404
❌ Sync failed with status 404
```

---

## 🎯 Root Causes & Solutions

### Issue 1: Vercel Deployment Delay
**Most Common Cause:** Vercel hasn't finished deploying the latest code yet

**Solution:**
1. Wait 2-3 minutes after git push
2. Check Vercel dashboard for deployment status
3. Look for "Building" → "Ready" status

---

### Issue 2: Build Cache Problem
**Cause:** Vercel serving old cached build without the new route

**Solution:**
```bash
# A. Redeploy from Vercel Dashboard
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"
- Check "Use existing Build Cache" is UNCHECKED

# B. Force new deployment
git commit --allow-empty -m "chore: force vercel rebuild"
git push
```

---

### Issue 3: Route Not Included in Build
**Cause:** Next.js App Router might not detect the route during build

**Solution - Verify in Vercel Logs:**
1. Open Vercel Dashboard
2. Go to latest Deployment
3. Click "Functions" tab
4. Look for: `api/cron/daily-sync-optimized.func`
5. If missing → route wasn't built

**If route is missing, check:**
- File location: `src/app/api/cron/daily-sync-optimized/route.ts`
- File exports `GET` function
- No TypeScript errors in build logs

---

### Issue 4: Environment Variables
**Cause:** Missing `CRON_SECRET` or `DATA_GOV_API_KEY` in Vercel

**Solution:**
```bash
# Check Vercel Environment Variables
1. Go to Project Settings
2. Click "Environment Variables"
3. Verify these exist:
   - CRON_SECRET
   - DATA_GOV_API_KEY
   - DATABASE_URL (from Supabase)
4. Make sure they're set for "Production" environment
```

---

## 🔧 Diagnostic Tools Added

### 1. Debug Endpoint (No Auth Required)
```bash
curl https://your-app.vercel.app/api/cron/debug
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Cron API routing is working",
  "endpoint": "/api/cron/debug",
  "timestamp": "2025-11-03T...",
  "env": {
    "hasCronSecret": true,
    "hasApiKey": true,
    "nodeEnv": "production"
  },
  "vercel": {
    "region": "bom1",
    "deployment": "your-app.vercel.app"
  }
}
```

---

### 2. Health Check Endpoint (Requires Auth)
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-sync-optimized/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Daily sync endpoint is accessible",
  "endpoint": "/api/cron/daily-sync-optimized",
  "timestamp": "2025-11-03T...",
  "config": {
    "hasCronSecret": true,
    "hasApiKey": true,
    "maxDuration": 300
  }
}
```

---

### 3. Automated Test Script
Run the comprehensive diagnostic:

```bash
# Set your Vercel URL and secret
export VERCEL_URL="your-app.vercel.app"
export CRON_SECRET="your-secret-here"

# Run tests
./test-cron-endpoints.sh
```

**This will test:**
- ✅ Basic API routing
- ✅ Authentication
- ✅ Endpoint accessibility
- ✅ Environment configuration

---

## 🐛 Enhanced Logging

The main sync endpoint now includes detailed logs:

```
================================================================================
🔄 Daily Sync Request - 2025-11-03T14:30:00.000Z
📍 URL: https://your-app.vercel.app/api/cron/daily-sync-optimized
🌐 Region: bom1
================================================================================
🔐 Auth Check:
  - Header: ✅ Present
  - URL Secret: ❌ Missing
  - Env Secret: ✅ Configured
✅ Authorization successful

🔄 Starting optimized daily sync...
📊 Syncing financial years: 2024-25, 2025-26
📦 States: 34, Batch size: 500
💾 Database: ✅ Connected
```

---

## 📋 Step-by-Step Troubleshooting

### Step 1: Check Vercel Deployment Status
```bash
# Go to: https://vercel.com/dashboard
# Look for your project
# Check latest deployment is "Ready" (not "Building" or "Error")
```

### Step 2: Test Debug Endpoint
```bash
curl https://your-app.vercel.app/api/cron/debug
```

**If 404:** Route directory structure issue or build problem
**If 200:** Basic routing works, move to Step 3

### Step 3: Test Health Endpoint
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-sync-optimized/health
```

**If 404:** Main sync route not built
**If 401:** Wrong CRON_SECRET
**If 200:** Everything works! Try full sync

### Step 4: Run Full Sync
```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-sync-optimized
```

---

## 🚀 Quick Fix Checklist

- [ ] Wait 2-3 minutes for Vercel deployment
- [ ] Check Vercel dashboard shows "Ready" status
- [ ] Verify environment variables are set
- [ ] Test debug endpoint (no auth)
- [ ] Test health endpoint (with auth)
- [ ] Check Vercel function logs for errors
- [ ] If still failing, redeploy without cache

---

## 📞 Common Error Messages

### "404: This page could not be found"
**Meaning:** Route doesn't exist in deployed build
**Fix:** Wait for deployment or force redeploy without cache

### "Unauthorized"
**Meaning:** CRON_SECRET mismatch
**Fix:** Check environment variables in Vercel settings

### "500: Internal Server Error"
**Meaning:** Runtime error (database, API key, etc.)
**Fix:** Check Vercel function logs for stack trace

---

## 📊 Vercel Logs Navigation

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Project**: Click on your MGNREGA project
3. **View Deployments**: Click "Deployments" tab
4. **Select Latest**: Click on the most recent deployment
5. **Check Build Logs**: Look for errors in "Building" section
6. **Check Runtime Logs**: Click "Functions" → Select function → View logs

---

## 🎯 Expected GitHub Actions Output (Success)

```bash
🔄 Starting optimized daily MGNREGA data sync...
📊 Syncing previous + current financial year for all 34 states
Response: {
  "success": true,
  "message": "Daily sync completed",
  "summary": {
    "financialYears": ["2024-25", "2025-26"],
    "districts": 740,
    "metrics": 14028,
    "durationSeconds": 180,
    "cacheInvalidated": true
  }
}
HTTP Status: 200
✅ Optimized sync completed successfully
```
