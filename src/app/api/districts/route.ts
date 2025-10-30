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
        stateCode: "18", // Maharashtra state code
      },
      orderBy: {
        name: "asc",
      },
    });

    // If stats are requested, fetch latest metrics for each district
    let response;
    if (includeStats) {
      const districtsWithStats = await Promise.all(
        districts.map(async (d) => {
          const latestMetric = await prisma.monthlyMetric.findFirst({
            where: { districtId: d.id },
            orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
          });
          return {
            ...d,
            latestMetric: latestMetric || null,
            _count: {
              metrics: await prisma.monthlyMetric.count({
                where: { districtId: d.id },
              }),
            },
          };
        })
      );
      response = districtsWithStats;
    } else {
      response = districts;
    }

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
