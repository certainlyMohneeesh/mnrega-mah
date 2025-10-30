import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare-page-client";
import { ComparePageSkeleton } from "@/components/compare-page-skeleton";

interface PageProps {
  searchParams: Promise<{ d1?: string; d2?: string }>;
}

async function getDistrictsData(d1?: string, d2?: string) {
  if (!d1 && !d2) {
    return { districts: [], error: null };
  }

  try {
    // Use Vercel URL in production, localhost in development
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const promises = [];

    if (d1) {
      promises.push(
        fetch(`${baseUrl}/api/districts/${d1}`, { next: { revalidate: 120 } })
          .then(res => res.json())
      );
    }

    if (d2) {
      promises.push(
        fetch(`${baseUrl}/api/districts/${d2}`, { next: { revalidate: 120 } })
          .then(res => res.json())
      );
    }

    const results = await Promise.all(promises);
    const districts = results
      .filter(r => r.success)
      .map(r => r.data);

    return { districts, error: null };
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    return { districts: [], error: 'Failed to load districts' };
  }
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialData = await getDistrictsData(params.d1, params.d2);

  return (
    <Suspense fallback={<ComparePageSkeleton />}>
      <ComparePageClient 
        initialDistricts={initialData.districts}
        d1={params.d1}
        d2={params.d2}
      />
    </Suspense>
  );
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  
  if (!params.d1 && !params.d2) {
    return {
      title: 'Compare Districts - MGNREGA Dashboard',
      description: 'Compare MGNREGA metrics across Maharashtra districts',
    };
  }

  return {
    title: 'Compare Districts - MGNREGA Dashboard',
    description: 'Side-by-side comparison of MGNREGA employment and expenditure data',
  };
}
