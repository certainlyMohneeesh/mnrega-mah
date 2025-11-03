/**
 * Debug endpoint to verify cron API routing works
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    status: "ok",
    message: "Cron API routing is working",
    endpoint: "/api/cron/debug",
    timestamp,
    env: {
      hasCronSecret: !!process.env.CRON_SECRET,
      hasApiKey: !!process.env.DATA_GOV_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
    vercel: {
      region: process.env.VERCEL_REGION || "unknown",
      deployment: process.env.VERCEL_URL || "local",
    }
  });
}
