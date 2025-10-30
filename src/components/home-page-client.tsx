"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { DistrictCard } from "@/components/district-card";
import {
  TrendingUp,
  Users,
  Briefcase,
  IndianRupee,
  MapPin,
  Clock,
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
} from "lucide-react";
import { formatIndianNumber, formatNumber, formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface District {
  id: string;
  code: string;
  name: string;
  stateCode: string;
  stateName: string;
  latestMetric?: {
    totalExpenditure: number;
    totalHouseholdsWorked: number;
    numberOfCompletedWorks: number;
    numberOfOngoingWorks: number;
    finYear: string;
    month: string;
  } | null;
  _count?: {
    metrics: number;
  };
}

interface HomePageClientProps {
  initialData: {
    districts: District[];
    stateStats: any;
  };
}

export function HomePageClient({ initialData }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { districts, stateStats } = initialData;
  const { t } = useLanguage();

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) {
      return districts;
    }
    return districts.filter((district) =>
      district.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [districts, searchQuery]);



  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E76D67' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Illustration placeholder */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Abstract illustration representing rural employment */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                  <svg viewBox="0 0 400 400" className="w-full h-auto relative z-10">
                    <circle cx="200" cy="200" r="150" fill="white" opacity="0.1"/>
                    <circle cx="200" cy="200" r="120" fill="white" opacity="0.15"/>
                    <circle cx="200" cy="200" r="90" fill="white" opacity="0.2"/>
                    <path d="M200 110 L200 290 M110 200 L290 200" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.3"/>
                    <circle cx="200" cy="110" r="15" fill="#514E80"/>
                    <circle cx="290" cy="200" r="15" fill="#514E80"/>
                    <circle cx="200" cy="290" r="15" fill="#514E80"/>
                    <circle cx="110" cy="200" r="15" fill="#514E80"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-8 text-white">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  {t('home.title.our')}{" "}
                  <span className="block" style={{ color: '#252653' }}>
                    {t('home.title.rights')}
                  </span>
                </h1>
                
                <p className="text-xl sm:text-2xl leading-relaxed text-white max-w-lg">
                  {t('home.subtitle')}
                </p>
              </div>

              {stateStats && (
                <div className="flex items-center gap-2 text-sm text-white">
                  <Clock className="h-4 w-4" />
                  <span>{t('home.lastUpdated')}: {formatDate(stateStats.lastUpdated)}</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  href="#districts"
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-md font-semibold transition-colors border-2 border-white hover:bg-[#514E80] hover:text-white"
                  style={{ borderColor: 'white' }}
                >
                  Explore Districts
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/compare"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-colors"
                  style={{ backgroundColor: '#514E80', color: 'white' }}
                >
                  Compare Data
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State-Level Stats - Narrow Content */}
      {stateStats && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
                Maharashtra at a Glance
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real-time data across all {stateStats.aggregates.totalDistricts} districts of Maharashtra
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-brand hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-brand/10 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {t('home.stats.expenditure')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ₹{formatIndianNumber(stateStats.aggregates.totalExpenditure)}
                </p>
                <p className="text-sm text-gray-500">
                  {t('home.stats.acrossDistricts').replace('{count}', stateStats.aggregates.totalDistricts)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-accent-purple hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-accent-purple/10 rounded-lg">
                    <Users className="h-6 w-6 text-accent-purple" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {t('home.stats.households')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(stateStats.aggregates.householdsWorked)}
                </p>
                <p className="text-sm text-gray-500">
                  Total families benefited
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-visuals-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Briefcase className="h-6 w-6 text-visuals-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {t('home.stats.works')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(stateStats.aggregates.worksCompleted)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(stateStats.aggregates.worksOngoing)} in progress
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-visuals-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-visuals-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {t('home.stats.personDays')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatNumber(stateStats.aggregates.personDaysGenerated)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatNumber(stateStats.aggregates.womenPersonDays)} by women
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What We Offer Section - Tattle Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive tools and insights to understand MGNREGA implementation across Maharashtra
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Interactive Dashboards
              </h3>
              <p className="text-gray-600">
                Visualize employment and expenditure data with interactive charts and graphs for all 34 districts
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-purple/10 rounded-full mb-4">
                <FileText className="h-8 w-8 text-accent-purple" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Historical Analysis
              </h3>
              <p className="text-gray-600">
                Access historical data and trends to understand program performance over time
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-visuals-6/10 rounded-full mb-4">
                <Shield className="h-8 w-8 text-visuals-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Transparent Data
              </h3>
              <p className="text-gray-600">
                All data sourced from official MGNREGA reports, ensuring accuracy and transparency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Districts Section */}
      <section id="districts" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
              {t('home.districts.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t('home.districts.count')
                .replace('{count}', filteredDistricts.length.toString())
                .replace('{total}', districts.length.toString())}
            </p>
            <div className="max-w-md mx-auto">
              <SearchBar 
                onSearch={setSearchQuery} 
                placeholder={t('home.search.placeholder')} 
              />
            </div>
          </div>

          {filteredDistricts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDistricts.map((district) => (
                <DistrictCard key={district.id} district={district} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">{t('home.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer - Simplified Tattle Style */}
      <footer className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ background: 'linear-gradient(135deg, #E76D67 0%, #514E80 100%)' }}>
                  M
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">MGNREGA Maharashtra</div>
                  <div className="text-sm text-gray-500">Data Dashboard</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('footer.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('nav.districts')}
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('nav.compare')}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('footer.about')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('footer.faq')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t('footer.contact')}
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://nrega.nic.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Official MGNREGA Site
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              {t('footer.license')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
