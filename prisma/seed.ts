import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

interface CSVRow {
  fin_year: string;
  month: string;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
  [key: string]: string;
}

function safeParseFloat(value: string): number | null {
  if (!value || value === "NA" || value.trim() === "" || value === "0") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function safeParseInt(value: string): number | null {
  if (!value || value === "NA" || value.trim() === "" || value === "0") {
    return null;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

async function importCSV(filePath: string) {
  console.log(`\n📂 Reading: ${path.basename(filePath)}`);
  
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  console.log(`📊 Found ${records.length} records`);

  // Step 1: Extract unique districts
  const uniqueDistricts = new Map<string, { code: string; name: string }>();
  
  records.forEach((row) => {
    if (row.district_code && row.district_name) {
      uniqueDistricts.set(row.district_code, {
        code: row.district_code,
        name: row.district_name,
      });
    }
  });

  console.log(`🏛️  Upserting ${uniqueDistricts.size} districts...`);
  
  for (const [code, data] of uniqueDistricts) {
    await prisma.district.upsert({
      where: { code },
      update: { name: data.name },
      create: {
        code,
        name: data.name,
        stateCode: "18",
        stateName: "MAHARASHTRA",
      },
    });
  }
  console.log(`✅ Districts ready`);

  // Step 2: Import metrics in batches
  console.log(`\n📈 Importing ${records.length} metrics...`);
  
  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    if (i % BATCH_SIZE === 0) {
      console.log(`   Progress: ${i}/${records.length} (${Math.round((i / records.length) * 100)}%)`);
    }

    try {
      if (!row.district_code || !row.fin_year || !row.month) {
        continue;
      }

      const district = await prisma.district.findUnique({
        where: { code: row.district_code },
        select: { id: true },
      });

      if (!district) continue;

      await prisma.monthlyMetric.upsert({
        where: {
          districtId_finYear_month: {
            districtId: district.id,
            finYear: row.fin_year,
            month: row.month,
          },
        },
        update: {
          approvedLabourBudget: safeParseFloat(row.Approved_Labour_Budget),
          averageWageRatePerDay: safeParseFloat(row.Average_Wage_rate_per_day_per_person),
          averageDaysOfEmploymentPerHousehold: safeParseFloat(row.Average_days_of_employment_provided_per_Household),
          differentlyAbledPersonsWorked: safeParseInt(row.Differently_abled_persons_worked),
          materialAndSkilledWages: safeParseFloat(row.Material_and_skilled_Wages),
          totalExpenditure: safeParseFloat(row.Total_Exp),
          wages: safeParseFloat(row.Wages),
          totalAdministrativeExpenditure: safeParseFloat(row.Total_Adm_Expenditure),
          numberOfCompletedWorks: safeParseInt(row.Number_of_Completed_Works),
          numberOfOngoingWorks: safeParseInt(row.Number_of_Ongoing_Works),
          numberOfWorksTakenUp: safeParseInt(row.Total_No_of_Works_Takenup),
          numberOfGPsWithNilExp: safeParseInt(row.Number_of_GPs_with_NIL_exp),
          personDaysOfCentralLiability: safeParseFloat(row.Persondays_of_Central_Liability_so_far),
          scPersonDays: safeParseFloat(row.SC_persondays),
          stPersonDays: safeParseFloat(row.ST_persondays),
          womenPersonDays: safeParseFloat(row.Women_Persondays),
          totalHouseholdsWorked: safeParseInt(row.Total_Households_Worked),
          totalIndividualsWorked: safeParseInt(row.Total_Individuals_Worked),
          totalNumberOfActiveJobCards: safeParseInt(row.Total_No_of_Active_Job_Cards),
          totalNumberOfActiveWorkers: safeParseInt(row.Total_No_of_Active_Workers),
          totalNumberOfHHsCompleted100Days: safeParseInt(row.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
          totalNumberOfJobCardsIssued: safeParseInt(row.Total_No_of_JobCards_issued),
          totalNumberOfWorkers: safeParseInt(row.Total_No_of_Workers),
          scWorkersAgainstActiveWorkers: safeParseFloat(row.SC_workers_against_active_workers),
          stWorkersAgainstActiveWorkers: safeParseFloat(row.ST_workers_against_active_workers),
          percentOfCategoryBWorks: safeParseFloat(row.percent_of_Category_B_Works),
          percentOfExpenditureOnAgricultureAllied: safeParseFloat(row.percent_of_Expenditure_on_Agriculture_Allied_Works),
          percentOfNRMExpenditure: safeParseFloat(row.percent_of_NRM_Expenditure),
          percentagePaymentsGeneratedWithin15Days: safeParseFloat(row.percentage_payments_gererated_within_15_days),
          remarks: row.Remarks === "NA" ? null : row.Remarks || null,
        },
        create: {
          districtId: district.id,
          finYear: row.fin_year,
          month: row.month,
          approvedLabourBudget: safeParseFloat(row.Approved_Labour_Budget),
          averageWageRatePerDay: safeParseFloat(row.Average_Wage_rate_per_day_per_person),
          averageDaysOfEmploymentPerHousehold: safeParseFloat(row.Average_days_of_employment_provided_per_Household),
          differentlyAbledPersonsWorked: safeParseInt(row.Differently_abled_persons_worked),
          materialAndSkilledWages: safeParseFloat(row.Material_and_skilled_Wages),
          totalExpenditure: safeParseFloat(row.Total_Exp),
          wages: safeParseFloat(row.Wages),
          totalAdministrativeExpenditure: safeParseFloat(row.Total_Adm_Expenditure),
          numberOfCompletedWorks: safeParseInt(row.Number_of_Completed_Works),
          numberOfOngoingWorks: safeParseInt(row.Number_of_Ongoing_Works),
          numberOfWorksTakenUp: safeParseInt(row.Total_No_of_Works_Takenup),
          numberOfGPsWithNilExp: safeParseInt(row.Number_of_GPs_with_NIL_exp),
          personDaysOfCentralLiability: safeParseFloat(row.Persondays_of_Central_Liability_so_far),
          scPersonDays: safeParseFloat(row.SC_persondays),
          stPersonDays: safeParseFloat(row.ST_persondays),
          womenPersonDays: safeParseFloat(row.Women_Persondays),
          totalHouseholdsWorked: safeParseInt(row.Total_Households_Worked),
          totalIndividualsWorked: safeParseInt(row.Total_Individuals_Worked),
          totalNumberOfActiveJobCards: safeParseInt(row.Total_No_of_Active_Job_Cards),
          totalNumberOfActiveWorkers: safeParseInt(row.Total_No_of_Active_Workers),
          totalNumberOfHHsCompleted100Days: safeParseInt(row.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
          totalNumberOfJobCardsIssued: safeParseInt(row.Total_No_of_JobCards_issued),
          totalNumberOfWorkers: safeParseInt(row.Total_No_of_Workers),
          scWorkersAgainstActiveWorkers: safeParseFloat(row.SC_workers_against_active_workers),
          stWorkersAgainstActiveWorkers: safeParseFloat(row.ST_workers_against_active_workers),
          percentOfCategoryBWorks: safeParseFloat(row.percent_of_Category_B_Works),
          percentOfExpenditureOnAgricultureAllied: safeParseFloat(row.percent_of_Expenditure_on_Agriculture_Allied_Works),
          percentOfNRMExpenditure: safeParseFloat(row.percent_of_NRM_Expenditure),
          percentagePaymentsGeneratedWithin15Days: safeParseFloat(row.percentage_payments_gererated_within_15_days),
          remarks: row.Remarks === "NA" ? null : row.Remarks || null,
        },
      });

      successCount++;
    } catch (error) {
      errorCount++;
      if (errorCount <= 3) {
        console.error(`❌ Error at row ${i}:`, error instanceof Error ? error.message : error);
      }
    }
  }

  console.log(`✅ Imported: ${successCount}, Errors: ${errorCount}`);
}

async function main() {
  console.log("🌱 Starting database seed from CSV...\n");

  // Check if already seeded
  const existingMetrics = await prisma.monthlyMetric.count();
  if (existingMetrics > 0) {
    console.log(`✅ Database already has ${existingMetrics} metrics. Skipping seed.`);
    return;
  }

  const databaseDir = path.join(process.cwd(), "src/database");
  const csvFiles = [
    path.join(databaseDir, "MAHARASHTRA_2024-2025.csv"),
    path.join(databaseDir, "MAHARASHTRA_2025-2026.csv"),
  ];

  for (const filePath of csvFiles) {
    if (fs.existsSync(filePath)) {
      await importCSV(filePath);
    } else {
      console.error(`❌ Not found: ${filePath}`);
    }
  }

  const districts = await prisma.district.count();
  const metrics = await prisma.monthlyMetric.count();

  console.log("\n" + "=".repeat(60));
  console.log("📊 SEED SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Districts: ${districts}`);
  console.log(`✅ Monthly Metrics: ${metrics}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
