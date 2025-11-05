import { Metadata } from 'next';
import { MapPageClient } from '@/components/map/MapPageClientSimple';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const metadata: Metadata = {
  title: 'Interactive Map - All India MGNREGA Data',
  description: 'Explore MGNREGA data across all Indian states and districts with our interactive map. Click on any state to view district-level employment and expenditure data.',
  openGraph: {
    title: 'Interactive Map - MGNREGA India',
    description: 'Explore MGNREGA data across 36 states and 700+ districts',
  },
};

// Revalidate every 12 hours
export const revalidate = 43200;

async function getStatesData() {
  // Fetch aggregated data for all states
  const districts = await prisma.district.findMany({
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

  // Group by state and aggregate
  const stateMap = new Map<string, {
    stateCode: string;
    stateName: string;
    totalExpenditure: number;
    totalHouseholds: number;
    totalPersonDays: number;
    totalWorks: number;
  }>();

  districts.forEach((district) => {
    const latestMetric = district.metrics[0];
    
    if (!latestMetric) return;

    const existing = stateMap.get(district.stateCode);
    
    // Calculate person days (sum of all categories)
    const totalPersonDays = (latestMetric.scPersonDays ?? 0) + 
                           (latestMetric.stPersonDays ?? 0) + 
                           (latestMetric.womenPersonDays ?? 0) +
                           (latestMetric.personDaysOfCentralLiability ?? 0);
    
    if (existing) {
      existing.totalExpenditure += latestMetric.totalExpenditure ?? 0;
      existing.totalHouseholds += latestMetric.totalHouseholdsWorked ?? 0;
      existing.totalPersonDays += totalPersonDays;
      existing.totalWorks += latestMetric.numberOfCompletedWorks ?? 0;
    } else {
      stateMap.set(district.stateCode, {
        stateCode: district.stateCode,
        stateName: district.stateName,
        totalExpenditure: latestMetric.totalExpenditure ?? 0,
        totalHouseholds: latestMetric.totalHouseholdsWorked ?? 0,
        totalPersonDays: totalPersonDays,
        totalWorks: latestMetric.numberOfCompletedWorks ?? 0,
      });
    }
  });

  return Array.from(stateMap.values());
}

async function getIndiaGeoJson() {
  const filePath = path.join(process.cwd(), 'public', 'maps', 'india.geojson');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export default async function MapPage() {
  const [statesData, indiaGeoJson] = await Promise.all([
    getStatesData(),
    getIndiaGeoJson(),
  ]);

  return <MapPageClient statesData={statesData} indiaGeoJson={indiaGeoJson} />;
}
