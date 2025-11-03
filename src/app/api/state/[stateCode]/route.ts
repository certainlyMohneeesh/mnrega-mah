import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStateBySlug } from "@/lib/state-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/state/[stateCode]
 * Returns aggregated metrics for a specific state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stateCode: string } }
) {
  try {
    const { stateCode } = params;
    
    // Validate and get state info
    const stateInfo = getStateBySlug(stateCode);
    if (!stateInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid state code",
        },
        { status: 404 }
      );
    }

    // Get all districts for this state
    const districts = await prisma.district.findMany({
      where: {
        stateName: stateInfo.name,
      },
      include: {
        _count: {
          select: { metrics: true },
        },
      },
      orderBy: { name: "asc" },
    });

    console.log(`✅ Found ${districts.length} districts for ${stateInfo.displayName}`);

    // Get latest metrics for all districts in this state
    const latestMetrics = await Promise.all(
      districts.map(async (district) => {
        const metric = await prisma.monthlyMetric.findFirst({
          where: { districtId: district.id },
          orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
        });
        return metric;
      })
    );

    // Calculate aggregated state-level metrics
    const validMetrics = latestMetrics.filter((m) => m !== null);
    
    const stateMetrics = {
      totalExpenditure: validMetrics.reduce((sum, m) => sum + (m?.totalExpenditure || 0), 0),
      householdsWorked: validMetrics.reduce((sum, m) => sum + (m?.totalHouseholdsWorked || 0), 0),
      completedWorks: validMetrics.reduce((sum, m) => sum + (m?.numberOfCompletedWorks || 0), 0),
      ongoingWorks: validMetrics.reduce((sum, m) => sum + (m?.numberOfOngoingWorks || 0), 0),
      scPersonDays: validMetrics.reduce((sum, m) => sum + (m?.scPersonDays || 0), 0),
      stPersonDays: validMetrics.reduce((sum, m) => sum + (m?.stPersonDays || 0), 0),
      womenPersonDays: validMetrics.reduce((sum, m) => sum + (m?.womenPersonDays || 0), 0),
      totalDistricts: districts.length,
      districtsWithData: validMetrics.length,
    };

    // Get most recent update date
    const latestUpdate = validMetrics.reduce((latest, m) => {
      if (!m) return latest;
      const metricDate = m.createdAt;
      return !latest || metricDate > latest ? metricDate : latest;
    }, null as Date | null);

    return NextResponse.json(
      {
        success: true,
        data: {
          state: stateInfo,
          metrics: stateMetrics,
          lastUpdated: latestUpdate,
          districts: districts.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            metricsCount: d._count.metrics,
          })),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching state data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch state data",
      },
      { status: 500 }
    );
  }
}
