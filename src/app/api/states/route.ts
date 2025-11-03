import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ALL_INDIAN_STATES, stateNameToSlug } from "@/lib/state-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/states
 * Returns all states with aggregated metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all districts with their latest metrics
    const allDistricts = await prisma.district.findMany({
      include: {
        metrics: {
          orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
          take: 1,
        },
      },
    });

    // Create a map to aggregate district data by state name (not code)
    const stateDataMap = new Map<string, {
      districtCount: number;
      totalExpenditure: number;
      totalHouseholdsWorked: number;
      totalWorksCompleted: number;
      totalPersonDays: number;
    }>();

    // Aggregate district data by state name
    allDistricts.forEach((district) => {
      if (district.metrics.length > 0) {
        const latestMetric = district.metrics[0];
        const stateName = district.stateName.toUpperCase();
        
        if (!stateDataMap.has(stateName)) {
          stateDataMap.set(stateName, {
            districtCount: 0,
            totalExpenditure: 0,
            totalHouseholdsWorked: 0,
            totalWorksCompleted: 0,
            totalPersonDays: 0,
          });
        }

        const stateData = stateDataMap.get(stateName)!;
        stateData.districtCount += 1;
        stateData.totalExpenditure += latestMetric.totalExpenditure || 0;
        stateData.totalHouseholdsWorked += latestMetric.totalHouseholdsWorked || 0;
        stateData.totalWorksCompleted += latestMetric.numberOfCompletedWorks || 0;
        stateData.totalPersonDays += latestMetric.personDaysOfCentralLiability || 0;
      }
    });

    // Build final states array from ALL_INDIAN_STATES
    const states = ALL_INDIAN_STATES.map((state) => {
      const aggregatedData = stateDataMap.get(state.name) || {
        districtCount: 0,
        totalExpenditure: 0,
        totalHouseholdsWorked: 0,
        totalWorksCompleted: 0,
        totalPersonDays: 0,
      };

      return {
        code: state.code,
        name: state.name,
        displayName: state.displayName,
        slug: stateNameToSlug(state.name),
        districtCount: aggregatedData.districtCount,
        totalExpenditure: aggregatedData.totalExpenditure,
        totalHouseholdsWorked: aggregatedData.totalHouseholdsWorked,
        totalWorksCompleted: aggregatedData.totalWorksCompleted,
        totalPersonDays: aggregatedData.totalPersonDays,
        hasData: aggregatedData.districtCount > 0,
      };
    }).sort((a, b) => b.totalExpenditure - a.totalExpenditure); // Sort by expenditure

    return NextResponse.json({
      success: true,
      data: states,
      total: states.length,
    });
  } catch (error) {
    console.error("❌ Error fetching states data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch states data",
      },
      { status: 500 }
    );
  }
}
