import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || "";
const DATA_GOV_API_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

// All Indian states as per data.gov.in
const INDIAN_STATES = [
  "ANDAMAN AND NICOBAR",
  "ANDHRA PRADESH",
  "ARUNACHAL PRADESH",
  "ASSAM",
  "BIHAR",
  "CHHATTISGARH",
  "DN HAVELI AND DD",
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
  "WEST BENGAL"
];

const FINANCIAL_YEARS = ["2024-2025", "2025-2026"];

interface DataGovResponse {
  records: any[];
  total: number;
  count: number;
  status: string;
}

/**
 * Fetch data from data.gov.in API for a specific state and financial year
 */
async function fetchStateData(
  stateName: string,
  finYear: string,
  offset: number = 0,
  limit: number = 1000
): Promise<DataGovResponse> {
  const params = new URLSearchParams({
    "api-key": DATA_GOV_API_KEY,
    format: "json",
    offset: offset.toString(),
    limit: limit.toString(),
    "filters[state_name]": stateName,
    "filters[fin_year]": finYear,
  });

  const url = `${DATA_GOV_API_URL}?${params.toString()}`;
  console.log(`🔍 Fetching: ${stateName} - ${finYear} (offset: ${offset})`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Process and store records in database
 */
async function processRecords(records: any[]): Promise<{ districts: number; metrics: number }> {
  let districtsCreated = 0;
  let metricsCreated = 0;

  // Group records by district
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

  // Process each district
  for (const [key, districtData] of districtMap) {
    try {
      // Upsert district
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
      
      districtsCreated++;

      // Upsert metrics for this district
      for (const metric of districtData.metrics) {
        try {
          // Helper function to safely convert to number
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

          const metricData = {
            approvedLabourBudget: toNumber(metric.Approved_Labour_Budget),
            averageWageRatePerDay: toNumber(metric.Average_Wage_rate_per_day_per_person),
            averageDaysOfEmploymentPerHousehold: toNumber(metric.Average_days_of_employment_provided_per_Household),
            differentlyAbledPersonsWorked: toInt(metric.Differently_abled_persons_worked),
            materialAndSkilledWages: toNumber(metric.Material_and_skilled_Wages),
            totalExpenditure: toNumber(metric.Total_Exp),
            wages: toNumber(metric.Wages),
            totalAdministrativeExpenditure: toNumber(metric.Total_Adm_Expenditure),
            numberOfCompletedWorks: toInt(metric.Number_of_Completed_Works),
            numberOfOngoingWorks: toInt(metric.Number_of_Ongoing_Works),
            numberOfWorksTakenUp: toInt(metric.Total_No_of_Works_Takenup),
            numberOfGPsWithNilExp: toInt(metric.Number_of_GPs_with_NIL_exp),
            personDaysOfCentralLiability: toNumber(metric.Persondays_of_Central_Liability_so_far),
            scPersonDays: toNumber(metric.SC_persondays),
            stPersonDays: toNumber(metric.ST_persondays),
            womenPersonDays: toNumber(metric.Women_Persondays),
            totalHouseholdsWorked: toInt(metric.Total_Households_Worked),
            totalIndividualsWorked: toInt(metric.Total_Individuals_Worked),
            totalNumberOfActiveJobCards: toInt(metric.Total_No_of_Active_Job_Cards),
            totalNumberOfActiveWorkers: toInt(metric.Total_No_of_Active_Workers),
            totalNumberOfHHsCompleted100Days: toInt(metric.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
            totalNumberOfJobCardsIssued: toInt(metric.Total_No_of_JobCards_issued),
            totalNumberOfWorkers: toInt(metric.Total_No_of_Workers),
            scWorkersAgainstActiveWorkers: toNumber(metric.SC_workers_against_active_workers),
            stWorkersAgainstActiveWorkers: toNumber(metric.ST_workers_against_active_workers),
            percentOfCategoryBWorks: toNumber(metric.percent_of_Category_B_Works),
            percentOfExpenditureOnAgricultureAllied: toNumber(metric.percent_of_Expenditure_on_Agriculture_Allied_Works),
            percentOfNRMExpenditure: toNumber(metric.percent_of_NRM_Expenditure),
            percentagePaymentsGeneratedWithin15Days: toNumber(metric.percentage_payments_gererated_within_15_days),
            remarks: metric.Remarks || null,
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
          
          metricsCreated++;
        } catch (error) {
          console.error(`❌ Error upserting metric for ${districtData.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing district ${districtData.name}:`, error);
    }
  }

  return { districts: districtsCreated, metrics: metricsCreated };
}

/**
 * POST /api/admin/fetch-all-states
 * Initial bulk import of all states data for 2024-25 and 2025-26
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const secret = authHeader?.replace("Bearer ", "") || request.nextUrl.searchParams.get("secret");
    
    if (!secret || secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🚀 Starting bulk import of all Indian states...");

    const summary = {
      totalStates: INDIAN_STATES.length,
      totalYears: FINANCIAL_YEARS.length,
      processedStates: 0,
      totalDistricts: 0,
      totalMetrics: 0,
      errors: [] as string[],
    };

    // Process each state and financial year
    for (const stateName of INDIAN_STATES) {
      for (const finYear of FINANCIAL_YEARS) {
        try {
          console.log(`\n📍 Processing: ${stateName} - ${finYear}`);
          
          let offset = 0;
          let hasMore = true;
          let stateMetrics = 0;
          let stateDistricts = 0;

          while (hasMore) {
            const response = await fetchStateData(stateName, finYear, offset);
            
            if (response.status !== "ok" || !response.records || response.records.length === 0) {
              hasMore = false;
              break;
            }

            const { districts, metrics } = await processRecords(response.records);
            stateDistricts += districts;
            stateMetrics += metrics;

            console.log(`  ✅ Batch processed: ${metrics} metrics from ${districts} districts`);

            // Check if there are more records
            if (response.records.length < 1000) {
              hasMore = false;
            } else {
              offset += 1000;
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          summary.totalDistricts += stateDistricts;
          summary.totalMetrics += stateMetrics;
          
          console.log(`✅ Completed ${stateName} - ${finYear}: ${stateDistricts} districts, ${stateMetrics} metrics`);

          // Log fetch operation
          await prisma.fetchLog.create({
            data: {
              source: "data.gov.in",
              operation: `bulk_import_${stateName}_${finYear}`,
              status: "success",
              recordsCount: stateMetrics,
              requestParams: { stateName, finYear },
              responseTime: Date.now() - startTime,
              startedAt: new Date(startTime),
            },
          });

        } catch (error) {
          const errorMsg = `Error processing ${stateName} - ${finYear}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`❌ ${errorMsg}`);
          summary.errors.push(errorMsg);

          // Log error
          await prisma.fetchLog.create({
            data: {
              source: "data.gov.in",
              operation: `bulk_import_${stateName}_${finYear}`,
              status: "error",
              recordsCount: 0,
              errorMessage: errorMsg,
              requestParams: { stateName, finYear },
              responseTime: Date.now() - startTime,
              startedAt: new Date(startTime),
            },
          });
        }
      }
      
      summary.processedStates++;
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 Bulk import completed in ${(totalTime / 1000 / 60).toFixed(2)} minutes`);
    console.log(`📊 Summary: ${summary.totalDistricts} districts, ${summary.totalMetrics} metrics`);

    return NextResponse.json({
      success: true,
      message: "Bulk import completed",
      summary: {
        ...summary,
        totalTimeMinutes: (totalTime / 1000 / 60).toFixed(2),
      },
    });

  } catch (error) {
    console.error("❌ Fatal error in bulk import:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
