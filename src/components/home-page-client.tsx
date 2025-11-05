"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search-bar";
import { EnhancedSearch } from "@/components/enhanced-search";
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
  Search,
  Mic,
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

interface StateData {
  code: string;
  name: string;
  displayName: string;
  slug: string;
  districtCount: number;
  totalExpenditure: number;
  totalHouseholdsWorked: number;
  totalWorksCompleted: number;
  totalPersonDays: number;
  hasData: boolean;
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
  const [states, setStates] = useState<StateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatePage, setCurrentStatePage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  const { t } = useLanguage();

  // Pagination for states
  const statesPerPage = 12;
  const totalStatePages = Math.ceil(states.length / statesPerPage);
  const startIndex = (currentStatePage - 1) * statesPerPage;
  const endIndex = startIndex + statesPerPage;
  const paginatedStates = states.slice(startIndex, endIndex);

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

  // Fetch all states data
  useEffect(() => {
    setIsLoadingStates(true);
    fetch('/api/states')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStates(data.data);
        }
      })
      .catch(error => {
        console.error('❌ Failed to fetch states:', error);
      })
      .finally(() => {
        setIsLoadingStates(false);
      });
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
            Now Available in 9 Languages: English, Hindi, Marathi, Tamil, Telugu, Malayalam, Kannada, Bengali, and Gujarati. Use the language selector in the header!
          </span>
            </div>
          </StickyBanner>
        )}

        {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: '#E76D67' }}>
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E76D67]/90 via-[#E76D67] to-[#D65A54]"></div>
        
        <div className="mx-auto max-w-7xl w-full relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* India Map Illustration - Visible on all screens, positioned above on mobile */}
            <div className="flex items-center justify-center w-full order-1 lg:order-none">
              <div className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-2xl">
                {/* India national map with enhanced glow effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute inset-0 bg-[#514E80]/10 rounded-full blur-2xl"></div>
                  <img 
                    src="/india-hero-map.png" 
                    alt="India Map" 
                    className="w-full h-auto relative z-10 opacity-95 drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Content - Below illustration on mobile, right side on desktop */}
            <div className="space-y-6 sm:space-y-8 text-white text-center lg:text-left order-2 lg:order-none">
              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                    Empowering{" "}
                    <span className="block" style={{ color: '#252653' }}>
                      Rural India
                    </span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  className="text-lg sm:text-xl md:text-2xl leading-relaxed text-white/95 max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Comprehensive MGNREGA data and insights from across India. Track employment, expenditure, and development works in real-time.
                </motion.p>
              </div>

              {stateStats && (
                <motion.div 
                  className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Clock className="h-4 w-4" />
                  <span>Last Updated: {formatDate(stateStats.lastUpdated)}</span>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 sm:pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link 
                  href="/map"
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-all border-2 border-white hover:bg-white hover:text-[#E76D67] transform hover:scale-105 shadow-lg"
                >
                  🗺️ Interactive Map
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="#states"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ backgroundColor: '#514E80', color: 'white' }}
                >
                  <MapPin className="h-4 w-4" />
                  Explore States
                </Link>
                <Link 
                  href="/compare"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ backgroundColor: '#252653', color: 'white' }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Compare Data
                </Link>
              </motion.div>

              {/* Quick Stats Bar */}
              <motion.div 
                className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white">36+</div>
                  <div className="text-xs sm:text-sm text-white/80">States & UTs</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white">600+</div>
                  <div className="text-xs sm:text-sm text-white/80">Districts</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white">Live</div>
                  <div className="text-xs sm:text-sm text-white/80">Real-time Data</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* National Stats - Showcase India-wide Impact */}
      {stateStats && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
                India's MGNREGA at a Glance
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Real-time insights from across the nation. Tracking progress, measuring impact, and empowering communities through transparent data.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <StatCard
                  title="Total Expenditure"
                  value={formatIndianNumber(stateStats.aggregates.totalExpenditure)}
                  subtitle={`Across ${stateStats.aggregates.totalDistricts} districts tracked`}
                  icon={IndianRupee}
                  className="border-l-4 border-brand hover:shadow-xl transition-shadow"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StatCard
                  title="Households Employed"
                  value={formatNumber(stateStats.aggregates.householdsWorked)}
                  subtitle="Families provided livelihood"
                  icon={Users}
                  className="border-l-4 border-accent-purple hover:shadow-xl transition-shadow"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StatCard
                  title="Works Completed"
                  value={formatNumber(stateStats.aggregates.worksCompleted)}
                  subtitle={`${formatNumber(stateStats.aggregates.worksOngoing)} currently ongoing`}
                  icon={Briefcase}
                  className="border-l-4 border-visuals-6 hover:shadow-xl transition-shadow"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <StatCard
                  title="Person-Days Generated"
                  value={formatNumber(stateStats.aggregates.personDaysGenerated)}
                  subtitle={`${formatNumber(stateStats.aggregates.womenPersonDays)} by women workers`}
                  icon={TrendingUp}
                  className="border-l-4 border-visuals-8 hover:shadow-xl transition-shadow"
                />
              </motion.div>
            </div>

            {/* Impact Highlight */}
            <motion.div 
              className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-purple/10 rounded-lg">
                  <Shield className="h-6 w-6 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">The Right to Work Guarantee</h3>
                  <p className="text-gray-600 leading-relaxed">
                    MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) provides a legal guarantee 
                    for 100 days of employment in a financial year to adult members of rural households. 
                    This data platform enables transparent monitoring of the scheme's implementation and impact across India.
                  </p>
                </div>
              </div>
            </motion.div>
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

      {/* Smart Search Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent-purple mb-4">
              <Search className="inline-block w-4 h-4 mr-2" />
              Smart Search
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
              Find Any District Instantly
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Search across 740+ districts with our advanced search. Type to search or use voice input for hands-free experience.
            </p>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <EnhancedSearch />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-12"
          >
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Search className="h-5 w-5 text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fuzzy Search</h3>
                <p className="text-sm text-gray-600">Works even with typos and partial names</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Mic className="h-5 w-5 text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Voice Input</h3>
                <p className="text-sm text-gray-600">Click the mic icon and speak the district name</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="p-2 bg-accent/10 rounded-lg">
                <ArrowRight className="h-5 w-5 text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Quick Navigation</h3>
                <p className="text-sm text-gray-600">Use keyboard arrows and Enter to navigate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Map CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-purple/10 rounded-full">
              <MapPin className="w-10 h-10 text-accent-purple" />
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
                Explore Our Interactive Map
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Visualize MGNREGA data across India with our new interactive map. Click on states to drill down to districts, view real-time metrics, and compare performance.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">36</div>
                <div className="text-sm text-gray-600">States & Union Territories</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">700+</div>
                <div className="text-sm text-gray-600">Districts with Data</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">4</div>
                <div className="text-sm text-gray-600">Metrics to Visualize</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">Live</div>
                <div className="text-sm text-gray-600">Real-time Updates</div>
              </motion.div>
            </div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-purple/10 rounded-lg mb-3">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Click & Explore</h3>
                <p className="text-sm text-gray-600">Click on any state to view district-level data</p>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-purple/10 rounded-lg mb-3">
                  <BarChart3 className="w-6 h-6 text-accent-purple" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Visual Analytics</h3>
                <p className="text-sm text-gray-600">Color-coded states based on selected metrics</p>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-purple/10 rounded-lg mb-3">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Detailed Insights</h3>
                <p className="text-sm text-gray-600">Hover for instant data tooltips and summaries</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-8"
            >
              <Link
                href="/map"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group text-white"
                style={{ backgroundColor: '#E76D67' }}
              >
                <span>Launch Interactive Map</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                No installation required • Works on all devices • Updated daily
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* State Statistics Grid Section */}
      <section id="states" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-sm font-medium text-accent-purple mb-4">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              Explore by State
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
              State-wise MGNREGA Performance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse through all {states.length} states and Union Territories to view detailed employment and expenditure metrics
            </p>
          </motion.div>

          {isLoadingStates ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple"></div>
              <p className="text-lg text-gray-600 mt-4">Loading states...</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {paginatedStates.map((state, index) => (
                <motion.div
                  key={state.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.02 }}
                >
                  <Link href={`/state/${state.slug}`}>
                    <div className={`group relative p-6 bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      state.hasData 
                        ? 'border-gray-200 hover:border-accent-purple hover:shadow-xl' 
                        : 'border-gray-100 opacity-60 hover:opacity-100'
                    }`}>
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        {/* State header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent-purple transition-colors line-clamp-2">
                              {state.displayName}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {state.districtCount > 0 ? `${state.districtCount} districts` : 'No data available'}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent-purple group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                        </div>

                        {/* Key metrics */}
                        {state.hasData ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <IndianRupee className="h-4 w-4 text-green-600" />
                                <span>Expenditure</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatIndianNumber(state.totalExpenditure)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span>Households</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatNumber(state.totalHouseholdsWorked)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase className="h-4 w-4 text-purple-600" />
                                <span>Works</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatNumber(state.totalWorksCompleted)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-sm text-gray-400">Data coming soon</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalStatePages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentStatePage - 1) * statesPerPage) + 1}-{Math.min(currentStatePage * statesPerPage, states.length)} of {states.length} states
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => {
                          if (currentStatePage > 1) {
                            setCurrentStatePage(currentStatePage - 1);
                            document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={currentStatePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent-purple/10'}
                      />
                    </PaginationItem>

                    {/* Sliding window pagination */}
                    {(() => {
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentStatePage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalStatePages, startPage + maxVisiblePages - 1);
                      
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      const pages = [];
                      
                      if (startPage > 1) {
                        pages.push(
                          <PaginationItem key={1}>
                            <PaginationLink
                              onClick={() => {
                                setCurrentStatePage(1);
                                document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="cursor-pointer hover:bg-accent-purple/10"
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <PaginationItem key="ellipsis-start">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => {
                                setCurrentStatePage(i);
                                document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              isActive={currentStatePage === i}
                              className={`cursor-pointer ${
                                currentStatePage === i
                                  ? 'bg-accent-purple text-white hover:bg-accent-purple/90'
                                  : 'hover:bg-accent-purple/10'
                              }`}
                            >
                              {i}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      if (endPage < totalStatePages) {
                        if (endPage < totalStatePages - 1) {
                          pages.push(
                            <PaginationItem key="ellipsis-end">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        pages.push(
                          <PaginationItem key={totalStatePages}>
                            <PaginationLink
                              onClick={() => {
                                setCurrentStatePage(totalStatePages);
                                document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="cursor-pointer hover:bg-accent-purple/10"
                            >
                              {totalStatePages}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      return pages;
                    })()}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => {
                          if (currentStatePage < totalStatePages) {
                            setCurrentStatePage(currentStatePage + 1);
                            document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={currentStatePage === totalStatePages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent-purple/10'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
          )}
        </div>
      </section>

          {/* Don't remove this comment - for the sliding window pagination logic reference */}
    
      {/* Districts Section */}
      {/* <section id="districts" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Latest Updates
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-accent-purple mb-4">
                Recently Updated Districts
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse the latest MGNREGA data from districts across India
              </p>
            </motion.div>
          </div> */}

          {/* Loading State */}
          {/* {isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Loading districts...</p>
            </div>
          ) : districts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {districts.map((district: District) => (
                  <DistrictCard key={district.id} district={district} />
                ))}
              </div> */}

              {/* Pagination */}
              {/* {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem> */}
                      
                      {/* Sliding window pagination logic */}
                      {/* {(() => {
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
      </section> */}

      {/* Footer - Enhanced for SEO & All India Coverage */}
      <footer className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div className="text-base font-bold text-gray-900">MGNREGA India</div>
                  <div className="text-sm text-gray-500">All States Dashboard</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track MGNREGA employment and expenditure across all 36 states and 700+ districts of India. Transparent data for empowered citizens.
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
                  <Link href="/map" className="text-gray-600 hover:text-gray-900 transition-colors font-semibold">
                    🗺️ Interactive Map
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

            {/* Official Resources */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Official Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a 
                    href="https://nrega.nic.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    MGNREGA Official
                  </a>
                </li>
                <li>
                  <a 
                    href="https://rural.nic.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Ministry of Rural Development
                  </a>
                </li>
                <li>
                  <a 
                    href="https://data.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Data.gov.in
                  </a>
                </li>
              </ul>
            </div>

            {/* Coverage Info */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Coverage</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>36 States & UTs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>700+ Districts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Real-time Updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>9 Indian Languages</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with SEO-friendly content */}
          <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
            <p className="text-xs text-gray-600 text-center leading-relaxed max-w-4xl mx-auto">
              <strong>About MGNREGA:</strong> The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) provides a legal guarantee for 100 days of wage employment in a financial year to rural households whose adult members volunteer to do unskilled manual work. This dashboard provides transparent access to employment data, expenditure tracking, and work progress across all Indian states.
            </p>
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} MGNREGA India Dashboard. Data sourced from official government portals. {t('footer.license')}
            </p>
          </div>
        </div>
      </footer>

      {/* Location Detector */}
      <LocationDetector />
    </div>
  );
}
