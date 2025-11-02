# 🚀 Optimized Multi-State MGNREGA Data Sync System

## 📖 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Financial Year Management](#financial-year-management)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Caching Strategy](#caching-strategy)
- [Performance](#performance)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This system provides automated data synchronization for MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) data across all **34 Indian states and union territories**. It intelligently manages financial year transitions and ensures data freshness through automated daily updates.

### Key Capabilities
- ✅ **34 states/UTs**: Complete national coverage
- ✅ **Smart FY management**: Automatically syncs previous + current financial year
- ✅ **Batch processing**: 500 records per batch with rate limiting
- ✅ **Parallel processing**: 3 states concurrently for faster imports
- ✅ **Denormalized fields**: Fast queries without joins
- ✅ **Aggressive caching**: Redis with intelligent TTLs
- ✅ **GitHub Actions**: Automated daily sync at 1:00 AM IST

---

## 🏗️ Architecture

### Database Schema (Optimized)

````prisma
model District {
  id        String   @id @default(cuid())
  code      String   // District code
  name      String   // District name
  stateCode String   // "18" for Maharashtra, "01" for Andaman, etc.
  stateName String   // "Maharashtra", "Bihar", etc.
  metrics   MonthlyMetric[]
  
  @@unique([stateCode, code]) // Composite unique
  @@index([stateCode])        // Fast state filtering
  @@index([stateName])        // For UI dropdowns
}

model MonthlyMetric {
  id         String   @id @default(cuid())
  districtId String
  district   District @relation(fields: [districtId], references: [id])
  
  // Denormalized for performance (no joins needed)
  stateCode String   
  stateName String
  
  finYear String // "2024-2025"
  month   String // "Dec", "Nov", etc.
  
  // 30+ metric fields...
  
  @@unique([districtId, finYear, month])
  @@index([stateCode, finYear])  // Critical for state queries
  @@index([stateName, finYear])  // UI dropdowns
  @@index([finYear, month])      // Time-based queries
}
````

### Data Flow

```
┌─────────────────┐
│  data.gov.in    │
│  API (Source)   │
└────────┬────────┘
         │
         ├─ Initial: Bulk Import (45-60 min)
         └─ Daily: Incremental Sync (10-15 min)
                │
         ┌──────▼───────┐
         │  API Layer   │
         │  (Next.js)   │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │  PostgreSQL  │
         │  (Supabase)  │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │    Redis     │
         │   (Upstash)  │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │   Frontend   │
         │   (Next.js)  │
         └──────────────┘
```

---

## ⚡ Features

### 1. **Smart Financial Year Management**

The system automatically handles Indian financial years (April 1 - March 31):

- **Current FY**: Automatically detected based on today's date
- **Previous FY**: Always syncs the previous year for historical comparison
- **Transition Handling**: Detects FY end approaching (last 30 days)
- **Auto-switching**: No manual configuration needed during FY transitions

Example:
```typescript
// November 2, 2025 (currently)
Current FY: 2025-2026 (April 2025 - March 2026)
Previous FY: 2024-2025 (April 2024 - March 2025)
Both synced daily ✓
```

### 2. **Optimized Batch Processing**

- **Batch Size**: 500 records per API call
- **Parallel States**: 3 states processed concurrently
- **Rate Limiting**: 1 second delay between batches
- **Transaction Safety**: Each district processed in a transaction
- **Checkpointing**: Errors in one state don't affect others

### 3. **Denormalized Fields**

To avoid expensive JOIN operations:
```sql
-- ❌ Before: Slow query requiring JOIN
SELECT mm.*, d.stateName, d.stateCode 
FROM monthly_metrics mm 
JOIN districts d ON mm.districtId = d.id 
WHERE d.stateCode = '18';

-- ✅ After: Fast indexed query, no JOIN
SELECT * FROM monthly_metrics 
WHERE stateCode = '18' AND finYear = '2024-2025';
```

### 4. **Intelligent Caching**

Redis caching with varying TTLs based on data freshness:

| Data Type | TTL | Reason |
|-----------|-----|--------|
| State-level aggregates | 24 hours | Changes daily only |
| District data | 12 hours | Moderate frequency |
| Current month metrics | 1 hour | Most volatile |
| Historical data | 7 days | Rarely changes |

---

## 🛠️ Setup Instructions

### Step 1: Update Environment Variables

Add to `.env`:
```bash
# Existing
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
REDIS_URL="redis://..."


### Step 1: Apply Database Migration

```bash
cd mgnrega

# Generate Prisma Client with new schema
npx prisma generate

# Apply migration (will add indexes and denormalized fields)
npx prisma db push
```

### Step 2: Verify Schema

Check that these indexes exist:
```bash
npx prisma db seed  # Optional: Check db connection
```

### Step 3: Run Initial Bulk Import

**Local Testing:**
```bash
# Start dev server
pnpm dev

# In another terminal, trigger bulk import
curl -X POST "http://localhost:3000/api/admin/fetch-all-states-optimized?secret=22Cmyth0315"
```

**Production:**
```bash
curl -X POST "https://mnrega-mah.vercel.app/api/admin/fetch-all-states-optimized?secret=22Cmyth0315"
```

⏱️ Expected duration: **30-45 minutes** for all 34 states

### Step 4: Configure GitHub Actions

Add secrets in GitHub repository settings:
1. Go to **Settings → Secrets and variables → Actions**
2. Add:
   - `CRON_SECRET`: `22Cmyth0315`
   - `VERCEL_DEPLOYMENT_URL`: `https://mnrega-mah.vercel.app`

The workflow is already configured in `.github/workflows/daily-sync.yml`

---

## 🔌 API Endpoints

### 1. Bulk Import (Initial Setup)

**Endpoint:** `POST /api/admin/fetch-all-states-optimized`

**Purpose:** Initial data population for all states and financial years

**Authentication:** Bearer token or query param
```bash
curl -X POST "https://your-domain.com/api/admin/fetch-all-states-optimized?secret=YOUR_SECRET"

# OR with header
curl -X POST "https://your-domain.com/api/admin/fetch-all-states-optimized" \
  -H "Authorization: Bearer YOUR_SECRET"
```

**Features:**
- Processes all 34 states
- Syncs previous + current FY
- Batch size: 500 records
- Parallel: 3 states at a time
- Timeout: 10 minutes

**Response:**
```json
{
  "success": true,
  "message": "Bulk import completed",
  "summary": {
    "statesProcessed": 34,
    "statesTotal": 34,
    "failures": 0,
    "districts": 687,
    "metrics": 45820,
    "durationSeconds": 2134
  },
  "results": [...]
}
```

### 2. Daily Sync (Automated)

**Endpoint:** `GET /api/cron/daily-sync-optimized`

**Purpose:** Incremental daily updates for active financial years only

**Schedule:** Daily at 1:00 AM IST (19:30 UTC)

**Authentication:** Required
```bash
curl "https://your-domain.com/api/cron/daily-sync-optimized?secret=YOUR_SECRET"
```

**Features:**
- Auto-detects current + previous FY
- Updates existing records
- Adds new monthly data
- Invalidates Redis cache
- Timeout: 10 minutes

**Response:**
```json
{
  "success": true,
  "message": "Daily sync completed",
  "summary": {
    "financialYears": ["2024-2025", "2025-2026"],
    "districts": 687,
    "metrics": 8234,
    "durationSeconds": 873,
    "cacheInvalidated": true
  }
}
```

### 3. Maintenance Status

**Endpoint:** `GET /api/maintenance/status`

**Purpose:** Check if system is currently syncing

**Public:** No authentication required

**Response:**
```json
{
  "isMaintenanceMode": false,
  "lastSync": "2025-11-02T01:00:00.000Z",
  "estimatedCompletionTime": null
}
```

---

## 💾 Caching Strategy

### Implementation

```typescript
// State-level data (24h cache)
const stateData = await redis.get(`state:${stateCode}:${finYear}`);
if (!stateData) {
  const data = await prisma.monthlyMetric.aggregate({
    where: { stateCode, finYear },
    // ... aggregations
  });
  await redis.setex(`state:${stateCode}:${finYear}`, 86400, JSON.stringify(data));
}

// District data (12h cache)
await redis.setex(`district:${districtId}`, 43200, JSON.stringify(district));

// Current month (1h cache)
await redis.setex(`metrics:current`, 3600, JSON.stringify(metrics));
```

### Cache Invalidation

Automatically triggered after daily sync:
```typescript
await invalidateDistrictCaches(); // Clears all cached data
```

Manual invalidation (if needed):
```typescript
await redis.del(`state:*`);
await redis.del(`district:*`);
```

---

## 📊 Performance

### Expected Numbers

| Operation | Records | Duration | Throughput |
|-----------|---------|----------|------------|
| Bulk Import | ~45,000 metrics | 30-45 min | ~17 metrics/sec |
| Daily Sync | ~8,000 metrics | 10-15 min | ~9 metrics/sec |
| Single state | ~1,300 metrics | 45-60 sec | ~20 metrics/sec |

### Database Indexes

Critical indexes for performance:
```sql
-- State-wise queries (most common)
CREATE INDEX idx_monthly_metrics_stateCode_finYear 
ON monthly_metrics(stateCode, finYear);

-- UI dropdowns
CREATE INDEX idx_monthly_metrics_stateName_finYear 
ON monthly_metrics(stateName, finYear);

-- Time-based queries
CREATE INDEX idx_monthly_metrics_finYear_month 
ON monthly_metrics(finYear, month);

-- District lookups
CREATE INDEX idx_districts_stateCode 
ON districts(stateCode);
```

### Query Performance

```sql
-- Fast: Uses index, no JOIN
SELECT * FROM monthly_metrics 
WHERE stateCode = '18' AND finYear = '2024-2025';
-- Execution time: ~10ms

-- Fast: State aggregation
SELECT stateCode, SUM(totalExpenditure) 
FROM monthly_metrics 
WHERE finYear = '2024-2025' 
GROUP BY stateCode;
-- Execution time: ~50ms
```

---

## 🔍 Monitoring

### 1. Check Fetch Logs

```sql
SELECT 
  operation,
  status,
  recordsCount,
  responseTime,
  startedAt,
  errorMessage
FROM fetch_logs
ORDER BY startedAt DESC
LIMIT 10;
```

### 2. GitHub Actions Logs

View in repository:
- Go to **Actions** tab
- Click on latest "Daily MGNREGA Data Sync" run
- Check logs for errors or timing

### 3. Vercel Logs

```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

### 4. Database Stats

```sql
-- Check data volume
SELECT 
  COUNT(*) as total_districts,
  COUNT(DISTINCT stateCode) as states,
  COUNT(DISTINCT stateName) as state_names
FROM districts;

SELECT 
  COUNT(*) as total_metrics,
  COUNT(DISTINCT finYear) as financial_years,
  MAX(updatedAt) as last_update
FROM monthly_metrics;

-- Per-state breakdown
SELECT 
  stateName,
  COUNT(*) as districts,
  (SELECT COUNT(*) FROM monthly_metrics WHERE monthly_metrics.stateCode = districts.stateCode) as metrics
FROM districts
GROUP BY stateCode, stateName
ORDER BY stateName;
```

---

## 🐛 Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Verify Supabase pooler is active
```

### Issue: "Type conversion errors"

**Fixed** in optimized version with `toNumber()` and `toInt()` helpers.

If you see errors, ensure you're using the `-optimized` endpoints:
- ✅ `/api/admin/fetch-all-states-optimized`
- ❌ `/api/admin/fetch-all-states` (old version)

### Issue: "Unique constraint violation"

**Cause:** District already exists with different state
**Solution:** Schema uses composite unique key `(stateCode, code)` - this is correct

### Issue: "Timeout during bulk import"

**Solutions:**
1. Increase `maxDuration` in route.ts (currently 600s = 10 min)
2. Run import locally (no serverless timeout)
3. Process fewer states per batch

### Issue: "GitHub Actions not triggering"

**Check:**
1. Secrets are added: `CRON_SECRET`, `VERCEL_DEPLOYMENT_URL`
2. Workflow file is in correct location: `.github/workflows/daily-sync.yml`
3. Cron syntax is correct: `30 19 * * *` (1:00 AM IST)
4. Repository is not archived or disabled

### Issue: "Out of sync financial years"

**Auto-fixed** by the system! Financial years are calculated dynamically:
```typescript
// Always syncs correct years based on current date
const syncConfig = getSyncConfiguration();
// Returns: ["2024-2025", "2025-2026"] in November 2025
```

---

## 📅 Financial Year Transitions

### How It Works

The system automatically handles FY transitions:

**March 2026 (FY ending soon):**
```
Current: 2025-2026
Previous: 2024-2025
Transition warning: "28 days until new FY"
```

**April 1, 2026 (New FY starts):**
```
Current: 2026-2027 (automatically detected!)
Previous: 2025-2026
Data: Old 2024-2025 data remains for historical comparison
```

### Data Retention

- **Current FY**: Updated daily
- **Previous FY**: Updated daily
- **Older FYs**: Retained but not auto-updated
- **Manual backfill**: Use bulk import for older years if needed

---

## 🚀 Deployment Checklist

- [ ] **Environment variables set** in Vercel
- [ ] **GitHub secrets configured**
- [ ] **Database migrated** (`npx prisma db push`)
- [ ] **Prisma Client generated** (`npx prisma generate`)
- [ ] **Initial bulk import completed** (30-45 min)
- [ ] **GitHub Actions tested** (manual trigger or wait for cron)
- [ ] **Frontend updated** to support state selection (optional)
- [ ] **Redis cache working** (check with test query)
- [ ] **Monitoring set up** (check fetch_logs table)

---

## 📞 Support

- **Issues**: GitHub repository issues
- **Logs**: Vercel dashboard or `npx prisma studio`
- **API testing**: Use curl commands provided above
- **Financial year**: Auto-calculated, no manual config needed

---

## 🎉 Success Criteria

System is working correctly when:

✅ Bulk import completes in 30-45 minutes  
✅ Daily sync runs at 1:00 AM IST automatically  
✅ All 34 states have data in database  
✅ Frontend shows data from multiple states  
✅ Cache is being used (fast page loads)  
✅ No errors in fetch_logs table  
✅ GitHub Actions shows green checkmarks  

---

**Last Updated:** November 2, 2025  
**System Version:** 2.0 (Optimized Multi-State)  
**Prisma Version:** 6.18.0
