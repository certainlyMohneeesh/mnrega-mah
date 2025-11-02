import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateDistrictCaches } from "@/lib/redis";

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || "";
const DATA_GOV_API_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

// All Indian states
const INDIAN_STATES = [
  "ANDAMAN AND NICOBAR", "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR",
  "CHHATTISGARH", "DN HAVELI AND DD", "GOA", "GUJARAT", "HARYANA",
  "HIMACHAL PRADESH", "JAMMU AND KASHMIR", "JHARKHAND", "KARNATAKA", "KERALA",
  "LADAKH", "LAKSHADWEEP", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR",
  "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUDUCHERRY",
  "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA",
  "TRIPURA", "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL"
];

/**
 * Get current financial year based on date
 */
function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();
  
  // Financial year in India runs from April to March
  if (month >= 3) { // April (3) onwards
    return `${year}-${year + 1}`;
  } else { // January to March
    return `${year - 1}-${year}`;
  }
}

/**
 * Fetch data from data.gov.in API
 */
async function fetchStateData(
  stateName: string,
  finYear: string,
  offset: number = 0
): Promise<any> {
  const params = new URLSearchParams({
    "api-key": DATA_GOV_API_KEY,
    format: "json",
    offset: offset.toString(),
    limit: "1000",
    "filters[state_name]": stateName,
    "filters[fin_year]": finYear,
  });

  const url = `${DATA_GOV_API_URL}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Process and update records in database
 */
async function processRecords(records: any[]): Promise<{ districts: number; metrics: number }> {
  let districtsUpdated = 0;
  let metricsUpdated = 0;

  const districtMap = new Map<string, any>();
  
  for (const record of records) {
    const districtKey = `${record.state_code}-${record.district_code}`;
    
    if (!districtMap.has(districtKey)) {
      districtMap.set(districtKey, {
        code: record.district_code,
        name: record.district_name,
        stateCode: record.state_code,
        stateName: record.state_name,
        metrics: []
      });
    }
    
    districtMap.get(districtKey)!.metrics.push(record);
  }

  for (const [key, districtData] of districtMap) {
    try {
      const district = await prisma.district.upsert({
        where: { code: districtData.code },
        update: {
          name: districtData.name,
          stateCode: districtData.stateCode,
          stateName: districtData.stateName,
        },
        create: {
          code: districtData.code,
          name: districtData.name,
          stateCode: districtData.stateCode,
          stateName: districtData.stateName,
        },
      });
      
      districtsUpdated++;

      // Helper functions for type conversion
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

      for (const metric of districtData.metrics) {
        try {
          const metricData = {
            approvedLabourBudget: toNumber(metric.Approved_Labour_Budget),
            averageWageRatePerDay: toNumber(metric.Average_Wage_rate_per_day_per_person),
            averageDaysOfEmploymentPerHousehold: toNumber(metric.Average_days_of_employment_provided_per_Household),
            totalExpenditure: toNumber(metric.Total_Exp),
            wages: toNumber(metric.Wages),
            numberOfCompletedWorks: toInt(metric.Number_of_Completed_Works),
            numberOfOngoingWorks: toInt(metric.Number_of_Ongoing_Works),
            personDaysOfCentralLiability: toNumber(metric.Persondays_of_Central_Liability_so_far),
            scPersonDays: toNumber(metric.SC_persondays),
            stPersonDays: toNumber(metric.ST_persondays),
            womenPersonDays: toNumber(metric.Women_Persondays),
            totalHouseholdsWorked: toInt(metric.Total_Households_Worked),
            totalIndividualsWorked: toInt(metric.Total_Individuals_Worked),
            totalNumberOfActiveJobCards: toInt(metric.Total_No_of_Active_Job_Cards),
            totalNumberOfActiveWorkers: toInt(metric.Total_No_of_Active_Workers),
            totalNumberOfHHsCompleted100Days: toInt(metric.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
          };

          await prisma.monthlyMetric.upsert({
            where: {
              districtId_finYear_month: {
                districtId: district.id,
                finYear: metric.fin_year || "",
                month: metric.month || "",
              },
            },
            update: metricData,
            create: {
              districtId: district.id,
              finYear: metric.fin_year || "",
              month: metric.month || "",
              ...metricData,
            },
          });
          
          metricsUpdated++;
        } catch (error) {
          console.error(`❌ Error upserting metric:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing district:`, error);
    }
  }

  return { districts: districtsUpdated, metrics: metricsUpdated };
}

/**
 * GET /api/cron/daily-sync
 * Daily incremental sync for current financial year
 * Triggered by GitHub Actions cron job
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify authorization (Vercel Cron or manual with secret)
    const authHeader = request.headers.get("authorization");
    const secret = authHeader?.replace("Bearer ", "") || request.nextUrl.searchParams.get("secret");
    
    if (!secret || secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 Starting daily sync for current financial year...");

    const currentFinYear = getCurrentFinancialYear();
    console.log(`📅 Financial Year: ${currentFinYear}`);

    const summary = {
      finYear: currentFinYear,
      totalStates: INDIAN_STATES.length,
      processedStates: 0,
      totalDistricts: 0,
      totalMetrics: 0,
      errors: [] as string[],
    };

    // Process each state for current financial year only
    for (const stateName of INDIAN_STATES) {
      try {
        console.log(`\n📍 Syncing: ${stateName}`);
        
        let offset = 0;
        let hasMore = true;
        let stateMetrics = 0;
        let stateDistricts = 0;

        while (hasMore) {
          const response = await fetchStateData(stateName, currentFinYear, offset);
          
          if (response.status !== "ok" || !response.records || response.records.length === 0) {
            hasMore = false;
            break;
          }

          const { districts, metrics } = await processRecords(response.records);
          stateDistricts += districts;
          stateMetrics += metrics;

          if (response.records.length < 1000) {
            hasMore = false;
          } else {
            offset += 1000;
            await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
          }
        }

        summary.totalDistricts += stateDistricts;
        summary.totalMetrics += stateMetrics;
        summary.processedStates++;
        
        console.log(`✅ ${stateName}: ${stateMetrics} metrics updated`);

      } catch (error) {
        const errorMsg = `Error syncing ${stateName}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        summary.errors.push(errorMsg);
      }
    }

    // Invalidate all caches after sync
    console.log("🗑️  Invalidating caches...");
    await invalidateDistrictCaches();

    const totalTime = Date.now() - startTime;

    // Log sync operation
    await prisma.fetchLog.create({
      data: {
        source: "data.gov.in",
        operation: `daily_sync_${currentFinYear}`,
        status: summary.errors.length === 0 ? "success" : "partial",
        recordsCount: summary.totalMetrics,
        errorMessage: summary.errors.length > 0 ? summary.errors.join("; ") : null,
        requestParams: { finYear: currentFinYear, states: summary.processedStates },
        responseTime: totalTime,
        startedAt: new Date(startTime),
      },
    });

    console.log(`\n🎉 Daily sync completed in ${(totalTime / 1000 / 60).toFixed(2)} minutes`);

    return NextResponse.json({
      success: true,
      message: "Daily sync completed",
      summary: {
        ...summary,
        totalTimeMinutes: (totalTime / 1000 / 60).toFixed(2),
      },
    });

  } catch (error) {
    console.error("❌ Fatal error in daily sync:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
