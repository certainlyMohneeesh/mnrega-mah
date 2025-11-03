# 🔁 Resume Feature - Complete Guide

## Problem It Solves

When syncing data for all 34 states (740 districts, 14,000+ metrics), the process can take **15-60 minutes**. If something fails midway:
- ❌ **Without resume**: Start over from state 1, waste 30+ minutes reprocessing completed states
- ✅ **With resume**: Skip to the failed state, save time and API quota

---

## How the Resume Flag Works

### Sequential Processing
The sync processes states in a fixed order:
```
1. ANDAMAN AND NICOBAR
2. ANDHRA PRADESH
3. ARUNACHAL PRADESH
...
20. MADHYA PRADESH
21. MAHARASHTRA  ← Resume from here
22. MANIPUR
...
36. WEST BENGAL
```

### When Sync Fails
**Example scenario:**
```bash
🔄 Processing state (1/36): ANDAMAN AND NICOBAR
  ✓ State done: 3 districts, 72 metrics
  
🔄 Processing state (2/36): ANDHRA PRADESH
  ✓ State done: 26 districts, 624 metrics
  
# ... continues successfully through state 20 ...

🔄 Processing state (21/36): MAHARASHTRA
  ❌ Failed to process state MAHARASHTRA: API rate limit exceeded
  💡 To resume from next state, use: --from-state="MANIPUR"
```

**What happened:**
- States 1-20 completed successfully (data saved to database)
- State 21 (MAHARASHTRA) failed due to API rate limit
- All work done so far is **already in the database**

### Resume Options

#### Option 1: Retry Failed State
Resume from MAHARASHTRA (the state that failed):
```bash
pnpm run sync:cli --from-state="MAHARASHTRA"
```

This will:
- ✅ Skip states 1-20 (already done)
- 🔄 Retry MAHARASHTRA from scratch
- 🔄 Continue with remaining states (22-36)

#### Option 2: Skip Failed State
Resume from next state (MANIPUR):
```bash
pnpm run sync:cli --from-state="MANIPUR"
```

This will:
- ✅ Skip states 1-21 (including the failed one)
- 🔄 Start fresh from MANIPUR (state 22)
- 🔄 Continue through state 36

Later, you can manually fix MAHARASHTRA:
```bash
pnpm run sync:cli --from-state="MAHARASHTRA" --to-state="MAHARASHTRA"
# (Note: --to-state not implemented yet, but you get the idea)
```

---

## Using Resume in GitHub Actions

### Manual Workflow Trigger

1. **Go to Actions tab** in GitHub:
   ```
   https://github.com/actions
   ```

2. **Select workflow**: "Daily MGNREGA Data Sync"

3. **Click "Run workflow"** dropdown

4. **Enter resume state**:
   ```
   Resume from state: MAHARASHTRA
   ```

5. **Click "Run workflow"** button

### How It Works Behind the Scenes

The workflow passes your input to the CLI:

```yaml
# GitHub Actions workflow
env:
  RESUME_FROM_STATE: ${{ github.event.inputs.resume_from_state }}
run: |
  if [ -n "$RESUME_FROM_STATE" ]; then
    pnpm run sync:cli --from-state="$RESUME_FROM_STATE"
  else
    pnpm run sync:cli
  fi
```

The CLI script receives it:
```typescript
// scripts/daily-sync.ts
const args = process.argv.slice(2);
let resumeFromState = process.env.RESUME_FROM_STATE || "";

for (const arg of args) {
  if (arg.startsWith("--from-state=")) {
    resumeFromState = arg.split("=")[1];
  }
}

const resumeIndex = INDIAN_STATES.indexOf(resumeFromState.toUpperCase());
// Start loop from resumeIndex instead of 0
```

---

## Finding the Last Successful State

### Method 1: Check Workflow Logs

In GitHub Actions logs, look for the last successful state:
```
🔄 Processing state (20/36): MADHYA PRADESH
  ✓ State done: 52 districts, 1248 metrics
  📊 Progress: 20 states processed in this run

🔄 Processing state (21/36): MAHARASHTRA
  ❌ Failed to process state MAHARASHTRA: ...
```

