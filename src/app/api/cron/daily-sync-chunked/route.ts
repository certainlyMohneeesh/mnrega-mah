/**
 * CHUNKED DAILY SYNC API
 * 
 * Syncs a subset of states to stay within Vercel's 5-minute timeout.
 * GitHub Actions will call this multiple times to sync all states.
 * 
 * Query Parameters:
 * - chunk: Which chunk to process (0, 1, 2, etc.)
 * - chunkSize: How many states per chunk (default: 5)
 * 
 * Example: /api/cron/daily-sync-chunked?chunk=0&chunkSize=5
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSyncConfiguration } from "@/lib/financial-year";

export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || "";
const BASE_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

// All 34 Indian States/UTs
const INDIAN_STATES = [
  "ANDAMAN AND NICOBAR",
  "ANDHRA PRADESH",
  "ARUNACHAL PRADESH",
  "ASSAM",
  "BIHAR",
  "CHANDIGARH",
  "CHHATTISGARH",
  "DADRA AND NAGAR HAVELI",
  "DAMAN AND DIU",
  "GOA",
  "GUJARAT",
  "HARYANA",
  "HIMACHAL PRADESH",
  "JAMMU AND KASHMIR",
  "JHARKHAND",
  "KARNATAKA",
  "KERALA",
  "LADAKH",
  "LAKSHADWEEP",
  "MADHYA PRADESH",
  "MAHARASHTRA",
  "MANIPUR",
  "MEGHALAYA",
  "MIZORAM",
  "NAGALAND",
  "ODISHA",
  "PUDUCHERRY",
  "PUNJAB",
  "RAJASTHAN",
  "SIKKIM",
  "TAMIL NADU",
  "TELANGANA",
  "TRIPURA",
  "UTTAR PRADESH",
  "UTTARAKHAND",
  "WEST BENGAL",
];

const BATCH_SIZE = 500;

// Helper functions
const toNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === "" || val === "NA") return null;
  const num = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(num) ? null : num;
};

const toInt = (val: any): number | null => {
  if (val === null || val === undefined || val === "" || val === "NA") return null;
  const num = typeof val === "string" ? parseInt(val, 10) : val;
  return isNaN(num) ? null : num;
};

async function fetchStateData(
  stateName: string,
  finYear: string,
  offset: number = 0
): Promise<any[]> {
  const url = new URL(BASE_URL);
  url.searchParams.append("api-key", DATA_GOV_API_KEY);
  url.searchParams.append("format", "json");
  url.searchParams.append("filters[state_name]", stateName);
  url.searchParams.append("filters[fin_year]", finYear);
  url.searchParams.append("offset", offset.toString());
  url.searchParams.append("limit", BATCH_SIZE.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.records || [];
}

async function processState(
  stateName: string,
  stateCode: string,
  financialYears: string[]
): Promise<{ districts: number; metrics: number }> {
  let totalDistricts = 0;
  let totalMetrics = 0;

  for (const finYear of financialYears) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const records = await fetchStateData(stateName, finYear, offset);
      
      if (records.length === 0) {
        hasMore = false;
        break;
      }

      // Group by district
      const districtMap = new Map<string, any[]>();
      for (const record of records) {
        const code = record.district_code || record.district_name;
        if (!code) continue;
        if (!districtMap.has(code)) {
          districtMap.set(code, []);
        }
        districtMap.get(code)!.push(record);
      }

      // Process each district
      for (const [districtCode, districtRecords] of districtMap.entries()) {
        try {
          const district = await prisma.district.upsert({
            where: {
              stateCode_code: {
                stateCode,
                code: districtCode,
              },
            },
            update: {
              name: districtRecords[0].district_name || districtCode,
              stateName,
            },
            create: {
              code: districtCode,
              name: districtRecords[0].district_name || districtCode,
              stateCode,
              stateName,
            },
          });

          totalDistricts++;

          for (const record of districtRecords) {
            const metricData = {
              stateCode,
              stateName,
              approvedLabourBudget: toNumber(record.Approved_Labour_Budget),
              averageWageRatePerDay: toNumber(record.Average_Wage_rate_per_day_per_person),
              averageDaysOfEmploymentPerHousehold: toNumber(record.Average_days_of_employment_provided_per_Household),
              differentlyAbledPersonsWorked: toInt(record.Differently_abled_persons_worked),
              materialAndSkilledWages: toNumber(record.Material_and_skilled_Wages),
              totalExpenditure: toNumber(record.Total_Exp),
              wages: toNumber(record.Wages),
              totalAdministrativeExpenditure: toNumber(record.Total_Admin_Expenditure),
              numberOfCompletedWorks: toInt(record.Number_of_Completed_Works),
              numberOfOngoingWorks: toInt(record.Number_of_Ongoing_Works),
              numberOfWorksTakenUp: toInt(record.Number_of_Works_Takenup),
              numberOfGPsWithNilExp: toInt(record.Number_of_GPs_with_Nil_Exp),
              personDaysOfCentralLiability: toNumber(record.Persondays_of_Central_Liability_so_far),
              scPersonDays: toNumber(record.SC_persondays),
              stPersonDays: toNumber(record.ST_persondays),
              womenPersonDays: toNumber(record.Women_Persondays),
              totalHouseholdsWorked: toInt(record.Total_Households_Worked),
              totalIndividualsWorked: toInt(record.Total_Individuals_Worked),
              totalNumberOfActiveJobCards: toInt(record.Total_No_of_Active_Job_Cards),
              totalNumberOfActiveWorkers: toInt(record.Total_No_of_Active_Workers),
              totalNumberOfHHsCompleted100Days: toInt(record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
              totalNumberOfJobCardsIssued: toInt(record.Total_No_of_JobCards_issued),
              totalNumberOfWorkers: toInt(record.Total_No_of_Workers),
              scWorkersAgainstActiveWorkers: toNumber(record.SC_workers_against_active_workers),
              stWorkersAgainstActiveWorkers: toNumber(record.ST_workers_against_active_workers),
              percentOfCategoryBWorks: toNumber(record.Percentage_of_Category_B_Works),
              percentOfExpenditureOnAgricultureAllied: toNumber(record.Percentage_of_Expenditure_on_Agriculture_Allied),
              percentOfNRMExpenditure: toNumber(record.Percentage_of_NRM_Expenditure),
              percentagePaymentsGeneratedWithin15Days: toNumber(record.Percentage_payments_generated_within_15_days),
            };

            await prisma.monthlyMetric.upsert({
              where: {
                districtId_finYear_month: {
                  districtId: district.id,
                  finYear: record.fin_year || finYear,
                  month: record.month || "",
                },
              },
              update: metricData,
              create: {
                districtId: district.id,
                finYear: record.fin_year || finYear,
                month: record.month || "",
                ...metricData,
              },
            });

            totalMetrics++;
          }
        } catch (error) {
          console.error(`❌ Error processing district ${districtCode}:`, error);
        }
      }

      offset += BATCH_SIZE;
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }
  }

  return { districts: totalDistricts, metrics: totalMetrics };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log("=" .repeat(80));
  console.log(`🔄 Chunked Daily Sync Request - ${timestamp}`);
  console.log(`📍 URL: ${request.url}`);
  console.log(`🌐 Region: ${process.env.VERCEL_REGION || "local"}`);
  console.log("=" .repeat(80));

  // Authentication
  const authHeader = request.headers.get("authorization");
  const urlSecret = request.nextUrl.searchParams.get("secret");

  console.log(`🔐 Auth Check:`);
  console.log(`  - Header: ${authHeader ? "✅ Present" : "❌ Missing"}`);
  console.log(`  - URL Secret: ${urlSecret ? "✅ Present" : "❌ Missing"}`);

  if (authHeader !== `Bearer ${CRON_SECRET}` && urlSecret !== CRON_SECRET) {
    console.log("❌ Authorization failed");
    return NextResponse.json({ 
      error: "Unauthorized",
      hint: "Provide valid Authorization header or ?secret= parameter",
      timestamp,
    }, { status: 401 });
  }

  console.log("✅ Authorization successful");

  // Get chunk parameters
  const chunkParam = request.nextUrl.searchParams.get("chunk");
  const chunkSizeParam = request.nextUrl.searchParams.get("chunkSize");
  
  const chunk = chunkParam ? parseInt(chunkParam) : 0;
  const chunkSize = chunkSizeParam ? parseInt(chunkSizeParam) : 5;

  // Calculate which states to process
  const startIdx = chunk * chunkSize;
  const endIdx = Math.min(startIdx + chunkSize, INDIAN_STATES.length);
  const statesToProcess = INDIAN_STATES.slice(startIdx, endIdx);

  if (statesToProcess.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No more states to process",
      chunk,
      totalStates: INDIAN_STATES.length,
      processed: 0,
    });
  }

  console.log(`\n📦 Processing Chunk ${chunk}:`);
  console.log(`  - States: ${statesToProcess.join(", ")}`);
  console.log(`  - Range: ${startIdx + 1}-${endIdx} of ${INDIAN_STATES.length}`);

  // Get financial years
  const syncConfig = getSyncConfiguration();
  const financialYears = syncConfig.years;

  console.log(`📊 ${syncConfig.message}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? "✅ Connected" : "❌ Not configured"}`);

  try {
    let totalDistricts = 0;
    let totalMetrics = 0;

    // Process states sequentially to avoid overload
    for (let i = 0; i < statesToProcess.length; i++) {
      const stateName = statesToProcess[i];
      const stateCode = (startIdx + i + 1).toString().padStart(2, "0");
      
      console.log(`\n🔄 Processing ${stateName} (${i + 1}/${statesToProcess.length})...`);
      
      const result = await processState(stateName, stateCode, financialYears);
      
      totalDistricts += result.districts;
      totalMetrics += result.metrics;
      
      console.log(`  ✓ ${result.districts} districts, ${result.metrics} metrics`);
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Log to database
    await prisma.fetchLog.create({
      data: {
        source: "data.gov.in",
        operation: `daily_sync_chunk_${chunk}`,
        status: "success",
        recordsCount: totalMetrics,
        requestParams: { 
          chunk, 
          chunkSize, 
          states: statesToProcess,
          financialYears 
        },
        responseTime: duration * 1000,
        startedAt: new Date(startTime),
      },
    });

    console.log(`\n✅ Chunk ${chunk} completed in ${duration}s`);
    console.log(`📊 Updated: ${totalDistricts} districts, ${totalMetrics} metrics`);

    const hasMore = endIdx < INDIAN_STATES.length;
    const nextChunk = hasMore ? chunk + 1 : null;

    return NextResponse.json({
      success: true,
      message: `Chunk ${chunk} completed`,
      chunk,
      chunkSize,
      states: statesToProcess,
      summary: {
        financialYears,
        districts: totalDistricts,
        metrics: totalMetrics,
        durationSeconds: duration,
      },
      progress: {
        processed: endIdx,
        total: INDIAN_STATES.length,
        percentage: Math.round((endIdx / INDIAN_STATES.length) * 100),
        hasMore,
        nextChunk,
      },
    });
  } catch (error: any) {
    console.error("❌ Chunk sync failed:", error);

    const duration = Math.round((Date.now() - startTime) / 1000);

    await prisma.fetchLog.create({
      data: {
        source: "data.gov.in",
        operation: `daily_sync_chunk_${chunk}`,
        status: "error",
        recordsCount: 0,
        errorMessage: error.message,
        requestParams: { chunk, chunkSize, states: statesToProcess },
        responseTime: duration * 1000,
        startedAt: new Date(startTime),
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        chunk,
        durationSeconds: duration,
      },
      { status: 500 }
    );
  }
}
