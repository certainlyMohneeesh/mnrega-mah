# 🔍 Daily Sync 404 Error - Debug Guide

## Problem
GitHub Actions workflow calling `/api/cron/daily-sync-optimized` returns **404 Not Found**

## Root Causes Identified

### 1. ✅ Route Exists Locally (main branch)
- File: `src/app/api/cron/daily-sync-optimized/route.ts`
- Status: ✅ Exists and properly structured

### 2. ⚠️ Vercel Deployment Issues
Possible reasons for 404 in production:

#### A. Build Cache Issue
Vercel might be serving stale build without the route

#### B. Route Export Issue
The route must export GET handler properly

#### C. Vercel Region Configuration
New `vercel.json` with `bom1` region might need redeploy

## Solution Steps

### Step 1: Verify Route Export (Already Correct)
```typescript
// ✅ Correct - route.ts has:
export async function GET(request: NextRequest) { ... }
export const maxDuration = 300;
export const dynamic = "force-dynamic";
```

### Step 2: Force Vercel Redeploy
Option A: Push a trivial change to trigger build
Option B: Redeploy from Vercel dashboard
Option C: Clear build cache in Vercel settings

### Step 3: Test the Endpoint

#### Local Test (Should work):
```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/daily-sync-optimized
```

#### Production Test:
```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-sync-optimized
```

### Step 4: Add Debug Endpoint
Create a simple test endpoint to verify routing works

### Step 5: Check Vercel Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments
4. Click latest deployment
5. Check "Building" and "Functions" tabs
6. Look for route registration

## Quick Fix: Add Debug Endpoint
