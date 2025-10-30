#!/usr/bin/env tsx

/**
 * Quick script to copy data from local database to production
 * Run this locally: pnpm tsx scripts/copy-to-production.ts
 */

import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient();

async function copyToProduction() {
  console.log('📊 Fetching data from local database...');

  // Fetch all districts
  const districts = await localPrisma.district.findMany({
    include: {
      metrics: true,
    },
  });

  console.log(`✅ Found ${districts.length} districts with metrics`);

  const totalMetrics = districts.reduce((sum, d) => sum + d.metrics.length, 0);
  console.log(`📈 Total metrics: ${totalMetrics}`);

  // Export to JSON
  const exportData = {
    districts: districts.map(d => ({
      code: d.code,
      name: d.name,
      stateCode: d.stateCode,
      stateName: d.stateName,
    })),
    metrics: districts.flatMap(d => 
      d.metrics.map(m => ({
        districtCode: d.code,
        ...m,
      }))
    ),
  };

  const fs = await import('fs');
  fs.writeFileSync(
    'data-export.json',
    JSON.stringify(exportData, null, 2)
  );

  console.log('✅ Data exported to data-export.json');
  console.log('📝 You can now import this in production');
}

copyToProduction()
  .catch(console.error)
  .finally(() => localPrisma.$disconnect());
