import prisma from "../src/lib/prisma";

/**
 * Test script to verify API data structure without running the server
 */

async function testDistrictsList() {
  console.log("\n📋 Testing Districts List...");
  const districts = await prisma.district.findMany({
    where: { stateCode: "18" },
    orderBy: { name: "asc" },
    take: 5,
  });

  console.log(`✅ Found ${districts.length} districts (showing first 5)`);
  districts.forEach((d, i) => {
    console.log(`   ${i + 1}. ${d.name} (${d.code})`);
  });
}

async function testDistrictWithMetrics() {
  console.log("\n📊 Testing District with Latest Metric...");
  
  const district = await prisma.district.findFirst({
    where: { stateCode: "18" },
  });

  if (!district) {
    console.log("❌ No district found");
    return;
  }

  const latestMetric = await prisma.monthlyMetric.findFirst({
    where: { districtId: district.id },
    orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
  });

  console.log(`✅ District: ${district.name}`);
  if (latestMetric) {
    console.log(`   Latest Data: ${latestMetric.finYear} - ${latestMetric.month}`);
    console.log(`   Total Expenditure: ₹${latestMetric.totalExpenditure || 0} Lakhs`);
    console.log(`   Works Completed: ${latestMetric.numberOfCompletedWorks || 0}`);
    console.log(`   Households Worked: ${latestMetric.totalHouseholdsWorked || 0}`);
  } else {
    console.log("   ⚠️  No metrics found");
  }
}

async function testStateAggregates() {
  console.log("\n🏛️  Testing State-Level Aggregates...");

  const districts = await prisma.district.findMany({
    where: { stateCode: "18" },
  });

  console.log(`📍 Total Districts: ${districts.length}`);

  let totalMetrics = 0;
  let totalExpenditure = 0;
  let totalWorks = 0;
  let totalHouseholds = 0;

  for (const district of districts) {
    const metrics = await prisma.monthlyMetric.findMany({
      where: { districtId: district.id },
    });
    
    totalMetrics += metrics.length;
    
    const latest = metrics[0];
    if (latest) {
      totalExpenditure += latest.totalExpenditure || 0;
      totalWorks += (latest.numberOfCompletedWorks || 0) + (latest.numberOfOngoingWorks || 0);
      totalHouseholds += latest.totalHouseholdsWorked || 0;
    }
  }

  console.log(`✅ Total Metrics Records: ${totalMetrics}`);
  console.log(`   Avg Metrics per District: ${Math.round(totalMetrics / districts.length)}`);
  console.log(`   Total Expenditure: ₹${Math.round(totalExpenditure)} Lakhs`);
  console.log(`   Total Works: ${totalWorks}`);
  console.log(`   Total Households: ${totalHouseholds}`);
}

async function testHistoricalData() {
  console.log("\n📈 Testing Historical Data...");

  const district = await prisma.district.findFirst({
    where: { stateCode: "18" },
  });

  if (!district) return;

  const metrics = await prisma.monthlyMetric.findMany({
    where: { districtId: district.id },
    orderBy: [{ finYear: "desc" }, { month: "asc" }],
  });

  console.log(`✅ ${district.name} has ${metrics.length} monthly records`);

  // Group by financial year
  const byYear = metrics.reduce((acc: any, m) => {
    acc[m.finYear] = (acc[m.finYear] || 0) + 1;
    return acc;
  }, {});

  Object.entries(byYear).forEach(([year, count]) => {
    console.log(`   FY ${year}: ${count} months`);
  });

  // Show unique months
  const uniqueMonths = [...new Set(metrics.map(m => m.month))];
  console.log(`   Months present: ${uniqueMonths.join(", ")}`);
}

async function testComparisonData() {
  console.log("\n🔄 Testing Comparison Data...");

  const districts = await prisma.district.findMany({
    where: { stateCode: "18" },
    take: 2,
  });

  if (districts.length < 2) {
    console.log("❌ Need at least 2 districts");
    return;
  }

  const [d1, d2] = districts;

  const [metrics1, metrics2] = await Promise.all([
    prisma.monthlyMetric.findMany({
      where: { districtId: d1.id },
      orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.monthlyMetric.findMany({
      where: { districtId: d2.id },
      orderBy: [{ finYear: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  console.log(`✅ Comparing: ${d1.name} vs ${d2.name}`);
  console.log(`   ${d1.name}: ${metrics1.length} recent records`);
  console.log(`   ${d2.name}: ${metrics2.length} recent records`);

  if (metrics1[0] && metrics2[0]) {
    const exp1 = metrics1[0].totalExpenditure || 0;
    const exp2 = metrics2[0].totalExpenditure || 0;
    console.log(`   Latest Expenditure Comparison:`);
    console.log(`      ${d1.name}: ₹${exp1} Lakhs`);
    console.log(`      ${d2.name}: ₹${exp2} Lakhs`);
    console.log(`      Difference: ₹${Math.abs(exp1 - exp2)} Lakhs`);
  }
}

async function testDataQuality() {
  console.log("\n🔍 Testing Data Quality...");

  const totalDistricts = await prisma.district.count({ where: { stateCode: "18" } });
  const totalMetrics = await prisma.monthlyMetric.count();

  const districtsWithMetrics = await prisma.district.findMany({
    where: {
      stateCode: "18",
      metrics: {
        some: {},
      },
    },
  });

  console.log(`✅ Total Districts: ${totalDistricts}`);
  console.log(`   Districts with Data: ${districtsWithMetrics.length}`);
  console.log(`   Districts without Data: ${totalDistricts - districtsWithMetrics.length}`);
  console.log(`   Total Metric Records: ${totalMetrics}`);
  console.log(`   Coverage: ${Math.round((districtsWithMetrics.length / totalDistricts) * 100)}%`);

  // Check for null values in key fields
  const metricsWithNulls = await prisma.monthlyMetric.findMany({
    where: {
      OR: [
        { totalExpenditure: null },
        { totalHouseholdsWorked: null },
        { numberOfCompletedWorks: null },
      ],
    },
    take: 5,
  });

  console.log(`   Records with null values: ${metricsWithNulls.length > 0 ? metricsWithNulls.length + " (sample of 5)" : "None found"}`);
}

async function main() {
  console.log("🚀 Maharashtra MGNREGA API Data Tests\n");
  console.log("=" .repeat(60));

  try {
    await testDistrictsList();
    await testDistrictWithMetrics();
    await testStateAggregates();
    await testHistoricalData();
    await testComparisonData();
    await testDataQuality();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
