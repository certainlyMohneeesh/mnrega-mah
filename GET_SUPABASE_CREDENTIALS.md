# 🔑 How to Get Your Supabase Database Credentials

The database connection is failing because the credentials in `.env` are incorrect. Follow these steps to get the correct connection strings:

---

## Step 1: Go to Your Supabase Dashboard

1. Open your browser and go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Select your project: **`xkloyinolltxfnyxtuww`** (or whichever project you're using)

---

## Step 2: Navigate to Database Settings

1. In the left sidebar, click on **⚙️ Settings**
2. Click on **Database**
3. Scroll down to the **Connection string** section

---

## Step 3: Copy the Connection Strings

You'll see several connection string options. You need **TWO** different strings:

### A. Transaction Mode (for DATABASE_URL)

Look for **"Transaction"** or **"Session Pooling"** mode:

```
Format: postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

### B. Direct Connection (for DIRECT_URL)

Look for **"Direct connection"** mode:

```
Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

---

## Step 4: Get Your Database Password

If you don't have your database password:

1. In the same Database Settings page
2. Scroll to **"Database password"** section
3. Click **"Reset database password"** if needed
4. **⚠️ SAVE THE NEW PASSWORD IMMEDIATELY** - you won't be able to see it again!

---

## Step 5: Update Your .env File

Replace the connection strings in `/home/chemicalmyth/Desktop/Maharashtra MGNREGA/mgnrega/.env`:

```env
# Replace these two lines with your actual connection strings:
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Example (DO NOT COPY - use your own):

```env
DATABASE_URL="postgresql://postgres.abcdefghij:my_secure_password_123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:my_secure_password_123@db.abcdefghij.supabase.co:5432/postgres"
```

---

## Step 6: Test the Connection

After updating `.env`, test the connection:

```bash
cd /home/chemicalmyth/Desktop/Maharashtra\ MGNREGA/mgnrega
pnpm prisma db push
```

If successful, you should see:
```
✅ Your database is now in sync with your Prisma schema.
```

---

## Troubleshooting

### Error: "Tenant or user not found"
- **Cause:** Wrong project reference or password
- **Fix:** Double-check you copied the EXACT strings from Supabase dashboard

### Error: "Invalid port number"
- **Cause:** Wrong port in connection string
- **Fix:** 
  - Pooler connection uses port **6543**
  - Direct connection uses port **5432**

### Error: "Connection timeout"
- **Cause:** Firewall or network issue
- **Fix:** Make sure your Supabase project is active and accessible

### Error: "SSL required"
- **Cause:** Missing SSL mode
- **Fix:** Add `?sslmode=require` to the end of connection string

---

## Alternative: Use Connection Pooler Only

If you're having trouble with DIRECT_URL, you can use the pooler for everything (not recommended for production):

```env
DATABASE_URL="your-pooler-connection-string"
# DIRECT_URL="your-pooler-connection-string"  # Comment this out
```

Then in `prisma/schema.prisma`, comment out the `directUrl`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL")  // Comment this out
}
```

---

## Need Help?

1. **Supabase Documentation:** https://supabase.com/docs/guides/database/connecting-to-postgres
2. **Prisma + Supabase Guide:** https://www.prisma.io/docs/guides/database/supabase

---

**Once you've updated the credentials, run:**

```bash
pnpm prisma db push
pnpm tsx prisma/seed.ts
```

Good luck! 🚀
