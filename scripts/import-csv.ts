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
  Approved_Labour_Budget: string;
  Average_Wage_rate_per_day_per_person: string;
  Average_days_of_employment_provided_per_Household: string;
  Differently_abled_persons_worked: string;
  Material_and_skilled_Wages: string;
  Number_of_Completed_Works: string;
  Number_of_GPs_with_NIL_exp: string;
  Number_of_Ongoing_Works: string;
  Persondays_of_Central_Liability_so_far: string;
  SC_persondays: string;
  SC_workers_against_active_workers: string;
  ST_persondays: string;
  ST_workers_against_active_workers: string;
  Total_Adm_Expenditure: string;
  Total_Exp: string;
  Total_Households_Worked: string;
  Total_Individuals_Worked: string;
  Total_No_of_Active_Job_Cards: string;
  Total_No_of_Active_Workers: string;
  Total_No_of_HHs_completed_100_Days_of_Wage_Employment: string;
  Total_No_of_JobCards_issued: string;
  Total_No_of_Workers: string;
  Total_No_of_Works_Takenup: string;
  Wages: string;
  Women_Persondays: string;
  percent_of_Category_B_Works: string;
  percent_of_Expenditure_on_Agriculture_Allied_Works: string;
  percent_of_NRM_Expenditure: string;
  percentage_payments_gererated_within_15_days: string;
  Remarks: string;
}

