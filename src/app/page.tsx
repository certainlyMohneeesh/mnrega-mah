import { Suspense } from "react";
import { HomePageClient } from "@/components/home-page-client";
import { HomePageSkeleton } from "@/components/home-page-skeleton";

async function getInitialData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Fetch districts
    const districtsRes = await fetch(
      `${baseUrl}/api/districts?includeStats=true`,
      {
        next: { revalidate: 120 },
      }
    );

    // Fetch state-level aggregates
    const stateRes = await fetch(`${baseUrl}/api/state/latest`, {
      next: { revalidate: 180 },
    });

    const [districtsData, stateData] = await Promise.all([
      districtsRes.json(),
      stateRes.json()
    ]);

    return {
      districts: districtsData.success ? districtsData.data : [],
      stateStats: stateData.success ? stateData.data : null,
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
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
