# 🚀 GitHub Actions Setup - New Sync System

## What Changed?

**OLD (Broken):** GitHub Actions calls Vercel endpoint → 504 timeout after 5 minutes

**NEW (Fixed):** GitHub Actions runs sync directly on runner → No timeout, can run for hours

---

## Required GitHub Secrets

Go to: `Settings → Secrets and variables → Actions`

Add these two secrets:

### 1. DATABASE_URL
Your Supabase/Postgres connection string:
```
postgresql://postgres.[project]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### 2. DATA_GOV_API_KEY
Your data.gov.in API key:
```
579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b
```

**Note:** You can remove `CRON_SECRET` and `VERCEL_DEPLOYMENT_URL` - no longer needed!

---

## How to Run

### Option 1: Manual Trigger (Test First!)

1. Go to: `Actions` tab in GitHub
2. Click: `Daily MGNREGA Data Sync`
3. Click: `Run workflow` dropdown
4. Leave `resume_from_state` empty (for full sync)
5. Click: `Run workflow` button

**Expected:** Sync completes in 15-60 minutes (depending on data volume)

### Option 2: Scheduled (Automatic)

Already configured to run daily at 1:00 AM IST (19:30 UTC):
```yaml
schedule:
  - cron: '30 19 * * *'
```

No action needed - it will run automatically!

---

## Monitoring Progress

### Check Workflow Logs

1. Go to `Actions` tab
2. Click on running workflow
3. Expand `Run optimized daily sync` step
4. Watch live progress:
   ```
   🔄 Processing state (1/36): ANDAMAN AND NICOBAR
     ✓ State done: 3 districts, 72 metrics
   
   🔄 Processing state (2/36): ANDHRA PRADESH
     ✓ State done: 26 districts, 624 metrics
   ...
   ```

### Download Logs

After workflow completes (or fails):
1. Scroll to bottom of workflow run
2. Find `Artifacts` section
3. Download `sync-logs-XXXXXXX.zip`
4. Contains:
   - `sync-output.log` - Full detailed logs
   - `sync-summary.md` - Summary report

---

## If Sync Fails Midway

### Step 1: Check Logs
Find last successful state:
```
🔄 Processing state (20/36): MADHYA PRADESH
  ✓ State done: 52 districts, 1248 metrics

🔄 Processing state (21/36): MAHARASHTRA
  ❌ Failed to process state MAHARASHTRA: API rate limit
```

### Step 2: Resume from Failed State
1. Go to `Actions` tab
2. Click `Daily MGNREGA Data Sync`
3. Click `Run workflow`
4. Enter: `MAHARASHTRA` in `resume_from_state` field
5. Click `Run workflow`

### Step 3: Verify Resume Works
Logs should show:
```
🔁 RESUMING from state: MAHARASHTRA (position 21/36)
   Skipping first 20 states that were already processed.
```

**See `RESUME_GUIDE.md` for detailed resume instructions!**

---

## Expected Results

### Full Sync (All 36 States)
- **Duration:** 15-60 minutes
- **Districts:** ~740
- **Metrics:** ~14,000+
- **States:** All 36 (ANDAMAN to WEST BENGAL)

### Resumed Sync (Example: From State 21)
- **Duration:** 10-30 minutes
- **Districts:** ~370 (half)
- **Metrics:** ~7,000 (half)
- **States:** 16 (MAHARASHTRA to WEST BENGAL)

---

## Troubleshooting

### Error: DATABASE_URL not set
```
ERROR: DATABASE_URL is not set. Set DATABASE_URL in environment.
```
**Fix:** Add `DATABASE_URL` secret in GitHub Settings

### Error: DATA_GOV_API_KEY not set
```
ERROR: DATA_GOV_API_KEY is not set. Set DATA_GOV_API_KEY in environment.
```
**Fix:** Add `DATA_GOV_API_KEY` secret in GitHub Settings

### Error: pnpm command not found
```
/bin/bash: pnpm: command not found
```
**Fix:** Workflow should have `Enable pnpm` step. Check `.github/workflows/daily-sync.yml`

### Error: Prisma Client not generated
```
Error: Cannot find module '@prisma/client'
```
**Fix:** Workflow should have `Generate Prisma Client` step. Check workflow file.

### Timeout after 180 minutes
```
Error: The job running on runner has exceeded the maximum execution time of 180 minutes.
```
**Fix:** Either:
- Increase `timeout-minutes` in workflow (max: 360)
- Use resume flag to process in smaller chunks
- Optimize BATCH_SIZE or API delay in `scripts/daily-sync.ts`

---

## Performance Tuning

### Adjust Batch Size
Edit `.github/workflows/daily-sync.yml`:
```yaml
env:
  BATCH_SIZE: '500'  # Increase to 1000 for faster sync
```

Larger batch = faster but higher memory usage

### Adjust API Delay
Edit `scripts/daily-sync.ts`:
```typescript
await new Promise((r) => setTimeout(r, 500));  // Reduce from 500ms to 200ms
```

Lower delay = faster but might hit rate limits

---

## Comparison: Old vs New

| Feature | Old (Vercel Endpoint) | New (GitHub Runner) |
|---------|----------------------|---------------------|
| **Max Duration** | 5 minutes | 180 minutes (3 hours) |
| **Timeout Issue** | ❌ Yes (504 error) | ✅ No |
| **Resume Support** | ❌ No | ✅ Yes |
| **Logs** | Limited | Full + artifacts |
| **Cost** | Vercel function time | GitHub runner time (free) |
| **Debugging** | Difficult | Easy (full logs) |

---

## Next Steps

1. ✅ **Test manually**: Run workflow once to verify it works
2. ✅ **Check logs**: Ensure all 36 states process successfully
3. ✅ **Test resume**: Trigger manual run with a resume state
4. ✅ **Let it run daily**: Scheduled cron will handle it automatically
5. ✅ **Monitor first week**: Check for any failures or issues

---

## Getting Help

- **Resume issues**: See `RESUME_GUIDE.md`
- **Workflow issues**: See `.github/workflows/daily-sync.yml`
- **CLI issues**: See `scripts/daily-sync.ts`
- **Debug info**: See `DEBUG_SYNC.md`
- **Verification**: See `VERIFICATION.md`

---

## Success Checklist

- [ ] Added `DATABASE_URL` secret to GitHub
- [ ] Added `DATA_GOV_API_KEY` secret to GitHub
- [ ] Manually triggered workflow (test run)
- [ ] Verified workflow completed successfully
- [ ] Checked all 36 states processed
- [ ] Downloaded and reviewed log artifacts
- [ ] Tested resume feature (optional)
- [ ] Enabled scheduled daily runs

✅ **Once all checked, you're good to go!**
