import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCached, CacheKeys, CacheTTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/districts/[id]
 * Returns detailed information for a specific district including all metrics
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error(`❌ Invalid district ID: "${id}"`);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid district ID",
        },
        { status: 400 }
      );
    }

    // Try to get from cache
    const cacheKey = CacheKeys.DISTRICT_BY_ID(id);
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      // Verify cached data has metrics
      if (cached.metrics && cached.metrics.length > 0) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        });
      }
      // Invalid cache, don't return it
      console.warn(`⚠️ Cached district ${id} has no metrics, refetching`);
    }

    // First, check if district exists at all
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: [
            { finYear: "desc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!district) {
      console.error(`❌ District ${id} not found in database`);
      return NextResponse.json(
        {
          success: false,
          error: "District not found",
        },
        { status: 404 }
      );
    }

    // Check if metrics exist
    if (!district.metrics || district.metrics.length === 0) {
      console.warn(`⚠️ District ${id} (${district.name}) exists but has no metrics`);
      // Return district anyway but with empty metrics array
      // This is better than 404
    }

    // Cache the valid response
    await setCached(cacheKey, district, CacheTTL.DISTRICT_DETAIL);

    console.log(`✅ Successfully fetched district ${district.name} with ${district.metrics.length} metrics`);

    return NextResponse.json({
      success: true,
      data: district,
      cached: false,
    });
  } catch (error) {
    console.error(`❌ Error fetching district:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch district",
      },
      { status: 500 }
    );
  }
}
