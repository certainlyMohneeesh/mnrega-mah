import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const CRON_SECRET = process.env.CRON_SECRET;

export const maxDuration = 300; // 5 minutes

interface ExportData {
  districts: Array<{
    code: string;
    name: string;
    stateCode: string;
    stateName: string;
  }>;
  metrics: Array<{
    districtCode: string;
    [key: string]: any;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');
    const querySecret = request.nextUrl.searchParams.get('secret');
    const secret = providedSecret || querySecret;

    if (!secret || secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting JSON import...');

    const prisma = new PrismaClient();

    try {
      // Check if already seeded
      const existingMetrics = await prisma.monthlyMetric.count();
      
      const force = request.nextUrl.searchParams.get('force') === 'true';
      
      if (existingMetrics > 100 && !force) {
        return NextResponse.json({
          success: true,
          message: `Database already has ${existingMetrics} metrics. Use ?force=true to reseed.`,
          alreadySeeded: true,
        });
      }

      // Clear data if force mode
      if (force) {
        console.log('🗑️  Clearing existing data...');
        await prisma.monthlyMetric.deleteMany({});
        await prisma.district.deleteMany({});
        console.log('✅ Data cleared');
      }

      // Read JSON file
      const jsonPath = path.join(process.cwd(), "src/database/data-export.json");
      
      if (!fs.existsSync(jsonPath)) {
        return NextResponse.json(
          { success: false, error: 'data-export.json not found' },
          { status: 404 }
        );
      }

      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      const data: ExportData = JSON.parse(fileContent);

      console.log(`📊 Found ${data.districts.length} districts and ${data.metrics.length} metrics`);

      // Import districts in batches
      console.log('🏛️  Importing districts...');
      const BATCH_SIZE = 10;
      
      for (let i = 0; i < data.districts.length; i += BATCH_SIZE) {
        const batch = data.districts.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(d => 
            prisma.district.upsert({
              where: { code: d.code },
              update: { name: d.name },
              create: d,
            })
          )
        );
      }
      
      console.log(`✅ ${data.districts.length} districts imported`);

      // Get district ID map
      const districts = await prisma.district.findMany({
        select: { id: true, code: true },
      });
      const districtMap = new Map(districts.map(d => [d.code, d.id]));

      // Import metrics in batches
      console.log('📈 Importing metrics...');
      let successCount = 0;
      let errorCount = 0;
      const METRIC_BATCH = 50;

      for (let i = 0; i < data.metrics.length; i += METRIC_BATCH) {
        const batch = data.metrics.slice(i, i + METRIC_BATCH);
        
        if (i % 500 === 0) {
          console.log(`   Progress: ${i}/${data.metrics.length} (${Math.round((i / data.metrics.length) * 100)}%)`);
        }

        const promises = batch.map(async (metric) => {
          try {
            const districtId = districtMap.get(metric.districtCode);
            if (!districtId || !metric.finYear || !metric.month) return;

            // Remove fields that aren't in schema (id, districtId from JSON, districtCode, createdAt, updatedAt)
            const { id, districtId: _oldDistrictId, districtCode, createdAt, updatedAt, ...metricData } = metric;

            // Ensure finYear and month are present
            if (!metricData.finYear || !metricData.month) return;

            await prisma.monthlyMetric.upsert({
              where: {
                districtId_finYear_month: {
                  districtId,
                  finYear: metricData.finYear as string,
                  month: metricData.month as string,
                },
              },
              update: metricData as any,
              create: {
                districtId,
                ...(metricData as any),
              },
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        });

        await Promise.all(promises);
      }

      console.log(`✅ Imported: ${successCount}, Errors: ${errorCount}`);

      const finalDistricts = await prisma.district.count();
      const finalMetrics = await prisma.monthlyMetric.count();

      return NextResponse.json({
        success: true,
        message: 'JSON import completed successfully',
        summary: {
          districts: finalDistricts,
          metrics: finalMetrics,
          imported: successCount,
          errors: errorCount,
        },
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error: any) {
    console.error('❌ Import failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Import failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/import',
    method: 'POST',
    description: 'Imports database from data-export.json',
    authentication: 'Bearer token required (CRON_SECRET)',
    usage: 'POST /api/import?secret=<CRON_SECRET>&force=true',
    maxDuration: '5 minutes',
  });
}
