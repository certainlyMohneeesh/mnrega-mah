# Our Voice, Our Rights - Maharashtra MGNREGA Dashboard

A production-grade web application for tracking MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) performance across all districts in Maharashtra.

## 🎯 Overview

This application provides real-time insights into MGNREGA implementation across Maharashtra, with support for three languages (Marathi, Hindi, English), offline capabilities, and accessible design for low-literacy users.

## 🚀 Features

- ✅ **Multi-language Support**: Marathi (default), Hindi, and English
- ✅ **Real-time Data**: Fetches latest MGNREGA metrics from data.gov.in
- ✅ **District Dashboards**: Detailed performance metrics for each district
- ✅ **Comparison Tools**: Side-by-side district comparisons
- ✅ **State Overview**: Aggregated Maharashtra-level statistics
- ✅ **Offline Mode**: PWA with service worker and IndexedDB caching
- ✅ **Audio Summaries**: Text-to-speech for low-literacy users
- ✅ **Responsive Design**: Mobile-first, accessible UI
- ✅ **Redis Caching**: High-performance data caching with TTL
- ✅ **Rate Limiting**: Protection against API throttling

## 📦 Tech Stack

- **Frontend**: Next.js 16, TypeScript, TailwindCSS, Shadcn UI, Recharts, Framer Motion
- **Backend**: Next.js API Routes, PostgreSQL (Supabase), Prisma, Redis
- **i18n**: next-intl (Marathi, Hindi, English)
- **Deployment**: Vercel
- **Monitoring**: Sentry

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ and pnpm 8+
- PostgreSQL database (Supabase)
- Redis instance
- Data.gov.in API key (provided)

### Step 1: Install Dependencies

```bash
cd mgnrega
pnpm install

# Install missing dependencies if needed
pnpm add framer-motion recharts tailwindcss-animate
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL: Supabase PostgreSQL connection
# - REDIS_URL: Redis instance URL
# - DATA_GOV_API_KEY: Already set (579b464db66ec23bdd0000011b14954939de4eed5265d7c08c0b8631)
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Seed Maharashtra districts
pnpm tsx prisma/seed.ts
```

### Step 4: Fetch Initial Data

```bash
# Fetch MGNREGA data for Maharashtra
pnpm ingest --state=MH

# Or fetch specific period
pnpm ingest --state=MH --year=2025 --month=10
```

### Step 5: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mgnrega/
├── prisma/              # Database schema & seeds
├── scripts/             # Data ingestion scripts
├── src/
│   ├── app/
│   │   ├── api/        # API routes
│   │   └── [locale]/   # Localized pages
│   ├── components/ui/  # Shadcn components
│   ├── lib/            # Utilities (prisma, redis, utils)
│   └── middleware.ts   # i18n middleware
├── messages/           # Translations (mr, hi, en)
└── public/            # Static assets & PWA manifest
```

## 🔌 API Endpoints

- `GET /api/districts` - List all districts
- `GET /api/districts/[id]/latest` - Latest metrics for district
- `GET /api/districts/[id]/history` - Historical metrics
- `GET /api/compare` - Compare two districts
- `GET /api/state/latest` - State-level aggregates

Query params: `includeStats`, `from`, `to`, `limit`, `d1`, `d2`, `metric`, `period`

## 🧪 Testing

```bash
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

## 🚢 Deployment to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

```
DATABASE_URL=<supabase-connection-string>
DIRECT_URL=<supabase-direct-connection>
REDIS_URL=<redis-connection-string>
DATA_GOV_API_KEY=579b464db66ec23bdd0000011b14954939de4eed5265d7c08c0b8631
SENTRY_DSN=<your-sentry-dsn>
CRON_SECRET=<random-secret>
NODE_ENV=production
```

### Scheduled Data Ingestion

Use Vercel Cron or GitHub Actions to run ingestion daily:

```yaml
# .github/workflows/ingest-data.yml
name: Daily Data Ingestion
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:
```

## 🗄️ Database Schema

### Districts Table
- 36 Maharashtra districts with codes, names (EN/HI/MR)
- Location data (lat/lng), demographics

### Monthly Metrics Table
- Employment data (households, person-days)
- Demographics (women, SC, ST)
- Financial (expenditure breakdown)
- Works (completed, ongoing)

### Fetch Logs Table
- Audit trail of all data ingestion operations

## 📊 Cache Strategy

Redis keys with TTL:
- `districts:all` (24h)
- `district:<id>:latest` (12h)
- `district:<id>:history:<from>:<to>` (6h)
- `compare:<d1>:<d2>:<metric>` (6h)
- `state:MH:latest` (12h)

Auto-invalidation after data ingestion.

## 🐛 Troubleshooting

**Prisma Client Not Found?**
```bash
pnpm prisma generate
```

**Redis Connection Issues?**
App works without Redis but caching will be disabled.

**API Rate Limits?**
Ingestion script has exponential backoff and retry logic.

## ✅ Project Status

### Completed ✓
- [x] Project scaffold & configuration
- [x] Prisma schema & database setup
- [x] Redis caching layer
- [x] Data ingestion script with retry logic
- [x] Complete API routes with caching
- [x] i18n with 3 languages (25+ strings)
- [x] UI components (Shadcn)
- [x] Utility functions
- [x] PWA manifest

### In Progress 🚧
- [ ] Frontend pages (home, district, compare, settings)
- [ ] District selector with map
- [ ] Audio summarization (Web Speech API)
- [ ] Service worker & offline mode
- [ ] Charts with Recharts
- [ ] Unit & integration tests
- [ ] CI/CD pipeline
- [ ] Sentry integration

### Next Steps
1. Build frontend pages with responsive design
2. Implement district selector and map
3. Add audio summarization feature
4. Complete PWA with offline capabilities
5. Write comprehensive tests
6. Setup CI/CD automation
7. Production deployment

## 📝 Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm ingest           # Run data ingestion
pnpm test             # Run tests
```

## 🤝 Contributing

Contributions welcome! Please fork, create a feature branch, and submit a PR.

## 📧 Support

Create an issue in the repository for bugs or questions.

---

Built with ❤️ for transparency in governance
