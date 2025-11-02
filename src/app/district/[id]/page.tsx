import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DistrictDashboard } from "@/components/district-dashboard";
import { DistrictDashboardSkeleton } from "@/components/district-dashboard-skeleton";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getDistrictData(id: string) {
  try {
    console.log('🔍 Fetching district by ID:', id);
    
    // First check if district exists
    const districtExists = await prisma.district.findFirst({
      where: { id },
      select: { id: true, name: true }
    });
    
    if (!districtExists) {
      console.log('❌ District not found in database:', id);
      return null;
    }
    
    console.log('✅ District exists:', districtExists.name);
    
    // Fetch district details with all metrics directly from database
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: [
            { finYear: 'desc' },
            { month: 'desc' }
          ]
        }
      }
    });

    if (!district) {
      console.log('❌ Failed to fetch district details:', id);
      return null;
    }

    console.log('✅ Loaded district with', district.metrics.length, 'metrics');
    
    // Transform data to match component interface
    return {
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
    };
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
