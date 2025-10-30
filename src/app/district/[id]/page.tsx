import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DistrictDashboard } from "@/components/district-dashboard";
import { DistrictDashboardSkeleton } from "@/components/district-dashboard-skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getDistrictData(id: string) {
  try {
    // In production on Vercel, use absolute URL with the deployment domain
    // In development, use localhost
    const isProduction = process.env.VERCEL_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://mnrega-mah.vercel.app' 
      : 'http://localhost:3000';
    
    console.log('🔍 Fetching district from:', `${baseUrl}/api/districts/${id}`);
    
    // Fetch district details with all metrics
    const districtRes = await fetch(`${baseUrl}/api/districts/${id}`, {
      next: { revalidate: 120 },
    });

    if (!districtRes.ok) {
      console.log('❌ District fetch failed:', districtRes.status);
      return null;
    }

    const districtData = await districtRes.json();
    
    if (!districtData.success) {
      return null;
    }

    return districtData.data;
  } catch (error) {
    console.error('Failed to fetch district data:', error);
    return null;
  }
}

export default async function DistrictPage({ params }: PageProps) {
  const { id } = await params;
  const district = await getDistrictData(id);

  if (!district) {
    notFound();
  }

  return (
    <Suspense fallback={<DistrictDashboardSkeleton />}>
      <DistrictDashboard district={district} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const district = await getDistrictData(id);

  if (!district) {
    return {
      title: 'District Not Found',
    };
  }

  return {
    title: `${district.name} - MGNREGA Dashboard`,
    description: `View MGNREGA employment and expenditure data for ${district.name} district in Maharashtra.`,
  };
}
