import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCached, CacheKeys, CacheTTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/districts/[id]/history
 * Returns historical metrics for a specific district
 * Query params: from (YYYY-MM), to (YYYY-MM), limit (number)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from"); // Format: YYYY-MM
    const to = searchParams.get("to"); // Format: YYYY-MM
    const limit = parseInt(searchParams.get("limit") || "12");

    // Validate district exists
    const district = await prisma.district.findUnique({
      where: { id },
      select: { id: true, code: true, name: true, nameHi: true, nameMr: true },
    });

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          error: "District not found",
        },
        { status: 404 }
      );
    }

    // Try to get from cache
    const cacheKey = CacheKeys.DISTRICT_HISTORY(id, from || undefined, to || undefined);
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Build date filters
    const dateFilters: any = {};
    if (from) {
      const [fromYear, fromMonth] = from.split("-").map(Number);
      dateFilters.OR = [
        { year: { gt: fromYear } },
        { AND: [{ year: fromYear }, { month: { gte: fromMonth } }] },
      ];
    }
    if (to) {
      const [toYear, toMonth] = to.split("-").map(Number);
      if (!dateFilters.OR) {
        dateFilters.OR = [];
      }
      dateFilters.AND = [
        {
          OR: [
            { year: { lt: toYear } },
            { AND: [{ year: toYear }, { month: { lte: toMonth } }] },
          ],
        },
      ];
    }

    // Fetch historical metrics
    const metrics = await prisma.monthlyMetric.findMany({
      where: {
        districtId: id,
        ...dateFilters,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: Math.min(limit, 100), // Cap at 100 records
    });

    const response = {
      district,
      metrics,
      count: metrics.length,
      filters: { from, to, limit },
    };

    // Cache the response
    await setCached(cacheKey, response, CacheTTL.HISTORY_METRICS);

    return NextResponse.json({
      success: true,
      data: response,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching district history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch district history",
      },
      { status: 500 }
    );
  }
}
