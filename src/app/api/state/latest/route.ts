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
      where: { stateCode: "18" }, // Maharashtra
    });

    // Fetch latest metrics for each district
    const districtMetrics = await Promise.all(
      districts.map(async (d) => {
        const latestMetric = await prisma.monthlyMetric.findFirst({
          where: { districtId: d.id },
          orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
        });
        return { district: d, metric: latestMetric };
      })
    );

    // Aggregate metrics based on actual CSV data structure
    let totalExpenditure = 0;
    let totalWages = 0;
    let totalWorksCompleted = 0;
    let totalWorksOngoing = 0;
    let totalWorksTakenUp = 0;
    let totalHouseholdsWorked = 0;
    let totalIndividualsWorked = 0;
    let totalPersonDays = 0;
    let totalWomenPersonDays = 0;
    let totalScPersonDays = 0;
    let totalStPersonDays = 0;
    let districtsWithData = 0;
    let latestUpdate: Date | null = null;

    for (const { metric } of districtMetrics) {
      if (metric) {
        districtsWithData++;
        totalExpenditure += metric.totalExpenditure || 0;
        totalWages += metric.wages || 0;
        totalWorksCompleted += metric.numberOfCompletedWorks || 0;
        totalWorksOngoing += metric.numberOfOngoingWorks || 0;
        totalWorksTakenUp += metric.numberOfWorksTakenUp || 0;
        totalHouseholdsWorked += metric.totalHouseholdsWorked || 0;
        totalIndividualsWorked += metric.totalIndividualsWorked || 0;
        totalPersonDays += metric.personDaysOfCentralLiability || 0;
        totalWomenPersonDays += metric.womenPersonDays || 0;
        totalScPersonDays += metric.scPersonDays || 0;
        totalStPersonDays += metric.stPersonDays || 0;

        if (!latestUpdate || metric.updatedAt > latestUpdate) {
          latestUpdate = metric.updatedAt;
        }
      }
    }

    const response = {
      state: {
        code: "18",
        name: "MAHARASHTRA",
      },
      aggregates: {
        totalDistricts: districts.length,
        districtsWithData,
        totalExpenditure: Math.round(totalExpenditure * 100) / 100, // Lakhs
        totalWages: Math.round(totalWages * 100) / 100, // Lakhs
        worksCompleted: totalWorksCompleted,
        worksOngoing: totalWorksOngoing,
        worksTakenUp: totalWorksTakenUp,
        householdsWorked: totalHouseholdsWorked,
        individualsWorked: totalIndividualsWorked,
        personDaysGenerated: Math.round(totalPersonDays * 100) / 100,
        womenPersonDays: Math.round(totalWomenPersonDays * 100) / 100,
        scPersonDays: Math.round(totalScPersonDays * 100) / 100,
        stPersonDays: Math.round(totalStPersonDays * 100) / 100,
        avgExpenditurePerDistrict: districtsWithData > 0 
          ? Math.round((totalExpenditure / districtsWithData) * 100) / 100
          : 0,
      },
      lastUpdated: latestUpdate,
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
