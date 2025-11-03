/**
 * Simple health check for daily sync endpoint
 * Tests if the route is accessible without running full sync
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";

export async function GET(request: NextRequest) {
  // Check authorization
  const authHeader = request.headers.get("authorization");
  const urlSecret = request.nextUrl.searchParams.get("secret");

  if (authHeader !== `Bearer ${CRON_SECRET}` && urlSecret !== CRON_SECRET) {
    return NextResponse.json({ 
      error: "Unauthorized",
      hint: "Provide Authorization header or ?secret= parameter"
    }, { status: 401 });
  }

  return NextResponse.json({
    status: "ok",
    message: "Daily sync endpoint is accessible",
    endpoint: "/api/cron/daily-sync-optimized",
    timestamp: new Date().toISOString(),
    config: {
      hasCronSecret: !!CRON_SECRET,
      hasApiKey: !!process.env.DATA_GOV_API_KEY,
      maxDuration: 300,
    },
    instructions: {
      testEndpoint: "GET /api/cron/daily-sync-optimized/health",
      runSync: "GET /api/cron/daily-sync-optimized (with auth)",
    }
  });
}
