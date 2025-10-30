import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Maharashtra districts
  const districts = [
    { code: "MH_MUMBAI", name: "Mumbai", nameHi: "मुंबई", nameMr: "मुंबई" },
    { code: "MH_PUNE", name: "Pune", nameHi: "पुणे", nameMr: "पुणे" },
    { code: "MH_NAGPUR", name: "Nagpur", nameHi: "नागपुर", nameMr: "नागपूर" },
    { code: "MH_THANE", name: "Thane", nameHi: "ठाणे", nameMr: "ठाणे" },
    { code: "MH_NASHIK", name: "Nashik", nameHi: "नासिक", nameMr: "नाशिक" },
    { code: "MH_AURANGABAD", name: "Aurangabad", nameHi: "औरंगाबाद", nameMr: "औरंगाबाद" },
    { code: "MH_SOLAPUR", name: "Solapur", nameHi: "सोलापुर", nameMr: "सोलापूर" },
    { code: "MH_AMRAVATI", name: "Amravati", nameHi: "अमरावती", nameMr: "अमरावती" },
    { code: "MH_NANDED", name: "Nanded", nameHi: "नांदेड", nameMr: "नांदेड" },
    { code: "MH_KOLHAPUR", name: "Kolhapur", nameHi: "कोल्हापुर", nameMr: "कोल्हापूर" },
    { code: "MH_AHMEDNAGAR", name: "Ahmednagar", nameHi: "अहमदनगर", nameMr: "अहमदनगर" },
    { code: "MH_AKOLA", name: "Akola", nameHi: "अकोला", nameMr: "अकोला" },
    { code: "MH_JALGAON", name: "Jalgaon", nameHi: "जलगांव", nameMr: "जळगाव" },
    { code: "MH_LATUR", name: "Latur", nameHi: "लातूर", nameMr: "लातूर" },
    { code: "MH_DHULE", name: "Dhule", nameHi: "धुले", nameMr: "धुळे" },
    { code: "MH_BULDANA", name: "Buldana", nameHi: "बुलढाणा", nameMr: "बुलडाणा" },
    { code: "MH_JALNA", name: "Jalna", nameHi: "जालना", nameMr: "जालना" },
    { code: "MH_SANGLI", name: "Sangli", nameHi: "सांगली", nameMr: "सांगली" },
    { code: "MH_SATARA", name: "Satara", nameHi: "सातारा", nameMr: "सातारा" },
    { code: "MH_RAIGAD", name: "Raigad", nameHi: "रायगड", nameMr: "रायगड" },
    { code: "MH_BEED", name: "Beed", nameHi: "बीड", nameMr: "बीड" },
    { code: "MH_YAVATMAL", name: "Yavatmal", nameHi: "यवतमाल", nameMr: "यवतमाळ" },
    { code: "MH_PARBHANI", name: "Parbhani", nameHi: "परभणी", nameMr: "परभणी" },
    { code: "MH_CHANDRAPUR", name: "Chandrapur", nameHi: "चंद्रपुर", nameMr: "चंद्रपूर" },
    { code: "MH_WARDHA", name: "Wardha", nameHi: "वर्धा", nameMr: "वर्धा" },
    { code: "MH_NANDURBAR", name: "Nandurbar", nameHi: "नंदुरबार", nameMr: "नंदुरबार" },
    { code: "MH_OSMANABAD", name: "Osmanabad", nameHi: "उस्मानाबाद", nameMr: "उस्मानाबाद" },
    { code: "MH_GONDIA", name: "Gondia", nameHi: "गोंदिया", nameMr: "गोंदिया" },
    { code: "MH_BHANDARA", name: "Bhandara", nameHi: "भंडारा", nameMr: "भंडारा" },
    { code: "MH_WASHIM", name: "Washim", nameHi: "वाशिम", nameMr: "वाशिम" },
    { code: "MH_HINGOLI", name: "Hingoli", nameHi: "हिंगोली", nameMr: "हिंगोली" },
    { code: "MH_GADCHIROLI", name: "Gadchiroli", nameHi: "गढ़चिरौली", nameMr: "गडचिरोली" },
    { code: "MH_RATNAGIRI", name: "Ratnagiri", nameHi: "रत्नागिरी", nameMr: "रत्नागिरी" },
    { code: "MH_SINDHUDURG", name: "Sindhudurg", nameHi: "सिंधुदुर्ग", nameMr: "सिंधुदुर्ग" },
    { code: "MH_PALGHAR", name: "Palghar", nameHi: "पालघर", nameMr: "पालघर" },
    { code: "MH_MUMBAI_SUBURBAN", name: "Mumbai Suburban", nameHi: "मुंबई उपनगरीय", nameMr: "मुंबई उपनगर" },
  ];

  for (const district of districts) {
    await prisma.district.upsert({
      where: { code: district.code },
      update: district,
      create: {
        ...district,
        stateCode: "MH",
        stateName: "Maharashtra",
      },
    });
  }

  console.log(`✅ Seeded ${districts.length} districts`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
