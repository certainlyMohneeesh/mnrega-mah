# MGNREGA Data Sync System

## Overview

This system automatically fetches and synchronizes MGNREGA data for all Indian states from data.gov.in API.

## Architecture

### 1. Initial Bulk Import
**Endpoint**: `POST /api/admin/fetch-all-states`

- Fetches data for ALL Indian states (34 states/UTs)
- Covers financial years: 2024-2025 and 2025-2026
- Runs once during initial setup
- Takes approximately 45-60 minutes

**Usage**:
```bash
curl -X POST "https://your-domain.com/api/admin/fetch-all-states?secret=YOUR_CRON_SECRET"
```

### 2. Daily Incremental Sync
**Endpoint**: `GET /api/cron/daily-sync`

- Runs every day at 1:00 AM IST (via GitHub Actions)
- Updates only the current financial year data
- Takes approximately 10-15 minutes
- Automatically invalidates Redis cache after completion

**Manual Trigger**:
```bash
curl "https://your-domain.com/api/cron/daily-sync?secret=YOUR_CRON_SECRET"
```

### 3. Maintenance Mode
- System shows maintenance screen during data sync
- Automatically checks sync status every 30 seconds
- Auto-reloads page when sync completes

**Status Check**:
```bash
curl "https://your-domain.com/api/maintenance/status"
```

## Setup Instructions

### 1. Environment Variables

Add to Vercel:
```bash
DATA_GOV_API_KEY=your_api_key_from_data_gov_in
CRON_SECRET=your_secure_random_secret
```

### 2. GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets):
- `CRON_SECRET`: Same as above
- `VERCEL_DEPLOYMENT_URL`: Your Vercel deployment URL (e.g., https://your-app.vercel.app)

### 3. Initial Data Import

After deployment, run the bulk import once:

```bash
curl -X POST "https://your-domain.com/api/admin/fetch-all-states?secret=YOUR_CRON_SECRET"
```

Monitor progress in Vercel logs.

### 4. Enable Daily Sync

The GitHub Actions workflow (`.github/workflows/daily-sync.yml`) is automatically enabled and will run daily at 1:00 AM IST.

**Manual trigger**:
- Go to GitHub repository
- Actions tab
- Select "Daily MGNREGA Data Sync"
- Click "Run workflow"

## Data Flow

```
data.gov.in API
      ↓
   Fetch API
      ↓
   Process & Transform
      ↓
Supabase PostgreSQL
      ↓
   Cache (Redis)
      ↓
    Frontend
```

## Supported States

All 34 Indian states and Union Territories:
- Andaman and Nicobar
- Andhra Pradesh
- Arunachal Pradesh
- Assam
- Bihar
- Chhattisgarh
- DN Haveli and DD
- Goa
- Gujarat
- Haryana
- Himachal Pradesh
- Jammu and Kashmir
- Jharkhand
- Karnataka
- Kerala
- Ladakh
- Lakshadweep
- Madhya Pradesh
- Maharashtra
- Manipur
- Meghalaya
- Mizoram
- Nagaland
- Odisha
- Puducherry
- Punjab
- Rajasthan
- Sikkim
- Tamil Nadu
- Telangana
- Tripura
- Uttar Pradesh
- Uttarakhand
- West Bengal

## Monitoring

### Check Last Sync Status
```bash
curl "https://your-domain.com/api/maintenance/status"
```

### View Sync Logs
Check Vercel deployment logs or query the `fetch_logs` table in your database.

### GitHub Actions Logs
Go to your repository → Actions tab → Select workflow run

## Error Handling

- Failed state syncs are logged but don't stop the entire process
- Errors are stored in the `fetch_logs` table
- GitHub Actions will notify if the entire sync fails
- System continues serving cached data during sync failures

## Performance Optimization

- **Batching**: Fetches 1000 records per API call
- **Rate Limiting**: 500ms delay between batches
- **Upsert Strategy**: Only updates changed data
- **Cache Invalidation**: Clears cache only after successful sync
- **Incremental Updates**: Daily sync only fetches current year

## Troubleshooting

### Sync taking too long
- Check Vercel function logs for timeout issues
- Verify data.gov.in API is responding
- Consider increasing `maxDuration` in route handlers

### Data not updating
- Verify CRON_SECRET matches in Vercel and GitHub
- Check GitHub Actions is enabled
- Manually trigger sync to test

### Maintenance mode stuck
- Check if sync completed successfully
- Clear browser cache
- Restart Vercel deployment

## Future Improvements

- [ ] Add email notifications for sync failures
- [ ] Implement partial sync for specific states
- [ ] Add real-time progress tracking
- [ ] Create admin dashboard for sync management
- [ ] Implement data validation and quality checks
