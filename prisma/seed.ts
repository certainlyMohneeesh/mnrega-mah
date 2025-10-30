import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if districts already exist
  const existingDistricts = await prisma.district.count();
  
  if (existingDistricts > 0) {
    console.log(`✅ Database already has ${existingDistricts} districts. Skipping seed.`);
    return;
  }

  // Maharashtra districts with their official codes
  const districts = [
    { code: '1801', name: 'Ahmednagar' },
    { code: '1802', name: 'Akola' },
    { code: '1803', name: 'Amravati' },
    { code: '1804', name: 'Aurangabad' },
    { code: '1805', name: 'Beed' },
    { code: '1806', name: 'Bhandara' },
    { code: '1807', name: 'Buldhana' },
    { code: '1808', name: 'Chandrapur' },
    { code: '1809', name: 'Dhule' },
    { code: '1810', name: 'Gadchiroli' },
    { code: '1811', name: 'Gondia' },
    { code: '1812', name: 'Hingoli' },
    { code: '1813', name: 'Jalgaon' },
    { code: '1814', name: 'Jalna' },
    { code: '1815', name: 'Kolhapur' },
    { code: '1816', name: 'Latur' },
    { code: '1817', name: 'Mumbai' },
    { code: '1818', name: 'Mumbai Suburban' },
    { code: '1819', name: 'Nagpur' },
    { code: '1820', name: 'Nanded' },
    { code: '1821', name: 'Nandurbar' },
    { code: '1822', name: 'Nashik' },
    { code: '1823', name: 'Osmanabad' },
    { code: '1824', name: 'Palghar' },
    { code: '1825', name: 'Parbhani' },
    { code: '1826', name: 'Pune' },
    { code: '1827', name: 'Raigad' },
    { code: '1828', name: 'Ratnagiri' },
    { code: '1829', name: 'Sangli' },
    { code: '1830', name: 'Satara' },
    { code: '1831', name: 'Sindhudurg' },
    { code: '1832', name: 'Solapur' },
    { code: '1833', name: 'Thane' },
    { code: '1834', name: 'Wardha' },
    { code: '1835', name: 'Washim' },
    { code: '1836', name: 'Yavatmal' },
  ];

  console.log(`📥 Seeding ${districts.length} districts...`);

  for (const district of districts) {
    await prisma.district.create({
      data: {
        code: district.code,
        name: district.name,
        stateCode: '18',
        stateName: 'Maharashtra',
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created ${districts.length} districts`);
  console.log('⚠️  Note: Run the ingest script to populate metrics data');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
