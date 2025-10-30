import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCached, CacheKeys, CacheTTL } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * GET /api/state/latest
 * Returns aggregated state-level (Maharashtra) metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get from cache
    const cacheKey = CacheKeys.STATE_LATEST;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Get all Maharashtra districts
    const districts = await prisma.district.findMany({
      where: { stateCode: "MH" },
      include: {
        metrics: {
          orderBy: { dataDate: "desc" },
          take: 1,
        },
      },
    });

    // Aggregate metrics
    let totalHouseholdsIssued = 0;
    let totalHouseholdsEmployed = 0;
    let totalPersonDays = BigInt(0);
    let totalWomenPersonDays = BigInt(0);
    let totalExpenditure = BigInt(0);
    let totalWageExpenditure = BigInt(0);
    let totalWorksCompleted = 0;
    let totalWorksOngoing = 0;
    let districtsWithData = 0;
    let latestDataDate: Date | null = null;

    for (const district of districts) {
      const metric = district.metrics[0];
      if (metric) {
        districtsWithData++;
        totalHouseholdsIssued += metric.householdsIssued || 0;
        totalHouseholdsEmployed += metric.householdsEmployed || 0;
        totalPersonDays += metric.personDaysGenerated || BigInt(0);
        totalWomenPersonDays += metric.womenPersonDays || BigInt(0);
        totalExpenditure += metric.totalExpenditure || BigInt(0);
        totalWageExpenditure += metric.wageExpenditure || BigInt(0);
        totalWorksCompleted += metric.worksCompleted || 0;
        totalWorksOngoing += metric.worksOngoing || 0;

        if (!latestDataDate || metric.dataDate > latestDataDate) {
          latestDataDate = metric.dataDate;
        }
      }
    }

    const response = {
      state: {
        code: "MH",
        name: "Maharashtra",
      },
      aggregates: {
        totalDistricts: districts.length,
        districtsWithData,
        householdsIssued: totalHouseholdsIssued,
        householdsEmployed: totalHouseholdsEmployed,
        personDaysGenerated: totalPersonDays.toString(),
        womenPersonDays: totalWomenPersonDays.toString(),
        totalExpenditure: totalExpenditure.toString(),
        wageExpenditure: totalWageExpenditure.toString(),
        worksCompleted: totalWorksCompleted,
        worksOngoing: totalWorksOngoing,
        avgPersonDaysPerDistrict: districtsWithData > 0 
          ? Number(totalPersonDays) / districtsWithData 
          : 0,
      },
      lastUpdated: latestDataDate,
    };

    // Cache the response
    await setCached(cacheKey, response, CacheTTL.STATE_AGGREGATES);

    return NextResponse.json({
      success: true,
      data: response,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching state metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch state metrics",
      },
      { status: 500 }
    );
  }
}
