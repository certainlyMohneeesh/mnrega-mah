import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatePageClient } from "@/components/state-page-client";
import { getAllStateParams, getStateBySlug } from "@/lib/state-utils";
import { getBaseUrl } from "@/lib/api-utils";

// Generate static params for all states
export async function generateStaticParams() {
  return getAllStateParams();
}

// ISR: Revalidate every 12 hours (43200 seconds)
export const revalidate = 43200;

// Enable dynamic rendering for search functionality
export const dynamic = "force-static";

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

async function getStateData(stateCode: string, page: number = 1, limit: number = 15) {
  try {
    // Get base URL using centralized utility
    const baseUrl = getBaseUrl();

    console.log(`🌐 Fetching state data from: ${baseUrl}/api/state/${stateCode}`);

    // Fetch state metrics
    const stateResponse = await fetch(
      `${baseUrl}/api/state/${stateCode}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!stateResponse.ok) {
      console.error(`❌ State API failed with status: ${stateResponse.status}`);
      return null;
    }

    const stateData = await stateResponse.json();

    // Fetch paginated districts
    const districtsResponse = await fetch(
      `${baseUrl}/api/state/${stateCode}/districts?page=${page}&limit=${limit}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!districtsResponse.ok) {
      console.error(`❌ Districts API failed with status: ${districtsResponse.status}`);
      return null;
    }

    const districtsData = await districtsResponse.json();

    return {
      state: stateData.data.state,
      metrics: stateData.data.metrics,
      lastUpdated: stateData.data.lastUpdated,
      districts: districtsData.data.districts,
      pagination: districtsData.pagination,
    };
  } catch (error) {
    console.error("❌ Error fetching state data:", error);
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
