import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/districts/[id]/latest
 * Returns the latest metrics for a specific district
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch district
    const district = await prisma.district.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        stateCode: true,
        stateName: true,
        createdAt: true,
        updatedAt: true,
      },
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

    // Fetch latest metric
    const latestMetric = await prisma.monthlyMetric.findFirst({
      where: { districtId: id },
      orderBy: [
        { finYear: "desc" },
        { createdAt: "desc" },
      ],
    });

    const response = {
      district,
      latestMetric: latestMetric || null,
      lastUpdated: latestMetric?.updatedAt || null,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("❌ Error fetching latest metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch latest metrics",
      },
      { status: 500 }
    );
  }
}
