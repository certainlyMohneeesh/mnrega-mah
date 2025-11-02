import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare-page-client";
import { ComparePageSkeleton } from "@/components/compare-page-skeleton";
import prisma from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ d1?: string; d2?: string }>;
}

async function getDistrictsData(d1?: string, d2?: string) {
  if (!d1 && !d2) {
    return { districts: [], error: null };
  }

  try {
    console.log('🔍 Fetching compare districts directly from database');
    const districtIds = [d1, d2].filter(Boolean) as string[];
    
    // Fetch districts directly from database
    const districts = await prisma.district.findMany({
      where: {
        id: { in: districtIds }
      },
      include: {
        metrics: {
          orderBy: [
            { finYear: 'desc' },
            { month: 'desc' }
          ]
        }
      }
    });

    // Transform data to match component interface
    const transformedDistricts = districts.map(district => ({
      id: district.id,
      code: district.code,
      name: district.name,
      stateCode: district.stateCode,
      stateName: district.stateName,
      metrics: district.metrics.map(m => ({
        id: m.id,
        finYear: m.finYear,
        month: m.month,
        totalExpenditure: m.totalExpenditure || 0,
        totalHouseholdsWorked: m.totalHouseholdsWorked || 0,
        numberOfCompletedWorks: m.numberOfCompletedWorks || 0,
        numberOfOngoingWorks: m.numberOfOngoingWorks || 0,
        womenPersonDays: m.womenPersonDays || 0,
        scPersonDays: m.scPersonDays || 0,
        stPersonDays: m.stPersonDays || 0,
        personDaysOfCentralLiability: m.personDaysOfCentralLiability || 0,
        averageWageRatePerDay: m.averageWageRatePerDay || 0,
        totalNumberOfActiveJobCards: m.totalNumberOfActiveJobCards || 0,
        createdAt: m.createdAt.toISOString(),
      }))
    }));

    console.log('✅ Found', transformedDistricts.length, 'districts');
    return { districts: transformedDistricts, error: null };
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
