import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCached, CacheKeys, CacheTTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/districts
 * Returns list of all Maharashtra districts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("includeStats") === "true";

    // Try to get from cache
    const cacheKey = includeStats ? `${CacheKeys.DISTRICT_LIST}:stats` : CacheKeys.DISTRICT_LIST;
    const cached = await getCached<any[]>(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Fetch from database
    const districts = await prisma.district.findMany({
      where: {
        stateCode: "MH",
      },
      orderBy: {
        name: "asc",
      },
      ...(includeStats && {
        include: {
          metrics: {
            orderBy: {
              dataDate: "desc",
            },
            take: 1,
          },
        },
      }),
    });

    // Transform data if stats are included
    const response = includeStats
      ? districts.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          nameHi: d.nameHi,
          nameMr: d.nameMr,
          latitude: d.latitude,
          longitude: d.longitude,
          latestMetric: d.metrics[0] || null,
        }))
      : districts;

    // Cache the response
    await setCached(cacheKey, response, CacheTTL.DISTRICT_LIST);

    return NextResponse.json({
      success: true,
      data: response,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching districts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch districts",
      },
      { status: 500 }
    );
  }
}
