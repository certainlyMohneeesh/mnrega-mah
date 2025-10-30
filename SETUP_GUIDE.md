# 🚀 Complete Setup Guide for Maharashtra MGNREGA Dashboard

This guide will walk you through setting up the entire project step by step.

## ✅ What Has Been Completed

The following has been scaffolded and is ready to use:

1. ✅ **Project Configuration**
   - Next.js 16 with App Router
   - TypeScript with strict mode
   - TailwindCSS v4 with custom theme
   - ESLint and Prettier
   - Jest for testing

2. ✅ **Database Layer**
   - Prisma schema with 4 models (District, MonthlyMetric, FetchLog, User)
   - Seed script with 36 Maharashtra districts
   - Database client with singleton pattern

3. ✅ **Caching Layer**
   - Redis client with connection pooling
   - Cache key patterns and TTL configurations
   - Cache invalidation utilities

4. ✅ **Data Ingestion**
   - Robust script with exponential backoff
   - Rate limiting (1 request/second)
   - Retry logic (up to 5 attempts)
   - Error handling and logging

5. ✅ **API Routes** (All with Redis caching)
   - `GET /api/districts` - List all districts
   - `GET /api/districts/[id]/latest` - Latest metrics
   - `GET /api/districts/[id]/history` - Historical data
   - `GET /api/compare` - Compare districts
   - `GET /api/state/latest` - State aggregates

6. ✅ **Internationalization**
   - next-intl configured
   - 3 languages: Marathi (default), Hindi, English
   - 25+ UI strings translated
   - Automatic locale detection

7. ✅ **UI Components**
   - Shadcn UI base setup
   - Button, Card, Select components
   - Utility functions for formatting

8. ✅ **PWA Configuration**
   - Manifest.json
   - next-pwa setup
   - Service worker configuration

## 📋 Step-by-Step Setup Commands

### 1. Install All Dependencies

```bash
cd /home/chemicalmyth/Desktop/Maharashtra\ MGNREGA/mgnrega

# Install production dependencies
pnpm add framer-motion recharts tailwindcss-animate

# Verify all packages are installed
pnpm install
```

### 2. Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

**Required environment variables:**

```env
# Database (Get from Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# Redis (Use Upstash, Redis Cloud, or local Redis)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Data.gov.in API (Already provided)
DATA_GOV_API_KEY="579b464db66ec23bdd0000011b14954939de4eed5265d7c08c0b8631"
DATA_GOV_API_URL="https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722"

# Sentry (Optional - for error tracking)
SENTRY_DSN=""

# Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Secret (for scheduled tasks)
CRON_SECRET="your-random-secret-key-here"
```

### 3. Initialize Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Push schema to database (creates tables)
pnpm prisma db push

# Seed the database with Maharashtra districts
pnpm tsx prisma/seed.ts

# (Optional) Open Prisma Studio to view data
pnpm prisma studio
```

**Expected output:**
```
✅ Seeded 36 districts
```

### 4. Test Data Ingestion

**Important:** Before running this, verify:
1. Your DATABASE_URL is correct
2. The database tables exist
3. Districts are seeded

```bash
# Fetch MGNREGA data for Maharashtra
pnpm ingest --state=MH

