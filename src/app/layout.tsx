import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/contexts/language-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mgnrega.cyth.app'),
  title: {
    default: "All India MGNREGA Dashboard - Track Employment & Expenditure Data",
    template: "%s | MGNREGA India"
  },
  description: "Comprehensive MGNREGA dashboard tracking employment, expenditure, and rural development across all 36 states and 700+ districts of India. Real-time data, analytics, and insights.",
  keywords: [
    "MGNREGA", 
    "MNREGA", 
    "India", 
    "Maharashtra",
    "Employment Guarantee", 
    "Rural Development", 
    "Government Schemes",
    "Job Cards",
    "Wage Employment",
    "Rural Jobs",
    "Person Days",
    "Works Completed",
    "District Wise Data",
    "State Wise MGNREGA",
    "MGNREGA Statistics",
    "Rural Employment India"
  ],
  authors: [{ name: "MGNREGA India Team" }],
  creator: "MGNREGA India Dashboard",
  publisher: "MGNREGA India",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "All India MGNREGA Dashboard - Real-time Employment Data",
    description: "Track MGNREGA employment and expenditure across 36 states and 700+ districts. Transparent data for empowered citizens.",
    siteName: "MGNREGA India Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MGNREGA India Dashboard - Employment & Expenditure Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All India MGNREGA Dashboard",
    description: "Track MGNREGA employment and expenditure across all Indian states and districts",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "Government, Employment, Rural Development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#252653" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="MGNREGA India" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#252653" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.data.gov.in" />
        
        {/* Verification tags (add your own) */}
        {/* <meta name="google-site-verification" content="your-verification-code" /> */}
        
        {/* Geo Tags for India-specific content */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
