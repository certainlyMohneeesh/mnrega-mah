import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStateBySlug } from "@/lib/state-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/state/[stateCode]/districts
 * Returns paginated districts for a specific state with their latest metrics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stateCode: string } }
) {
  try {
    const { stateCode } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search");

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

    // Build where clause
    const where: any = {
      stateName: stateInfo.name,
      metrics: {
        some: {} // Only include districts that have at least one metric
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch total count
    const totalCount = await prisma.district.count({ where });

    // Fetch paginated districts
    const districts = await prisma.district.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    console.log(`✅ Found ${districts.length} districts for ${stateInfo.displayName} (page ${page}/${Math.ceil(totalCount / limit)})`);

    // Fetch latest metrics for each district
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

    return NextResponse.json(
      {
        success: true,
        data: {
          state: stateInfo,
          districts: districtsWithStats,
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page < Math.ceil(totalCount / limit)
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching state districts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch state districts",
      },
      { status: 500 }
    );
  }
}