# Or fetch specific period
pnpm ingest --state=MH --year=2024 --month=12
```

**Expected output:**
```
🚀 Starting MGNREGA data fetch...
📍 State: MH
🌐 Making request (attempt 1/6)...
📦 Fetched XX records (offset: 0)
✅ Data ingestion completed. Total records processed: XX
```

**Note:** If you get rate limiting errors (429), the script will automatically retry with exponential backoff.

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the API Endpoints

Once the server is running, test the API endpoints:

### List All Districts
```bash
curl http://localhost:3000/api/districts
```

### Get District with Stats
```bash
curl "http://localhost:3000/api/districts?includeStats=true"
```

### Get Latest Metrics for a District
First, get a district ID from the list above, then:
```bash
curl http://localhost:3000/api/districts/<DISTRICT_ID>/latest
```

### Get Historical Data
```bash
curl "http://localhost:3000/api/districts/<DISTRICT_ID>/history?from=2024-01&to=2024-12&limit=12"
```

### Compare Two Districts
```bash
curl "http://localhost:3000/api/compare?d1=<DISTRICT_ID_1>&d2=<DISTRICT_ID_2>&metric=personDaysGenerated&period=12"
```

### Get State-Level Aggregates
```bash
curl http://localhost:3000/api/state/latest
```

## 🔧 Optional Setup: Redis

### Option 1: Local Redis (Development)

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

Update `.env`:
```env
REDIS_URL="redis://localhost:6379"
```

### Option 2: Upstash (Free tier for development)

1. Go to [upstash.com](https://upstash.com)
2. Create a free account
3. Create a new Redis database
4. Copy the connection string

Update `.env`:
```env
REDIS_URL="rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379"
```

### Option 3: Redis Cloud

1. Go to [redis.com/cloud](https://redis.com/try-free/)
2. Create free account
3. Create database
4. Get connection details

**Note:** The app will work without Redis, but caching will be disabled.

## 📊 Optional Setup: Supabase Database

### Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to initialize (~2 minutes)
4. Go to Settings > Database
5. Copy the connection string (pooled)

Update `.env`:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## 🔍 Troubleshooting Common Issues

### Issue: "Module not found: Can't resolve '@prisma/client'"

**Solution:**
```bash
pnpm prisma generate
```

### Issue: "Error: P1001: Can't reach database server"

**Solution:**
1. Check DATABASE_URL is correct
2. Ensure database is running
3. Check firewall/network settings
4. Verify IP whitelist in Supabase (allow all: 0.0.0.0/0)

### Issue: "Redis connection failed"

**Solution:**
The app will work without Redis. To fix Redis:
1. Check REDIS_URL format
2. Verify Redis is running
3. Test connection: `redis-cli -u $REDIS_URL ping`

### Issue: Data ingestion fails with 401/403

**Solution:**
1. Verify DATA_GOV_API_KEY is correct
2. Check API endpoint URL
3. Test API directly:
   ```bash
   curl "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=579b464db66ec23bdd0000011b14954939de4eed5265d7c08c0b8631&format=json&limit=1"
   ```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### Issue: Build errors with Next.js

**Solution:**
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## 🎯 Next Steps: What's Missing

### High Priority (Core Features)

1. **Frontend Pages** - Create the actual UI pages:
   ```
   src/app/[locale]/page.tsx          # Home page with state overview
   src/app/[locale]/district/[id]/page.tsx  # District dashboard
   src/app/[locale]/compare/page.tsx  # Comparison view
   src/app/[locale]/settings/page.tsx # Settings
   ```

2. **District Selector Component**
   - Dropdown with search
   - Visual map (optional)
   - Auto-detect user location

3. **Charts and Visualizations**
   - Line charts for trends
   - Bar charts for comparisons
   - Metric cards with icons

4. **Audio Summarization**
   - Implement Web Speech API
   - Text-to-speech in all 3 languages
   - Play/pause/stop controls

### Medium Priority (Enhancement)

5. **Service Worker**
   - Offline caching with IndexedDB
   - Background sync
   - Cache-first strategy

6. **Testing**
   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests with Playwright

7. **CI/CD**
   - GitHub Actions workflow
   - Automated testing
   - Automatic deployment

### Low Priority (Nice to Have)

8. **Additional Features**
   - User accounts (optional)
   - Notifications
   - Data export (CSV/PDF)
   - Social sharing
   - Dark mode toggle

9. **Performance**
   - Image optimization
   - Code splitting
   - Lazy loading
   - Bundle analysis

10. **Monitoring**
    - Sentry integration
    - Analytics
    - Performance monitoring
    - Error tracking

## 📝 Verification Checklist

Run through this checklist to verify everything is working:

- [ ] Dependencies installed (`pnpm install` successful)
- [ ] Environment variables configured (`.env` file exists)
- [ ] Prisma client generated (`pnpm prisma generate`)
- [ ] Database schema pushed (`pnpm prisma db push`)
- [ ] Districts seeded (36 districts in database)
- [ ] Data ingestion works (`pnpm ingest --state=MH`)
- [ ] Development server runs (`pnpm dev`)
- [ ] API endpoints respond (test with curl/browser)
- [ ] Redis connected (or app works without it)
- [ ] No TypeScript errors (`pnpm build` passes)

## 🚀 Ready to Build!

Once you've completed the setup, you're ready to start building the frontend pages and additional features. The backend infrastructure is solid and production-ready!

### Suggested Development Order:

1. **Week 1**: Frontend pages (home, district dashboard)
2. **Week 2**: Comparison view, settings page
3. **Week 3**: Audio features, PWA/offline mode
4. **Week 4**: Testing, CI/CD, deployment

### Need Help?

- Check the main README.md
- Review API endpoint documentation
- Test APIs with Postman/Insomnia
- Check Prisma Studio for database state
- Monitor Redis with `redis-cli monitor`

---

**Happy Coding! 🎉**
