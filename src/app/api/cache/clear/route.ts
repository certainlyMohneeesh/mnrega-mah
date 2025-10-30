import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * POST /api/cache/clear
 * Clear all Redis cache (development only)
 */
export async function POST() {
  try {
    if (!redis) {
      return NextResponse.json(
        {
          success: false,
          error: "Redis not available",
        },
        { status: 500 }
      );
    }

    // Clear all keys matching our patterns
    const patterns = [
      "districts:*",
      "district:*",
      "compare:*",
      "state:*",
    ];

    let deletedCount = 0;
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount} cache entries`,
      deletedCount,
    });
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cache",
      },
      { status: 500 }
    );
  }
}
