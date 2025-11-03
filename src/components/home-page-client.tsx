"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { DistrictCard } from "@/components/district-card";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { LocationDetector } from "@/components/location-detector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  Globe,
  Filter,
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
  const [showBanner, setShowBanner] = useState(true);
  const [districts, setDistricts] = useState<District[]>(initialData.districts);
  const [stateStats, setStateStats] = useState(initialData.stateStats);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  const { t } = useLanguage();

  // All 34 Indian States/UTs for the filter
  const allIndianStates = [
    "ANDAMAN AND NICOBAR",
    "ANDHRA PRADESH",
    "ARUNACHAL PRADESH",
    "ASSAM",
    "BIHAR",
    "CHANDIGARH",
    "CHHATTISGARH",
    "DADRA AND NAGAR HAVELI",
    "DAMAN AND DIU",
    "GOA",
    "GUJARAT",
    "HARYANA",
    "HIMACHAL PRADESH",
    "JAMMU AND KASHMIR",
    "JHARKHAND",
    "KARNATAKA",
    "KERALA",
    "LADAKH",
    "LAKSHADWEEP",
    "MADHYA PRADESH",
    "MAHARASHTRA",
    "MANIPUR",
    "MEGHALAYA",
    "MIZORAM",
    "NAGALAND",
    "ODISHA",
    "PUDUCHERRY",
    "PUNJAB",
    "RAJASTHAN",
    "SIKKIM",
    "TAMIL NADU",
    "TELANGANA",
    "TRIPURA",
    "UTTAR PRADESH",
    "UTTARAKHAND",
    "WEST BENGAL"
  ];

  // Check if banner was previously dismissed
  useEffect(() => {
    const bannerDismissed = localStorage.getItem('languageBannerDismissed');
    
    if (bannerDismissed === 'true') {
      setShowBanner(false);
    }
  }, []);

  // Fetch districts with pagination and filtering
  useEffect(() => {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      includeStats: 'true',
      page: currentPage.toString(),
      limit: '15'
    });
    
    if (selectedState && selectedState !== 'all') {
      params.append('stateName', selectedState);
    }
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    Promise.all([
      fetch(`/api/districts?${params}`).then(res => res.json()),
      fetch('/api/state/latest').then(res => res.json())
    ])
      .then(([districtsData, stateData]) => {
        if (districtsData.success) {
          console.log('✅ Districts loaded:', districtsData.data.length, 'Total:', districtsData.pagination?.total);
          setDistricts(districtsData.data);
          if (districtsData.pagination) {
            setPagination(districtsData.pagination);
          }
        }
        if (stateData.success) {
          setStateStats(stateData.data);
        }
      })
      .catch(error => {
        console.error('❌ Fetch failed:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, selectedState, searchQuery]);

  const handleDismissBanner = () => {
    localStorage.setItem('languageBannerDismissed', 'true');
    setShowBanner(false);
  };

  // Reset to page 1 when filters change
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };



  return (
    <div className="min-h-screen bg-white">
      {/* /* Language Availability Banner */}
        {showBanner && (
          <StickyBanner className="bg-[#514E80]" onDismiss={handleDismissBanner}>
            <div className="flex items-start sm:items-center justify-center gap-2 sm:gap-3 text-white px-2 sm:px-4">
          <Globe className="h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-xs sm:text-sm md:text-base font-medium text-left sm:text-center leading-relaxed">
            Now Available in English, Hindi, and Marathi. Just toggle the language selector in the header to switch!
          </span>
            </div>
          </StickyBanner>
        )}

        {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E76D67' }}>
        <div className="mx-auto max-w-6xl w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Maharashtra Map Illustration - Visible on all screens, positioned above on mobile */}
            <div className="flex items-center justify-center w-full order-1 lg:order-none">
              <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-2xl">
                {/* Maharashtra state map with glow effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                  <img 
                    src="/Mah-dots.svg" 
                    alt="Maharashtra Map" 
                    className="w-full h-auto relative z-10 opacity-90 drop-shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Content - Below illustration on mobile, right side on desktop */}
            <div className="space-y-6 sm:space-y-8 text-white text-center lg:text-left order-2 lg:order-none">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  {t('home.title.our')}{" "}
                  <span className="block" style={{ color: '#252653' }}>
                    {t('home.title.rights')}
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-white max-w-lg mx-auto lg:mx-0">
                  {t('home.subtitle')}
                </p>
              </div>

              {stateStats && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white">
                  <Clock className="h-4 w-4" />
                  <span>{t('home.lastUpdated')}: {formatDate(stateStats.lastUpdated)}</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 sm:pt-4">
                <Link 
                  href="#districts"
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-md font-semibold transition-colors border-2 border-white hover:bg-[#514E80] hover:text-white"
                  style={{ borderColor: 'white' }}
                >
                  {t('home.exploreDistricts')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/compare"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-colors"
                  style={{ backgroundColor: '#514E80', color: 'white' }}
                >
                  {t('home.compareData')}
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
                {t('home.maharashtraGlance')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.maharashtraGlanceDesc').replace('{count}', stateStats.aggregates.totalDistricts)}
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
                  {formatIndianNumber(stateStats.aggregates.totalExpenditure)}
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
                  {t('home.totalFamilies')}
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
                  {formatNumber(stateStats.aggregates.worksOngoing)} {t('home.inProgress')}
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
                  {formatNumber(stateStats.aggregates.womenPersonDays)} {t('home.byWomen')}
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
              {t('home.whatWeOffer')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('home.whatWeOfferDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 mb-4 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-brand/5 rounded-full blur-xl"></div>
                <svg viewBox="0 0 80 80" className="w-full h-auto relative z-10" aria-hidden="true">
                  <motion.circle 
                    cx="40" cy="40" r="30" 
                    fill="#E76D67" opacity="0.1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="24" 
                    fill="#E76D67" opacity="0.15"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="18" 
                    fill="#E76D67" opacity="0.2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                  <path d="M40 22 L40 58 M22 40 L58 40" stroke="#E76D67" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <circle cx="40" cy="22" r="3" fill="#514E80"/>
                  <circle cx="58" cy="40" r="3" fill="#514E80"/>
                  <circle cx="40" cy="58" r="3" fill="#514E80"/>
                  <circle cx="22" cy="40" r="3" fill="#514E80"/>
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">
                {t('home.interactiveDashboards')}
              </h3>
              <p className="text-gray-600">
                {t('home.interactiveDashboardsDesc')}
              </p>
            </motion.div>

            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 mb-4 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-accent-purple/5 rounded-full blur-xl"></div>
                <svg viewBox="0 0 80 80" className="w-full h-auto relative z-10" aria-hidden="true">
                  <motion.circle 
                    cx="40" cy="40" r="30" 
                    fill="#514E80" opacity="0.1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="24" 
                    fill="#514E80" opacity="0.15"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="18" 
                    fill="#514E80" opacity="0.2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                  <path d="M40 22 L40 58 M22 40 L58 40" stroke="#514E80" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <circle cx="40" cy="22" r="3" fill="#E76D67"/>
                  <circle cx="58" cy="40" r="3" fill="#E76D67"/>
                  <circle cx="40" cy="58" r="3" fill="#E76D67"/>
                  <circle cx="22" cy="40" r="3" fill="#E76D67"/>
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">
                {t('home.historicalAnalysis')}
              </h3>
              <p className="text-gray-600">
                {t('home.historicalAnalysisDesc')}
              </p>
            </motion.div>

            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 mb-4 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-visuals-6/5 rounded-full blur-xl"></div>
                <svg viewBox="0 0 80 80" className="w-full h-auto relative z-10" aria-hidden="true">
                  <motion.circle 
                    cx="40" cy="40" r="30" 
                    fill="#F97316" opacity="0.1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="24" 
                    fill="#F97316" opacity="0.15"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.circle 
                    cx="40" cy="40" r="18" 
                    fill="#F97316" opacity="0.2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                  <path d="M40 22 L40 58 M22 40 L58 40" stroke="#F97316" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <circle cx="40" cy="22" r="3" fill="#514E80"/>
                  <circle cx="58" cy="40" r="3" fill="#514E80"/>
                  <circle cx="40" cy="58" r="3" fill="#514E80"/>
                  <circle cx="22" cy="40" r="3" fill="#514E80"/>
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">
                {t('home.transparentData')}
              </h3>
              <p className="text-gray-600">
                {t('home.transparentDataDesc')}
              </p>
            </motion.div>
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Showing {districts.length} of {pagination.total} districts
            </p>
            
            {/* Filters */}
            <div className="max-w-4xl mx-auto mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Bar */}
                <div className="flex-1">
                  <SearchBar 
                    onSearch={handleSearchChange} 
                    placeholder={t('home.search.placeholder')} 
                  />
                </div>
                
                {/* State Filter */}
                <div className="w-full sm:w-64">
                  <Select value={selectedState} onValueChange={handleStateChange}>
                    <SelectTrigger className="w-full h-10">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States ({pagination.total})</SelectItem>
                      {allIndianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Loading districts...</p>
            </div>
          ) : districts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {districts.map((district: District) => (
                  <DistrictCard key={district.id} district={district} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {/* Sliding window pagination logic */}
                      {(() => {
                        const totalPages = pagination.totalPages;
                        const windowSize = 5;
                        let startPage = Math.max(1, currentPage - 2);
                        let endPage = Math.min(totalPages, currentPage + 2);
                        // Adjust window if at the start or end
                        if (currentPage <= 3) {
                          startPage = 1;
                          endPage = Math.min(totalPages, windowSize);
                        } else if (currentPage >= totalPages - 2) {
                          endPage = totalPages;
                          startPage = Math.max(1, totalPages - windowSize + 1);
                        }
                        const pages = [];
                        // Show first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <PaginationItem key={1}>
                              <PaginationLink
                                onClick={() => setCurrentPage(1)}
                                isActive={currentPage === 1}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <PaginationItem key="start-ellipsis">
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                        }
                        // Window of pages
                        for (let page = startPage; page <= endPage; page++) {
                          pages.push(
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        // Show ellipsis and last page if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <PaginationItem key="end-ellipsis">
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          pages.push(
                            <PaginationItem key={totalPages}>
                              <PaginationLink
                                onClick={() => setCurrentPage(totalPages)}
                                isActive={currentPage === totalPages}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return pages;
                      })()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                          className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
                <div className="h-12 w-12 rounded-lg flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #E76D67 0%, #514E80 100%)' }}>
                  <svg viewBox="0 0 48 48" className="w-8 h-8" aria-hidden="true">
                    <circle cx="24" cy="24" r="18" fill="white" opacity="0.1"/>
                    <circle cx="24" cy="24" r="14" fill="white" opacity="0.15"/>
                    <circle cx="24" cy="24" r="11" fill="white" opacity="0.2"/>
                    <path d="M24 13 L24 35 M13 24 L35 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                    <circle cx="24" cy="13" r="2" fill="white"/>
                    <circle cx="35" cy="24" r="2" fill="white"/>
                    <circle cx="24" cy="35" r="2" fill="white"/>
                    <circle cx="13" cy="24" r="2" fill="white"/>
                  </svg>
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
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">{t('home.quickLinks')}</h4>
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
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">{t('home.resources')}</h4>
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
                    {t('home.officialSite')}
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

      {/* Location Detector */}
      <LocationDetector />
    </div>
  );
}