**Resume from**: MAHARASHTRA (retry) or MANIPUR (skip)

### Method 2: Check Artifact Logs

Download the workflow artifact:
1. Go to failed workflow run
2. Scroll to "Artifacts" section
3. Download `sync-logs-XXXXXXX`
4. Open `sync-output.log`
5. Search for last "✓ State done" message

### Method 3: Check Database

Query the database to see which states have recent data:
```sql
SELECT DISTINCT state_name, COUNT(*) as districts
FROM districts
WHERE updated_at > NOW() - INTERVAL '1 hour'
GROUP BY state_name
ORDER BY state_name;
```

---

## Resume Flag Validation

The CLI validates the state name:

### Valid Examples ✅
```bash
pnpm run sync:cli --from-state="MAHARASHTRA"
pnpm run sync:cli --from-state="maharashtra"  # Case insensitive
pnpm run sync:cli --from-state="WEST BENGAL"  # Spaces OK
```

### Invalid Examples ❌
```bash
pnpm run sync:cli --from-state="BOMBAY"
# ❌ ERROR: State "BOMBAY" not found in state list.
#    Valid states: ANDAMAN AND NICOBAR, ANDHRA PRADESH, ...

pnpm run sync:cli --from-state="MH"
# ❌ ERROR: State "MH" not found in state list.
```

If invalid, the script exits immediately with error code 1.

---

## Time Savings Examples

### Full Sync (No Resume)
```
States 1-36: ~45 minutes total
Average: ~1.25 minutes per state
```

### Partial Sync (With Resume)
```
Scenario: Failed at state 21 (MAHARASHTRA)

WITHOUT resume:
  - Restart from state 1
  - Reprocess states 1-20: ~25 minutes wasted
  - Process states 21-36: ~20 minutes
  - Total: ~45 minutes

WITH resume:
  - Resume from state 21
  - Process states 21-36 only: ~20 minutes
  - Total: ~20 minutes
  
Time saved: 25 minutes (55% faster!)
```

### Multiple Failures
```
Scenario: Failures at states 10, 25, 32

Attempt 1: Sync up to state 10 (fails)
  - Time: ~12 minutes

Attempt 2: Resume from state 10, reach state 25 (fails)
  - Resume from: --from-state="ANDHRA PRADESH"
  - Skip: States 1-9
  - Process: States 10-24 (15 states)
  - Time: ~19 minutes

Attempt 3: Resume from state 25, reach state 32 (fails)
  - Resume from: --from-state="MANIPUR"
  - Skip: States 1-24
  - Process: States 25-31 (7 states)
  - Time: ~9 minutes

Attempt 4: Resume from state 32, complete!
  - Resume from: --from-state="TRIPURA"
  - Skip: States 1-31
  - Process: States 32-36 (5 states)
  - Time: ~6 minutes

Total time WITH resume: 46 minutes
Total time WITHOUT resume: 4 attempts × 45 min = 180 minutes

Time saved: 134 minutes (75% faster!)
```

---

## Advanced Usage

### Environment Variable
You can also set via environment variable:
```bash
export RESUME_FROM_STATE="MAHARASHTRA"
pnpm run sync:cli
```

Priority order:
1. CLI flag: `--from-state="X"` (highest)
2. Environment: `RESUME_FROM_STATE=X`
3. Default: Start from first state

### Local Testing
Test the resume feature locally:
```bash
# Set database connection
export DATABASE_URL="postgresql://..."
export DATA_GOV_API_KEY="..."

# Run full sync
pnpm run sync:cli

# Or test resume from specific state
pnpm run sync:cli --from-state="KARNATAKA"
```

### Dry Run Mode (Future Enhancement)
Not implemented yet, but planned:
```bash
pnpm run sync:cli --from-state="MAHARASHTRA" --dry-run
# Would show:
# 📊 DRY RUN: Would process 16 states (MAHARASHTRA to WEST BENGAL)
# 📊 Estimated time: ~20 minutes
# 📊 Estimated API calls: ~3,200
```

---

## Common Use Cases

