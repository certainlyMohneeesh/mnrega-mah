"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { formatIndianNumber, formatNumber } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface District {
  id: string;
  code: string;
  name: string;
  metrics: Array<{
    id: string;
    finYear: string;
    month: string;
    totalExpenditure: number;
    totalHouseholdsWorked: number;
    numberOfCompletedWorks: number;
    numberOfOngoingWorks: number;
    averageWageRatePerDay: number;
  }>;
}

interface ComparePageClientProps {
  initialDistricts: District[];
  d1?: string;
  d2?: string;
}

export function ComparePageClient({ initialDistricts, d1, d2 }: ComparePageClientProps) {
  const { t } = useLanguage();
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all districts for dropdown with cache busting
    // Add timestamp to force fresh data
    const timestamp = new Date().getTime();
    fetch(`/api/districts?v=${timestamp}`, {
      cache: 'no-store', // Don't use browser cache
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log(`✅ Loaded ${data.data.length} districts for comparison`);
          setAllDistricts(data.data);
        } else {
          console.error('❌ Failed to fetch districts:', data.error);
        }
      })
      .catch(error => {
        console.error('❌ Error fetching districts:', error);
      });
  }, []);

  const addDistrict = async (districtId: string) => {
    if (!districtId || districts.find(d => d.id === districtId)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/districts/${districtId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to fetch district:', errorData.error || `HTTP ${res.status}`);
        alert(`Failed to load district: ${errorData.error || 'District not found'}`);
        return;
      }
      
      const data = await res.json();
      
      if (data.success && data.data && data.data.metrics && data.data.metrics.length > 0) {
        const newDistricts = [...districts, data.data];
        setDistricts(newDistricts);
        
        // Update URL with proper parameters
        const params = new URLSearchParams();
        if (districts.length === 0) {
          params.set('d1', districtId);
        } else if (districts.length === 1) {
          params.set('d1', districts[0].id);
          params.set('d2', districtId);
        } else {
          // For more than 2 districts, just update the display
          // URL only supports d1 and d2 for now
          params.set('d1', districts[0].id);
          params.set('d2', districts[1].id);
        }
        window.history.pushState({}, '', `/compare?${params.toString()}`);
      } else {
        console.error('Invalid district data received:', data);
        alert('Failed to load district: No data available');
      }
    } catch (error) {
      console.error('Failed to add district:', error);
      alert('Failed to load district: Network error');
    } finally {
      setLoading(false);
    }
  };

  const removeDistrict = (districtId: string) => {
    const newDistricts = districts.filter(d => d.id !== districtId);
    setDistricts(newDistricts);
    
    // Update URL
    if (newDistricts.length === 0) {
      window.history.pushState({}, '', '/compare');
    } else if (newDistricts.length === 1) {
      window.history.pushState({}, '', `/compare?d1=${newDistricts[0].id}`);
    }
  };

  // Prepare comparison data for charts
  const getComparisonData = (key: keyof District['metrics'][0]) => {
    if (districts.length === 0) return [];
    
    const periods = districts[0].metrics.slice(0, 12).reverse().map(m => `${m.month.substring(0, 3)} ${m.finYear}`);
    
    return periods.map((period, idx) => {
      const dataPoint: any = { period };
      districts.forEach(district => {
        const metric = district.metrics[districts[0].metrics.length - 12 + idx];
        if (metric) {
          dataPoint[district.name] = key === 'totalExpenditure' 
            ? metric[key] / 1000  // Convert to thousands (K)
            : metric[key];
        }
      });
      return dataPoint;
    });
  };

  const expenditureData = getComparisonData('totalExpenditure');
  const householdsData = getComparisonData('totalHouseholdsWorked');
  const worksData = getComparisonData('numberOfCompletedWorks');

  const colors = ["#E76D67", "#514E80", "#7F7AB0", "#10B981"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header with Purple Background */}
      <div className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#514E80' }}>
        <div className="mx-auto max-w-7xl">
          <Link 
            href="/#districts" 
            className="inline-flex items-center gap-2 text-white hover:text-white/90 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('compare.backToDistricts')}</span>
          </Link>
          
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl text-white" style={{ lineHeight: '1.2' }}>
            {t('compare.title')}
          </h1>
          <p className="mt-3 text-lg text-white font-medium">
            {t('compare.subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* District Selection */}
        <section>
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#252653' }}>{t('compare.selectedDistricts')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {districts.map((district) => (
              <Card key={district.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{district.name}</CardTitle>
                      <CardDescription>{t('compare.code')}: {district.code}</CardDescription>
                    </div>
                    <button
                      onClick={() => removeDistrict(district.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {district.metrics.length} {t('compare.monthsOfData')}
                  </p>
                </CardContent>
              </Card>
            ))}

            {districts.length < 4 && (
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t('compare.addDistrict')}</CardTitle>
                  <CardDescription>
                    {loading ? t('compare.loadingDistrict') : `${allDistricts.length - districts.length} ${t('compare.districtsAvailable')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    onValueChange={(value) => value && addDistrict(value)}
                    disabled={loading || allDistricts.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        loading ? t('compare.loading') : 
                        allDistricts.length === 0 ? t('compare.noDistrictsAvailable') :
                        t('compare.selectDistrict')
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {allDistricts.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          {t('compare.noDistrictsWithData')}
                        </div>
                      ) : (
                        allDistricts
                          .filter(d => !districts.find(selected => selected.id === d.id))
                          .map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {districts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">{t('compare.noDistrictsSelected')}</p>
            <p className="text-sm text-gray-500">{t('compare.selectDistrictsPrompt')}</p>
          </div>
        )}

        {districts.length > 0 && (
          <>
            {/* Expenditure Comparison */}
            <section>
              <Card className="border-t-4" style={{ borderTopColor: '#E76D67' }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('compare.expenditureComparison')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('compare.expenditureComparisonDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={expenditureData}
                    lines={districts.map((d, idx) => ({
                      dataKey: d.name,
                      stroke: colors[idx % colors.length],
                      name: d.name,
                    }))}
                    xAxisKey="period"
                    height={400}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Households Comparison */}
            <section>
              <Card className="border-t-4" style={{ borderTopColor: '#3B82F6' }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('compare.householdsComparison')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('compare.householdsComparisonDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={householdsData}
                    lines={districts.map((d, idx) => ({
                      dataKey: d.name,
                      stroke: colors[idx % colors.length],
                      name: d.name,
                    }))}
                    xAxisKey="period"
                    height={400}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Works Comparison */}
            <section>
              <Card className="border-t-4" style={{ borderTopColor: '#10B981' }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('compare.worksComparison')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('compare.worksComparisonDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={worksData}
                    bars={districts.map((d, idx) => ({
                      dataKey: d.name,
                      fill: colors[idx % colors.length],
                      name: d.name,
                    }))}
                    xAxisKey="period"
                    height={400}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Latest Metrics Table */}
            <section>
              <Card className="border-t-4" style={{ borderTopColor: '#514E80' }}>
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('compare.latestMetrics')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('compare.latestMetricsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2" style={{ borderBottomColor: '#514E80' }}>
                          <th className="p-4 text-left font-bold text-gray-900 bg-gray-50">{t('table.district')}</th>
                          <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.expenditure')}</th>
                          <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.households')}</th>
                          <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.completed')}</th>
                          <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.ongoing')}</th>
                          <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.avgWage')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {districts.map((district, index) => {
                          const latest = district.metrics[0];
                          return (
                            <tr key={district.id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                              <td className="p-4 text-left font-semibold" style={{ color: '#252653' }}>
                                {district.name}
                              </td>
                              <td className="p-4 text-right font-semibold text-green-600">
                                {formatIndianNumber(latest.totalExpenditure)}
                              </td>
                              <td className="p-4 text-right text-gray-700">
                                {formatNumber(latest.totalHouseholdsWorked)}
                              </td>
                              <td className="p-4 text-right text-gray-700">
                                {formatNumber(latest.numberOfCompletedWorks)}
                              </td>
                              <td className="p-4 text-right text-gray-700">
                                {formatNumber(latest.numberOfOngoingWorks)}
                              </td>
                              <td className="p-4 text-right text-gray-700">
                                ₹{formatNumber(latest.averageWageRatePerDay)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
