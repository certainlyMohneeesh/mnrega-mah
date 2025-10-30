"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { formatIndianNumber, formatNumber, formatDate } from "@/lib/utils";

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

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) {
      return districts;
    }
    return districts.filter((district) =>
      district.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [districts, searchQuery]);



  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-100 via-red-50 to-purple-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span>Maharashtra MGNREGA Dashboard</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Our Voice,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
                Our Rights
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              Track MGNREGA employment and expenditure across all 34 districts of Maharashtra.
              Transparent data for empowered citizens.
            </p>

            {stateStats && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatDate(stateStats.lastUpdated)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* State-Level Stats */}
      {stateStats && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Expenditure"
                value={formatIndianNumber(stateStats.aggregates.totalExpenditure)}
                subtitle={`Across ${stateStats.aggregates.totalDistricts} districts`}
                icon={IndianRupee}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              />
              
              <StatCard
                title="Households Worked"
                value={formatNumber(stateStats.aggregates.householdsWorked)}
                subtitle="Total households benefited"
                icon={Users}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
              />
              
              <StatCard
                title="Works Completed"
                value={formatNumber(stateStats.aggregates.worksCompleted)}
                subtitle={`${formatNumber(stateStats.aggregates.worksOngoing)} ongoing`}
                icon={Briefcase}
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
              />
              
              <StatCard
                title="Person Days Generated"
                value={formatNumber(stateStats.aggregates.personDaysGenerated)}
                subtitle={`${formatNumber(stateStats.aggregates.womenPersonDays)} women`}
                icon={TrendingUp}
                className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
              />
            </div>
          </div>
        </section>
      )}

      {/* Districts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Explore Districts
              </h2>
              <p className="mt-2 text-gray-600">
                {filteredDistricts.length} of {districts.length} districts
              </p>
            </div>
            
            <SearchBar onSearch={setSearchQuery} placeholder="Search districts..." />
          </div>

          {filteredDistricts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDistricts.map((district) => (
                <DistrictCard key={district.id} district={district} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No districts found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Empowering Citizens with Transparent Data
            </h3>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Data sourced from official MGNREGA reports. This platform aims to make government
              employment schemes more transparent and accessible to all citizens of Maharashtra.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <a href="/about" className="hover:text-gray-900 transition-colors">
                About MGNREGA
              </a>
              <span>•</span>
              <a href="/faq" className="hover:text-gray-900 transition-colors">
                FAQ
              </a>
              <span>•</span>
              <a href="/contact" className="hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
