import { Suspense } from "react";
import { HomePageClient } from "@/components/home-page-client";
import { HomePageSkeleton } from "@/components/home-page-skeleton";
import { getBaseUrl } from "@/lib/api-utils";

async function getInitialData() {
  try {
    // Get base URL using centralized utility
    const baseUrl = getBaseUrl();
    
    console.log('🔍 Fetching districts from:', baseUrl);
    
    // Fetch districts with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const districtsRes = await fetch(
      `${baseUrl}/api/districts?includeStats=true`,
      {
        signal: controller.signal,
        next: { revalidate: 120 },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    // Fetch state-level aggregates
    const stateController = new AbortController();
    const stateTimeoutId = setTimeout(() => stateController.abort(), 8000);
    
    const stateRes = await fetch(`${baseUrl}/api/state/latest`, {
      signal: stateController.signal,
      next: { revalidate: 180 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(stateTimeoutId);

    const [districtsData, stateData] = await Promise.all([
      districtsRes.json(),
      stateRes.json()
    ]);

    console.log('✅ Districts fetched:', districtsData.success ? districtsData.data.length : 0);
    console.log('✅ State data fetched:', stateData.success);

    return {
      districts: districtsData.success ? districtsData.data : [],
      stateStats: stateData.success ? stateData.data : null,
    };
  } catch (error) {
    console.error('❌ Failed to fetch initial data:', error);
    return {
      districts: [],
      stateStats: null,
    };
  }
}

export default async function Home() {
  const initialData = await getInitialData();

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient initialData={initialData} />
    </Suspense>
  );
}