### Case 1: API Rate Limit Hit
```
Problem: data.gov.in throttled your requests at state 15

Solution:
1. Wait 10 minutes for rate limit to reset
2. Resume from state 15:
   pnpm run sync:cli --from-state="JHARKHAND"
```

### Case 2: Network Timeout
```
Problem: GitHub Actions runner lost internet at state 28

Solution:
1. Trigger new workflow run
2. Resume from state 28:
   Go to Actions → Run workflow → Enter "PUNJAB"
```

### Case 3: Database Connection Lost
```
Problem: Supabase maintenance window started at state 12

Solution:
1. Wait for maintenance to complete
2. Resume from state 12:
   pnpm run sync:cli --from-state="HIMACHAL PRADESH"
```

### Case 4: Script Error/Bug
```
Problem: Found a bug in state processing logic at state 8

Solution:
1. Fix the bug in scripts/daily-sync.ts
2. Commit and push the fix
3. Resume from state 8:
   Go to Actions → Run workflow → Enter "CHANDIGARH"
```

---

## State Name Reference

Complete list (use exact names for --from-state):

```
1.  ANDAMAN AND NICOBAR
2.  ANDHRA PRADESH
3.  ARUNACHAL PRADESH
4.  ASSAM
5.  BIHAR
6.  CHANDIGARH
7.  CHHATTISGARH
8.  DADRA AND NAGAR HAVELI
9.  DAMAN AND DIU
10. GOA
11. GUJARAT
12. HARYANA
13. HIMACHAL PRADESH
14. JAMMU AND KASHMIR
15. JHARKHAND
16. KARNATAKA
17. KERALA
18. LADAKH
19. LAKSHADWEEP
20. MADHYA PRADESH
21. MAHARASHTRA
22. MANIPUR
23. MEGHALAYA
24. MIZORAM
25. NAGALAND
26. ODISHA
27. PUDUCHERRY
28. PUNJAB
29. RAJASTHAN
30. SIKKIM
31. TAMIL NADU
32. TELANGANA
33. TRIPURA
34. UTTAR PRADESH
35. UTTARAKHAND
36. WEST BENGAL
```

---

## Troubleshooting

### Error: State not found
```bash
❌ ERROR: State "BOMBAY" not found in state list.
```
**Fix**: Use official state name from the list above (e.g., "MAHARASHTRA")

### Error: Still processing already-done states
```bash
# Expected: Skip to MAHARASHTRA
# Actual: Processing ANDAMAN AND NICOBAR again
```
**Fix**: Check command syntax:
- ✅ Correct: `--from-state="MAHARASHTRA"`
- ❌ Wrong: `--from state="MAHARASHTRA"` (space instead of =)
- ❌ Wrong: `--fromstate="MAHARASHTRA"` (no hyphen)

### No states processed
```bash
🔁 RESUMING from state: WEST BENGAL (position 36/36)
✅ CLI sync completed in 2s
📊 Summary: 1 states processed, 0 districts, 0 metrics
```
**Explanation**: WEST BENGAL is the last state. If you want to reprocess it:
```bash
pnpm run sync:cli --from-state="WEST BENGAL"
```

---

## Future Enhancements

Planned features:
- [ ] `--to-state` flag: Process only a range (e.g., states 10-15)
- [ ] `--only-state` flag: Process just one state
- [ ] Checkpoint file: Auto-save progress every 5 states
- [ ] Smart resume: Detect last completed state from database
- [ ] Parallel processing: Resume multiple states concurrently
- [ ] Progress bar: Visual indicator of completion percentage

---

## Summary

**Resume flag**: `--from-state="STATE_NAME"`

**Purpose**: Skip already-processed states after a failure

**Time savings**: 50-75% faster recovery from failures

**Usage**:
- Local: `pnpm run sync:cli --from-state="MAHARASHTRA"`
- GitHub Actions: Enter state name in workflow input field

**Finding resume point**: Check logs for last successful state

**Validation**: Case-insensitive, must match official state name

**Benefits**:
- ⏱️ Save time (no reprocessing)
- 💰 Save API quota (fewer redundant calls)
- 🎯 Target specific states for debugging
- 🔄 Recover gracefully from failures
