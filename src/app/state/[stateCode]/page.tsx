import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatePageClient } from "@/components/state-page-client";
import { getAllStateParams, getStateBySlug } from "@/lib/state-utils";
import { headers } from "next/headers";

// Generate static params for all states
export async function generateStaticParams() {
  return getAllStateParams();
}

// ISR: Revalidate every 12 hours (43200 seconds)
export const revalidate = 43200;

// Use static generation with ISR for optimal performance
export const dynamic = "auto";

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
 * Get the base URL for server-side API calls
 * This handles both development and production (Vercel) environments
 */
function getServerSideBaseUrl(): string {
  // Production: Use VERCEL_URL or NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Development fallback
  return "http://localhost:3000";
}

async function getStateData(stateCode: string, page: number = 1, limit: number = 15) {
  try {
    // Get the base URL for this request
    const baseUrl = getServerSideBaseUrl();
    
    const stateApiUrl = `${baseUrl}/api/state/${stateCode}`;
    const districtsApiUrl = `${baseUrl}/api/state/${stateCode}/districts?page=${page}&limit=${limit}`;

    console.log(`🌐 Fetching state data from: ${stateApiUrl}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}, Vercel URL: ${process.env.VERCEL_URL || 'not set'}`);

    // Fetch state metrics
    const stateResponse = await fetch(
      stateApiUrl,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!stateResponse.ok) {
      console.error(`❌ State API failed with status: ${stateResponse.status}`);
      const errorText = await stateResponse.text();
      console.error(`❌ Error details: ${errorText}`);
      return null;
    }

    const stateData = await stateResponse.json();

    // Fetch paginated districts
    const districtsResponse = await fetch(
      districtsApiUrl,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!districtsResponse.ok) {
      console.error(`❌ Districts API failed with status: ${districtsResponse.status}`);
      const errorText = await districtsResponse.text();
      console.error(`❌ Error details: ${errorText}`);
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
