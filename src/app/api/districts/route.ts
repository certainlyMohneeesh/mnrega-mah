import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/districts
 * Returns list of all districts with pagination and filtering
 * Query params: page, limit, stateCode, stateName, search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("includeStats") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const stateCode = searchParams.get("stateCode");
    const stateName = searchParams.get("stateName");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      metrics: {
        some: {} // Only include districts that have at least one metric
      }
    };

    if (stateCode) {
      where.stateCode = stateCode;
    }
    if (stateName) {
      where.stateName = {
        contains: stateName,
        mode: 'insensitive'
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { stateName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch total count
    const totalCount = await prisma.district.count({ where });

    // Fetch paginated districts
    const districts = await prisma.district.findMany({
      where,
      orderBy: [
        { stateName: "asc" },
        { name: "asc" }
      ],
      skip,
      take: limit,
    });

    console.log(`✅ Found ${districts.length} districts (page ${page}/${Math.ceil(totalCount / limit)}, total: ${totalCount})`);

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

    return NextResponse.json(
      {
        success: true,
        data: response,
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
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
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
