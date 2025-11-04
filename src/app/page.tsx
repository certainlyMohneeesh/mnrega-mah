import { Suspense } from "react";
import { Metadata } from "next";
import { HomePageClient } from "@/components/home-page-client";
import { HomePageSkeleton } from "@/components/home-page-skeleton";
import prisma from "@/lib/prisma";

// Dynamic metadata with real-time stats
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Get total districts count
    const totalDistricts = await prisma.district.count();
    
    // Get total metrics count for freshness indicator
    const totalMetrics = await prisma.monthlyMetric.count();
    
    return {
      title: "All India MGNREGA Dashboard - Track 700+ Districts Across 36 States",
      description: `Live MGNREGA data dashboard covering ${totalDistricts}+ districts across all Indian states. Track employment, expenditure, works completed, and person-days in real-time. Transparent data for empowered citizens.`,
      openGraph: {
        title: "All India MGNREGA Dashboard - Real-time Employment & Expenditure Data",
        description: `Comprehensive MGNREGA analytics for ${totalDistricts}+ districts. Track rural employment, wages, and development works across India.`,
        type: "website",
        url: "/",
        images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "MGNREGA India Dashboard - Employment Tracking",
          },
        ],
      },
      alternates: {
        canonical: "https://mnrega-mah.vercel.app",
      },
    };
  } catch (error) {
    // Fallback metadata if database query fails
    return {
      title: "All India MGNREGA Dashboard - Track Employment & Expenditure",
      description: "Comprehensive MGNREGA dashboard tracking employment, expenditure, and rural development across all states and districts of India.",
    };
  }
}

/**
 * Get the base URL for server-side API calls
 */
function getServerSideBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  return "http://localhost:3000";
}

async function getInitialData() {
  try {
    // Get base URL for this server request
    const baseUrl = getServerSideBaseUrl();
    
    console.log('🔍 Fetching districts from:', baseUrl);
    
    // Fetch districts with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const districtsRes = await fetch(
      `${baseUrl}/api/districts?includeStats=true`,
      {
        signal: controller.signal,
        next: { revalidate: 120 },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    // Fetch state-level aggregates
    const stateController = new AbortController();
    const stateTimeoutId = setTimeout(() => stateController.abort(), 8000);
    
    const stateRes = await fetch(`${baseUrl}/api/state/latest`, {
      signal: stateController.signal,
      next: { revalidate: 180 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    clearTimeout(stateTimeoutId);

    const [districtsData, stateData] = await Promise.all([
      districtsRes.json(),
      stateRes.json()
    ]);

    console.log('✅ Districts fetched:', districtsData.success ? districtsData.data.length : 0);
    console.log('✅ State data fetched:', stateData.success);

    return {
      districts: districtsData.success ? districtsData.data : [],
      stateStats: stateData.success ? stateData.data : null,
    };
  } catch (error) {
    console.error('❌ Failed to fetch initial data:', error);
    return {
      districts: [],
      stateStats: null,
    };
  }
}

export default async function Home() {
  const initialData = await getInitialData();

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GovernmentOrganization",
            name: "MGNREGA India Dashboard",
            description: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) data dashboard for all Indian states and districts",
            url: "https://mnrega-mah.vercel.app",
            logo: "https://mnrega-mah.vercel.app/logo.png",
            sameAs: [
              "https://nrega.nic.in",
            ],
            areaServed: {
              "@type": "Country",
              name: "India"
            },
            serviceType: "Rural Employment Guarantee Scheme",
            knowsAbout: [
              "MGNREGA",
              "Rural Employment",
              "Wage Employment",
              "Rural Development",
              "Job Cards",
              "Person Days",
              "Works Completed"
            ]
          })
        }}
      />
      
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageClient initialData={initialData} />
      </Suspense>
    </>
  );
}
