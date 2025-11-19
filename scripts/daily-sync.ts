import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || "";
const BASE_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "500", 10);

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

async function fetchStateData(stateName: string, finYear: string, offset = 0) {
  const url = new URL(BASE_URL);
  url.searchParams.append("api-key", DATA_GOV_API_KEY);
  url.searchParams.append("format", "json");
  url.searchParams.append("filters[state_name]", stateName);
  url.searchParams.append("filters[fin_year]", finYear);
  url.searchParams.append("offset", String(offset));
  url.searchParams.append("limit", String(BATCH_SIZE));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`data.gov.in error ${res.status}`);
  const data = await res.json();
  return data.records || [];
}

async function processState(stateName: string, stateCode: string, financialYears: string[]) {
  let totalDistricts = 0;
  let totalMetrics = 0;

  for (const finYear of financialYears) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const records = await fetchStateData(stateName, finYear, offset);
      if (!records.length) break;

      const districtMap = new Map<string, any[]>();
      for (const record of records) {
        const code = record.district_code || record.district_name;
        if (!code) continue;
        if (!districtMap.has(code)) districtMap.set(code, []);
        districtMap.get(code)!.push(record);
      }

      for (const [districtCode, districtRecords] of districtMap.entries()) {
        try {
          const district = await prisma.district.upsert({
            where: { stateCode_code: { stateCode, code: districtCode } },
            update: { name: districtRecords[0].district_name || districtCode, stateName },
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
              where: { districtId_finYear_month: { districtId: district.id, finYear: record.fin_year || finYear, month: record.month || "" } },
              update: metricData,
              create: { districtId: district.id, finYear: record.fin_year || finYear, month: record.month || "", ...metricData },
            });

            totalMetrics++;
          }
        } catch (err) {
          console.error(`Error processing district ${districtCode} in ${stateName}:`, err);
        }
      }

      offset += BATCH_SIZE;
      // small delay to avoid hammering API
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return { districts: totalDistricts, metrics: totalMetrics };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set. Set DATABASE_URL in environment.");
    process.exit(1);
  }
  if (!DATA_GOV_API_KEY) {
    console.error("ERROR: DATA_GOV_API_KEY is not set. Set DATA_GOV_API_KEY in environment.");
    process.exit(1);
  }

  // Parse command-line arguments for resume flag
  const args = process.argv.slice(2);
  let resumeFromState = process.env.RESUME_FROM_STATE || "";
  
  for (const arg of args) {
    if (arg.startsWith("--from-state=")) {
      resumeFromState = arg.split("=")[1].trim().replace(/['"]/g, "");
    }
  }

  console.log("🔄 Starting optimized daily sync (CLI)...");
  const start = Date.now();

  // financial years: simple current and previous
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const fyCurrent = month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
  const fyPrev = month >= 4 ? `${year - 1}-${String(year).slice(-2)}` : `${year - 2}-${String(year - 1).slice(-2)}`;
  const financialYears = [fyPrev, fyCurrent];

  console.log(`📊 Syncing financial years: ${financialYears.join(", ")}`);
  
  // Determine starting index based on resume flag
  let startIndex = 0;
  if (resumeFromState) {
    const resumeIndex = INDIAN_STATES.indexOf(resumeFromState.toUpperCase());
    if (resumeIndex === -1) {
      console.error(`❌ ERROR: State "${resumeFromState}" not found in state list.`);
      console.error(`   Valid states: ${INDIAN_STATES.slice(0, 5).join(", ")}, ...`);
      process.exit(1);
    }
    startIndex = resumeIndex;
    console.log(`🔁 RESUMING from state: ${resumeFromState.toUpperCase()} (position ${startIndex + 1}/${INDIAN_STATES.length})`);
    console.log(`   Skipping first ${startIndex} states that were already processed.`);
  } else {
    console.log(`🆕 Starting FULL sync from first state (ANDAMAN AND NICOBAR)`);
  }
  
  let totalDistricts = 0;
  let totalMetrics = 0;
  let processedStates = 0;

  try {
    for (let i = startIndex; i < INDIAN_STATES.length; i++) {
      const name = INDIAN_STATES[i];
      const code = String(i + 1).padStart(2, "0");
      console.log(`\n🔄 Processing state (${i + 1}/${INDIAN_STATES.length}): ${name}`);
      
      try {
        const res = await processState(name, code, financialYears);
        totalDistricts += res.districts;
        totalMetrics += res.metrics;
        processedStates++;
        console.log(`  ✓ State done: ${res.districts} districts, ${res.metrics} metrics`);
        console.log(`  📊 Progress: ${processedStates} states processed in this run`);
      } catch (stateError) {
        console.error(`  ❌ Failed to process state ${name}:`, stateError);
        console.error(`  💡 To resume from next state, use: --from-state="${INDIAN_STATES[i + 1] || 'N/A'}"`);
        throw stateError;
      }
    }

    const duration = Math.round((Date.now() - start) / 1000);
    console.log(`\n✅ CLI sync completed in ${duration}s`);
    console.log(`📊 Summary: ${processedStates} states processed, ${totalDistricts} districts, ${totalMetrics} metrics`);
    if (resumeFromState) {
      console.log(`🔁 This was a RESUMED run starting from: ${resumeFromState.toUpperCase()}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Fatal error running sync:", err);
    console.error(`📊 Successfully processed ${processedStates} states before failure`);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
