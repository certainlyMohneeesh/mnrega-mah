import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/compare
 * Compare metrics between two districts
 * Query params: d1 (district id 1), d2 (district id 2), metric (metric name), period (number of months)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const d1 = searchParams.get("d1");
    const d2 = searchParams.get("d2");
    const metric = searchParams.get("metric") || "personDaysGenerated";
    const period = parseInt(searchParams.get("period") || "12");

    if (!d1 || !d2) {
      return NextResponse.json(
        {
          success: false,
          error: "Both d1 and d2 parameters are required",
        },
        { status: 400 }
      );
    }

    // Fetch both districts
    const [district1, district2] = await Promise.all([
      prisma.district.findUnique({
        where: { id: d1 },
        select: { id: true, code: true, name: true, stateCode: true, stateName: true },
      }),
      prisma.district.findUnique({
        where: { id: d2 },
        select: { id: true, code: true, name: true, stateCode: true, stateName: true },
      }),
    ]);

    if (!district1 || !district2) {
      return NextResponse.json(
        {
          success: false,
          error: "One or both districts not found",
        },
        { status: 404 }
      );
    }

    // Fetch metrics for both districts
    const [metrics1, metrics2] = await Promise.all([
      prisma.monthlyMetric.findMany({
        where: { districtId: d1 },
        orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
        take: Math.min(period, 24),
      }),
      prisma.monthlyMetric.findMany({
        where: { districtId: d2 },
        orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
        take: Math.min(period, 24),
      }),
    ]);

    // Calculate comparison statistics
    const getMetricValue = (m: any) => {
      const value = m[metric];
      return value ? (typeof value === "bigint" ? Number(value) : value) : 0;
    };

    const avg1 = metrics1.length > 0
      ? metrics1.reduce((sum: number, m: any) => sum + getMetricValue(m), 0) / metrics1.length
      : 0;

    const avg2 = metrics2.length > 0
      ? metrics2.reduce((sum: number, m: any) => sum + getMetricValue(m), 0) / metrics2.length
      : 0;

    const latest1 = metrics1[0] ? getMetricValue(metrics1[0]) : 0;
    const latest2 = metrics2[0] ? getMetricValue(metrics2[0]) : 0;

    const response = {
      comparison: {
        metric,
        period,
        district1: {
          ...district1,
          latest: latest1,
          average: Math.round(avg1),
          metrics: metrics1,
        },
        district2: {
          ...district2,
          latest: latest2,
          average: Math.round(avg2),
          metrics: metrics2,
        },
        difference: {
          latest: latest1 - latest2,
          average: Math.round(avg1 - avg2),
          percentDiff: avg2 !== 0 ? ((avg1 - avg2) / avg2) * 100 : 0,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("❌ Error comparing districts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compare districts",
      },
      { status: 500 }
    );
  }
}