function parseNumber(value: string): number | null {
  if (!value || value === "NA" || value === "0" || value.trim() === "") {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parseInt(value: string): number | null {
  if (!value || value === "NA" || value === "0" || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? null : Math.floor(parsed);
}

async function importCSV(filePath: string) {
  console.log(`\n📂 Reading CSV: ${path.basename(filePath)}`);
  
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  console.log(`📊 Found ${records.length} records`);

  // Extract unique districts
  const uniqueDistricts = new Map<string, { code: string; name: string }>();
  
  records.forEach((row) => {
    if (row.district_code && row.district_name) {
      uniqueDistricts.set(row.district_code, {
        code: row.district_code,
        name: row.district_name,
      });
    }
  });

  console.log(`\n🏛️  Found ${uniqueDistricts.size} unique districts`);
  console.log("District codes:", Array.from(uniqueDistricts.keys()).join(", "));

  // Step 1: Upsert districts
  let districtCount = 0;
  for (const [code, data] of uniqueDistricts) {
    await prisma.district.upsert({
      where: { code },
      update: {
        name: data.name,
      },
      create: {
        code,
        name: data.name,
        stateCode: "18",
        stateName: "MAHARASHTRA",
      },
    });
    districtCount++;
  }
  console.log(`✅ Upserted ${districtCount} districts`);

  // Step 2: Import monthly metrics
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  console.log(`\n📈 Importing monthly metrics...`);
  
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    if (i % 500 === 0) {
      console.log(`   Progress: ${i}/${records.length} (${Math.round((i / records.length) * 100)}%)`);
    }

    try {
      // Skip if essential data is missing
      if (!row.district_code || !row.fin_year || !row.month) {
        skippedCount++;
        continue;
      }

      // Find district
      const district = await prisma.district.findUnique({
        where: { code: row.district_code },
      });

      if (!district) {
        console.warn(`⚠️  District not found: ${row.district_code}`);
        skippedCount++;
        continue;
      }

      // Upsert monthly metric
      await prisma.monthlyMetric.upsert({
        where: {
          districtId_finYear_month: {
            districtId: district.id,
            finYear: row.fin_year,
            month: row.month,
          },
        },
        update: {
          approvedLabourBudget: parseNumber(row.Approved_Labour_Budget),
          averageWageRatePerDay: parseNumber(row.Average_Wage_rate_per_day_per_person),
          averageDaysOfEmploymentPerHousehold: parseNumber(row.Average_days_of_employment_provided_per_Household),
          differentlyAbledPersonsWorked: parseInt(row.Differently_abled_persons_worked),
          materialAndSkilledWages: parseNumber(row.Material_and_skilled_Wages),
          totalExpenditure: parseNumber(row.Total_Exp),
          wages: parseNumber(row.Wages),
          totalAdministrativeExpenditure: parseNumber(row.Total_Adm_Expenditure),
          numberOfCompletedWorks: parseInt(row.Number_of_Completed_Works),
          numberOfOngoingWorks: parseInt(row.Number_of_Ongoing_Works),
          numberOfWorksTakenUp: parseInt(row.Total_No_of_Works_Takenup),
          numberOfGPsWithNilExp: parseInt(row.Number_of_GPs_with_NIL_exp),
          personDaysOfCentralLiability: parseNumber(row.Persondays_of_Central_Liability_so_far),
          scPersonDays: parseNumber(row.SC_persondays),
          stPersonDays: parseNumber(row.ST_persondays),
          womenPersonDays: parseNumber(row.Women_Persondays),
          totalHouseholdsWorked: parseInt(row.Total_Households_Worked),
          totalIndividualsWorked: parseInt(row.Total_Individuals_Worked),
          totalNumberOfActiveJobCards: parseInt(row.Total_No_of_Active_Job_Cards),
          totalNumberOfActiveWorkers: parseInt(row.Total_No_of_Active_Workers),
          totalNumberOfHHsCompleted100Days: parseInt(row.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
          totalNumberOfJobCardsIssued: parseInt(row.Total_No_of_JobCards_issued),
          totalNumberOfWorkers: parseInt(row.Total_No_of_Workers),
          scWorkersAgainstActiveWorkers: parseNumber(row.SC_workers_against_active_workers),
          stWorkersAgainstActiveWorkers: parseNumber(row.ST_workers_against_active_workers),
          percentOfCategoryBWorks: parseNumber(row.percent_of_Category_B_Works),
          percentOfExpenditureOnAgricultureAllied: parseNumber(row.percent_of_Expenditure_on_Agriculture_Allied_Works),
          percentOfNRMExpenditure: parseNumber(row.percent_of_NRM_Expenditure),
          percentagePaymentsGeneratedWithin15Days: parseNumber(row.percentage_payments_gererated_within_15_days),
          remarks: row.Remarks === "NA" ? null : row.Remarks,
        },
        create: {
          districtId: district.id,
          finYear: row.fin_year,
          month: row.month,
          approvedLabourBudget: parseNumber(row.Approved_Labour_Budget),
          averageWageRatePerDay: parseNumber(row.Average_Wage_rate_per_day_per_person),
          averageDaysOfEmploymentPerHousehold: parseNumber(row.Average_days_of_employment_provided_per_Household),
          differentlyAbledPersonsWorked: parseInt(row.Differently_abled_persons_worked),
          materialAndSkilledWages: parseNumber(row.Material_and_skilled_Wages),
          totalExpenditure: parseNumber(row.Total_Exp),
          wages: parseNumber(row.Wages),
          totalAdministrativeExpenditure: parseNumber(row.Total_Adm_Expenditure),
          numberOfCompletedWorks: parseInt(row.Number_of_Completed_Works),
          numberOfOngoingWorks: parseInt(row.Number_of_Ongoing_Works),
          numberOfWorksTakenUp: parseInt(row.Total_No_of_Works_Takenup),
          numberOfGPsWithNilExp: parseInt(row.Number_of_GPs_with_NIL_exp),
          personDaysOfCentralLiability: parseNumber(row.Persondays_of_Central_Liability_so_far),
          scPersonDays: parseNumber(row.SC_persondays),
          stPersonDays: parseNumber(row.ST_persondays),
          womenPersonDays: parseNumber(row.Women_Persondays),
          totalHouseholdsWorked: parseInt(row.Total_Households_Worked),
          totalIndividualsWorked: parseInt(row.Total_Individuals_Worked),
          totalNumberOfActiveJobCards: parseInt(row.Total_No_of_Active_Job_Cards),
          totalNumberOfActiveWorkers: parseInt(row.Total_No_of_Active_Workers),
          totalNumberOfHHsCompleted100Days: parseInt(row.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
          totalNumberOfJobCardsIssued: parseInt(row.Total_No_of_JobCards_issued),
          totalNumberOfWorkers: parseInt(row.Total_No_of_Workers),
          scWorkersAgainstActiveWorkers: parseNumber(row.SC_workers_against_active_workers),
          stWorkersAgainstActiveWorkers: parseNumber(row.ST_workers_against_active_workers),
          percentOfCategoryBWorks: parseNumber(row.percent_of_Category_B_Works),
          percentOfExpenditureOnAgricultureAllied: parseNumber(row.percent_of_Expenditure_on_Agriculture_Allied_Works),
          percentOfNRMExpenditure: parseNumber(row.percent_of_NRM_Expenditure),
          percentagePaymentsGeneratedWithin15Days: parseNumber(row.percentage_payments_gererated_within_15_days),
          remarks: row.Remarks === "NA" ? null : row.Remarks,
        },
      });

      successCount++;
    } catch (error) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`❌ Error processing row ${i}:`, error);
      }
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Errors: ${errorCount}`);
}

async function main() {
  console.log("🚀 Starting CSV import...\n");

  const databaseDir = path.join(__dirname, "../src/database");
  const csvFiles = [
    path.join(databaseDir, "MAHARASHTRA_2024-2025.csv"),
    path.join(databaseDir, "MAHARASHTRA_2025-2026.csv"),
  ];

  console.log("📁 Database directory:", databaseDir);
  console.log("📄 CSV files to process:", csvFiles.length);

  for (const filePath of csvFiles) {
    if (fs.existsSync(filePath)) {
      await importCSV(filePath);
    } else {
      console.error(`❌ File not found: ${filePath}`);
    }
  }

  // Summary
  const districtCount = await prisma.district.count();
  const metricCount = await prisma.monthlyMetric.count();

  console.log("\n" + "=".repeat(50));
  console.log("📊 DATABASE SUMMARY");
  console.log("=".repeat(50));
  console.log(`Districts: ${districtCount}`);
  console.log(`Monthly Metrics: ${metricCount}`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
