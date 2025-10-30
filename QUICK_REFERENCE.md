# 🚀 Quick Reference - Maharashtra MGNREGA Dashboard

## 📋 Installation Commands

```bash
# Navigate to project
cd /home/chemicalmyth/Desktop/Maharashtra\ MGNREGA/mgnrega

# Install all dependencies
pnpm install

# Install missing dependencies
pnpm add framer-motion recharts tailwindcss-animate
```

## 🗄️ Database Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Push schema to database (no migrations)
pnpm prisma db push

# Create and apply migration
pnpm prisma migrate dev --name init

# Seed database with districts
pnpm tsx prisma/seed.ts

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

## 📥 Data Ingestion Commands

```bash
# Fetch all Maharashtra data
pnpm ingest --state=MH

# Fetch specific year
pnpm ingest --state=MH --year=2024

# Fetch specific month
pnpm ingest --state=MH --year=2024 --month=12
```

## 🔧 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3000/api`

```bash
# List all districts
curl http://localhost:3000/api/districts

# List districts with stats
curl "http://localhost:3000/api/districts?includeStats=true"

# Get latest metrics for a district
curl http://localhost:3000/api/districts/{DISTRICT_ID}/latest

# Get historical data
curl "http://localhost:3000/api/districts/{DISTRICT_ID}/history?from=2024-01&to=2024-12&limit=12"

# Compare two districts
curl "http://localhost:3000/api/compare?d1={ID1}&d2={ID2}&metric=personDaysGenerated&period=12"

# Get state-level aggregates
curl http://localhost:3000/api/state/latest
```

## 🔐 Environment Variables

### Required in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

## 🧪 Testing Redis

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Monitor Redis commands
redis-cli monitor

# Check specific key
redis-cli get "districts:all"

# List all keys
redis-cli keys "*"

# Flush all Redis data (⚠️ clears everything)
redis-cli flushall
```

## 📊 Database Queries

### Via Prisma Studio:
```bash
pnpm prisma studio
```

### Via psql (PostgreSQL CLI):
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# View districts
SELECT * FROM districts LIMIT 10;

# View metrics
SELECT * FROM monthly_metrics ORDER BY data_date DESC LIMIT 10;

# Count records
SELECT COUNT(*) FROM monthly_metrics;

# Exit
\q
```

## 🐛 Troubleshooting Commands

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules && pnpm install

# Check TypeScript errors
pnpm tsc --noEmit

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Check process on port
lsof -i :3000

# View logs
tail -f /var/log/redis/redis-server.log  # Redis logs
```

## 📦 Deployment to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## 🔍 Useful Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: add feature description"

# Push
git push origin main

# View commit history
git log --oneline --graph
```

## 📈 Performance Monitoring

```bash
# Analyze bundle size
pnpm build
# Check .next/analyze/*

# Check build output
pnpm build --profile

# Test production build locally
pnpm build && pnpm start
```

## 🎨 Code Quality

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint --fix

# Format with Prettier
pnpm format

# Check formatting
npx prettier --check "src/**/*.{ts,tsx}"
```

## 🔄 Cache Management

```bash
# Clear Redis cache (via Node)
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.flushall().then(() => { console.log('Cache cleared'); process.exit(); });"

# Or via redis-cli
redis-cli flushall
```

## 📁 Project Structure Quick Reference

```
mgnrega/
├── prisma/              # Database schema & seeds
│   ├── schema.prisma    # DB models
│   └── seed.ts          # Seed script
├── scripts/             # Data ingestion
│   └── fetch-mgnrega.ts
├── src/
│   ├── app/
│   │   ├── api/        # API routes
│   │   └── [locale]/   # Localized pages
│   ├── components/ui/  # UI components
│   ├── lib/            # Utilities
│   │   ├── prisma.ts   # DB client
│   │   ├── redis.ts    # Cache client
│   │   └── utils.ts    # Helpers
│   ├── i18n.ts         # i18n config
│   └── middleware.ts   # Next.js middleware
├── messages/           # Translations
│   ├── en.json
│   ├── hi.json
│   └── mr.json
├── public/             # Static files
├── .env               # Environment vars
├── next.config.ts     # Next.js config
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

## 🆘 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Prisma Client not found | `pnpm prisma generate` |
| Database connection error | Check `DATABASE_URL` in `.env` |
| Redis connection failed | App works without Redis |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Build errors | `rm -rf .next && pnpm install` |
| TypeScript errors | `pnpm prisma generate` |
| Missing dependencies | `pnpm install` |

## 📞 Support Resources

- **Documentation**: `README.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **API Docs**: `README.md#api-endpoints`
- **Database Schema**: `prisma/schema.prisma`

---

**Keep this file handy for quick command reference! 📌**
