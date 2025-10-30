import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Our Voice, Our Rights - Maharashtra MGNREGA Dashboard",
  description: "Track MGNREGA employment and expenditure across all 34 districts of Maharashtra. Transparent data for empowered citizens.",
  keywords: ["MGNREGA", "Maharashtra", "Employment", "Rural Development", "Government Schemes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
