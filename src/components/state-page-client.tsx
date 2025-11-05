"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { DistrictCard } from "@/components/district-card";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  TrendingUp,
  Users,
  Briefcase,
  IndianRupee,
  MapPin,
  Clock,
  Home,
  ChevronRight,
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

interface StatePageClientProps {
  initialData: {
    state: {
      code: string;
      name: string;
      displayName: string;
    };
    districts: District[];
    metrics: {
      totalExpenditure: number;
      householdsWorked: number;
      completedWorks: number;
      ongoingWorks: number;
      scPersonDays: number;
      stPersonDays: number;
      womenPersonDays: number;
      totalDistricts: number;
      districtsWithData: number;
    };
    lastUpdated: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function StatePageClient({ initialData, pagination: initialPagination }: StatePageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [districts, setDistricts] = useState<District[]>(initialData.districts);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);
  const [pagination, setPagination] = useState(initialPagination);
  const { t } = useLanguage();
  const router = useRouter();

  const { state, metrics, lastUpdated } = initialData;

  // Filter districts by search query (client-side for current page)
  const filteredDistricts = districts.filter((district) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      district.name.toLowerCase().includes(query) ||
      district.code.toLowerCase().includes(query)
    );
  });

  // Fetch districts when page changes
  useEffect(() => {
    if (currentPage === initialPagination.page) return;

    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const stateSlug = state.name.toLowerCase().replace(/\s+/g, "-");
        const response = await fetch(
          `/api/state/${stateSlug}/districts?page=${currentPage}&limit=${pagination.limit}`
        );
        const data = await response.json();

        if (data.success) {
          setDistricts(data.data.districts);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistricts();
  }, [currentPage, state.name, pagination.limit, initialPagination.page]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, currentPage]);

  // Calculate display range for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.totalPages;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }

    return pages;
  };

  const totalPersonDays = metrics.scPersonDays + metrics.stPersonDays + metrics.womenPersonDays;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  {t('nav.home')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">{state.displayName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* State Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-2 bg-primary/20 rounded-full text-sm font-medium text-primary mb-4">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              State Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {state.displayName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Track MGNREGA employment and expenditure across all {metrics.totalDistricts} districts of {state.displayName}.
              {lastUpdated && (
                <span className="block mt-2 text-sm">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  {t('home.lastUpdated')}: {formatDate(lastUpdated)}
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* State-Level Statistics */}
      <section className="py-12 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">{state.displayName} at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={IndianRupee}
              title={t('home.stats.expenditure')}
              value={formatIndianNumber(metrics.totalExpenditure)}
              subtitle={`Across ${metrics.districtsWithData} districts`}
            />
            <StatCard
              icon={Users}
              title={t('home.stats.households')}
              value={formatNumber(metrics.householdsWorked)}
              subtitle={t('home.stats.statewide')}
            />
            <StatCard
              icon={Briefcase}
              title={t('home.stats.works')}
              value={formatNumber(metrics.completedWorks)}
              subtitle={`${formatNumber(metrics.ongoingWorks)} ${t('home.inProgress')}`}
            />
            <StatCard
              icon={TrendingUp}
              title={t('home.stats.personDays')}
              value={formatNumber(totalPersonDays)}
              subtitle={`${formatNumber(metrics.womenPersonDays)} ${t('home.byWomen')}`}
            />
          </div>
        </motion.div>
      </section>

      {/* Districts Section */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder={`Search districts in ${state.displayName}...`}
              />
            </div>

            {/* Districts Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {t('home.districts.title')}
              </h2>
              <div className="text-sm text-muted-foreground">
                {searchQuery ? (
                  `${filteredDistricts.length} results`
                ) : (
                  `Page ${currentPage} of ${pagination.totalPages} • ${pagination.total} ${t('nav.districts')}`
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading districts...</p>
              </div>
            )}

            {/* Districts Grid */}
            {!isLoading && filteredDistricts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDistricts.map((district, index) => (
                  <motion.div
                    key={district.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <DistrictCard district={district} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredDistricts.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('home.noResults')}
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search query
                </p>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !searchQuery && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum as number)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < pagination.totalPages && setCurrentPage(currentPage + 1)}
                        className={
                          currentPage === pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
