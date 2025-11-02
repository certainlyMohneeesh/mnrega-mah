const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking districts in database...\n');
  
  const districts = await prisma.district.findMany({
    take: 10,
    select: {
      id: true,
      code: true,
      name: true,
      stateCode: true,
      stateName: true
    }
  });
  
  console.log('Total districts found:', districts.length);
  console.log('\nFirst 10 districts:');
  districts.forEach(d => {
    console.log(`- ${d.name} (${d.stateName})`);
    console.log(`  ID: ${d.id}`);
    console.log(`  Code: ${d.code}\n`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
