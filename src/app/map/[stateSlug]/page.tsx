import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StateMapPageClient } from '@/components/map/StateMapPageClient';
import { getStateBySlug } from '@/lib/state-utils';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";
export const revalidate = 43200; // 12 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateSlug: string }>;
}): Promise<Metadata> {
  const { stateSlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);

  if (!stateInfo) {
    return {
      title: 'State Not Found',
    };
  }

  return {
    title: `${stateInfo.displayName} Districts - Interactive Map`,
    description: `Explore MGNREGA data across all districts of ${stateInfo.displayName}. Click on any district to view detailed employment and expenditure information.`,
    openGraph: {
      title: `${stateInfo.displayName} Districts - MGNREGA Map`,
      description: `Interactive map showing MGNREGA data for ${stateInfo.displayName} districts`,
    },
  };
}

async function getStateGeoJson(stateSlug: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'maps', 'states', `${stateSlug}.geojson`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load GeoJSON for ${stateSlug}:`, error);
    return null;
  }
}

async function getDistrictsData(stateName: string) {
  const districts = await prisma.district.findMany({
    where: {
      stateName: stateName,
    },
    include: {
      metrics: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      _count: {
        select: {
          metrics: true,
        },
      },
    },
  });

  return districts.map((district) => {
    const latestMetric = district.metrics[0];

    if (!latestMetric) {
      return {
        id: district.id,
        code: district.code,
        name: district.name,
        stateCode: district.stateCode,
        stateName: district.stateName,
        totalExpenditure: 0,
        totalHouseholds: 0,
        totalPersonDays: 0,
        totalWorks: 0,
        hasData: false,
      };
    }

    // Calculate person days (sum of all categories)
    const totalPersonDays = (latestMetric.scPersonDays ?? 0) + 
                           (latestMetric.stPersonDays ?? 0) + 
                           (latestMetric.womenPersonDays ?? 0) +
                           (latestMetric.personDaysOfCentralLiability ?? 0);

    return {
      id: district.id,
      code: district.code,
      name: district.name,
      stateCode: district.stateCode,
      stateName: district.stateName,
      totalExpenditure: latestMetric.totalExpenditure ?? 0,
      totalHouseholds: latestMetric.totalHouseholdsWorked ?? 0,
      totalPersonDays: totalPersonDays,
      totalWorks: latestMetric.numberOfCompletedWorks ?? 0,
      hasData: true,
    };
  });
}

export default async function StateMapPage({
  params,
}: {
  params: Promise<{ stateSlug: string }>;
}) {
  const { stateSlug } = await params;
  const stateInfo = getStateBySlug(stateSlug);

  if (!stateInfo) {
    notFound();
  }

  const [stateGeoJson, districtsData] = await Promise.all([
    getStateGeoJson(stateSlug),
    getDistrictsData(stateInfo.name),
  ]);

  if (!stateGeoJson) {
    notFound();
  }

  return (
    <StateMapPageClient
      stateInfo={stateInfo}
      stateGeoJson={stateGeoJson}
      districtsData={districtsData}
    />
  );
}
