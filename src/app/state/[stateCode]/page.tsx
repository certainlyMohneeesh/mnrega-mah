import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatePageClient } from "@/components/state-page-client";
import { getAllStateParams, getStateBySlug } from "@/lib/state-utils";
import prisma from "@/lib/prisma";

// IMPORTANT: Don't use generateStaticParams with VERCEL_URL
// It causes build-time generation where VERCEL_URL is not available
// Instead, we use dynamic rendering with caching

// Force dynamic rendering to ensure VERCEL_URL is available
export const dynamic = "force-dynamic";

// Cache the page for 12 hours (ISR-like behavior)
export const revalidate = 43200;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateCode: string }>;
}): Promise<Metadata> {
  const { stateCode } = await params;
  const stateInfo = getStateBySlug(stateCode);

  if (!stateInfo) {
    return {
      title: "State Not Found",
    };
  }

  return {
    title: `${stateInfo.displayName} - MGNREGA Dashboard`,
    description: `Track MGNREGA employment and expenditure data across all districts of ${stateInfo.displayName}. View real-time metrics, statistics, and district-level information.`,
    openGraph: {
      title: `${stateInfo.displayName} - MGNREGA Dashboard`,
      description: `MGNREGA employment and expenditure data for ${stateInfo.displayName}`,
      type: "website",
    },
  };
}

/**
 * DIRECT DATABASE QUERY - NO API CALLS
 * This bypasses the need for HTTP requests and VERCEL_URL entirely
 * Works perfectly in all environments (localhost, preview, production)
 */
async function getStateData(stateCode: string, page: number = 1, limit: number = 15) {
  try {
    console.log(`🔍 Loading state data for: ${stateCode}`);
    
    // Get state info from slug
    const stateInfo = getStateBySlug(stateCode);
    if (!stateInfo) {
      console.error(`❌ Invalid state code: ${stateCode}`);
      return null;
    }

    console.log(`✅ State found: ${stateInfo.displayName}`);

    // Get all districts for this state from database
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

    console.log(`✅ Found ${districts.length} districts`);

    // Get latest metrics for all districts
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

    // Paginate districts
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDistricts = districts.slice(startIndex, endIndex);

    // Get metrics for paginated districts
    const districtsWithMetrics = await Promise.all(
      paginatedDistricts.map(async (district) => {
        const latestMetric = await prisma.monthlyMetric.findFirst({
          where: { districtId: district.id },
          orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
        });

        return {
          id: district.id,
          code: district.code,
          name: district.name,
          stateName: district.stateName,
          stateCode: stateCode, // Add stateCode
          latestMetric: latestMetric ? {
            totalExpenditure: latestMetric.totalExpenditure ?? 0,
            totalHouseholdsWorked: latestMetric.totalHouseholdsWorked ?? 0,
            numberOfCompletedWorks: latestMetric.numberOfCompletedWorks ?? 0,
            numberOfOngoingWorks: latestMetric.numberOfOngoingWorks ?? 0,
            finYear: latestMetric.finYear,
            month: latestMetric.month,
          } : null,
          _count: {
            metrics: district._count.metrics,
          },
        };
      })
    );

    console.log(`✅ State data loaded successfully`);

    return {
      state: stateInfo,
      metrics: stateMetrics,
      lastUpdated: latestUpdate ? latestUpdate.toISOString() : null,
      districts: districtsWithMetrics,
      pagination: {
        page: page,
        limit: limit,
        total: districts.length,
        totalPages: Math.ceil(districts.length / limit),
        hasMore: endIndex < districts.length,
      },
    };
  } catch (error) {
    console.error("❌ Error loading state data:", error);
    return null;
  }
}

export default async function StatePage({
  params,
  searchParams,
}: {
  params: Promise<{ stateCode: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { stateCode } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");
  const data = await getStateData(stateCode, page);

  if (!data) {
    notFound();
  }

  return (
    <StatePageClient
      initialData={{
        state: data.state,
        districts: data.districts,
        metrics: data.metrics,
        lastUpdated: data.lastUpdated,
      }}
      pagination={data.pagination}
    />
  );
}
