"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Users, Briefcase, IndianRupee, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { formatIndianNumber, formatNumber, formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface District {
  id: string;
  code: string;
  name: string;
  stateCode: string;
  stateName: string;
  metrics: Array<{
    id: string;
    finYear: string;
    month: string;
    totalExpenditure: number;
    totalHouseholdsWorked: number;
    numberOfCompletedWorks: number;
    numberOfOngoingWorks: number;
    womenPersonDays: number;
    scPersonDays: number;
    stPersonDays: number;
    personDaysOfCentralLiability: number;
    averageWageRatePerDay: number;
    totalNumberOfActiveJobCards: number;
    createdAt: string;
  }>;
}

interface DistrictDashboardProps {
  district: District;
}

export function DistrictDashboard({ district }: DistrictDashboardProps) {
  const { t } = useLanguage();
  
  // Get the latest metrics for key stats
  const latestMetric = district.metrics[0];
  
  // Prepare trend data (last 12 months)
  const trendData = district.metrics.slice(0, 12).reverse().map((m) => ({
    period: `${m.month.substring(0, 3)} ${m.finYear}`,
    expenditure: m.totalExpenditure / 1000, // Convert to thousands (K)
    households: m.totalHouseholdsWorked,
    works: m.numberOfCompletedWorks + m.numberOfOngoingWorks,
  }));

  // Prepare works data
  const worksData = district.metrics.slice(0, 6).reverse().map((m) => ({
    period: `${m.month.substring(0, 3)} ${m.finYear}`,
    completed: m.numberOfCompletedWorks,
    ongoing: m.numberOfOngoingWorks,
  }));

  // Prepare demographics data (using latest metric)
  const demographicsData = [
    { name: "Women", value: latestMetric.womenPersonDays },
    { name: "SC Workers", value: latestMetric.scPersonDays },
    { name: "ST Workers", value: latestMetric.stPersonDays },
    { name: "Others", value: latestMetric.personDaysOfCentralLiability - latestMetric.womenPersonDays - latestMetric.scPersonDays - latestMetric.stPersonDays },
  ].filter(d => d.value > 0);

  const demographicsColors = ["#E76D67", "#514E80", "#7F7AB0", "#EDC9C4"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header with Coral Background */}
      <div className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E76D67' }}>
        <div className="mx-auto max-w-7xl">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white hover:text-white/90 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('district.backToDistricts')}</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl text-white" style={{ lineHeight: '1.2' }}>
                {district.name}
              </h1>
              <p className="mt-3 text-lg text-white font-medium">
                {t('district.code')}: {district.code} • {district.stateName}
              </p>
            </div>
            
            <Link
              href={`/compare?d1=${district.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all border-2 border-white text-white hover:bg-white hover:text-gray-900 self-start"
            >
              {t('district.compareButton')}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Key Metrics */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#252653' }}>{t('district.keyMetrics')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('district.totalExpenditure')}
              value={formatIndianNumber(latestMetric.totalExpenditure)}
              subtitle={`${latestMetric.month} ${latestMetric.finYear}`}
              icon={IndianRupee}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500"
            />
            <StatCard
              title={t('district.householdsWorked')}
              value={formatNumber(latestMetric.totalHouseholdsWorked)}
              subtitle={t('district.currentMonth')}
              icon={Users}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500"
            />
            <StatCard
              title={t('district.worksCompleted')}
              value={formatNumber(latestMetric.numberOfCompletedWorks)}
              subtitle={t('district.finishedProjects')}
              icon={Briefcase}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-accent-purple"
            />
            <StatCard
              title={t('district.ongoingWorks')}
              value={formatNumber(latestMetric.numberOfOngoingWorks)}
              subtitle={t('district.inProgress')}
              icon={TrendingUp}
              className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-brand"
            />
          </div>
        </section>

        {/* Expenditure Trend */}
        <section>
          <Card className="border-t-4" style={{ borderTopColor: '#E76D67' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('district.expenditureTrend')}</CardTitle>
              <CardDescription className="text-base">
                {t('district.expenditureTrendDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={trendData}
                lines={[
                  { dataKey: "expenditure", stroke: "#E76D67", name: t('district.expenditureCr') },
                ]}
                xAxisKey="period"
                height={350}
              />
            </CardContent>
          </Card>
        </section>

        {/* Two-column layout for charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Works Status */}
          <Card className="border-t-4" style={{ borderTopColor: '#10B981' }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: '#252653' }}>{t('district.worksProgress')}</CardTitle>
              <CardDescription>
                {t('district.worksProgressDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={worksData}
                bars={[
                  { dataKey: "completed", fill: "#10B981", name: t('district.completed') },
                  { dataKey: "ongoing", fill: "#F59E0B", name: t('district.ongoing') },
                ]}
                xAxisKey="period"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card className="border-t-4" style={{ borderTopColor: '#514E80' }}>
            <CardHeader>
              <CardTitle className="text-xl" style={{ color: '#252653' }}>{t('district.personDaysDist')}</CardTitle>
              <CardDescription>
                {t('district.personDaysDistDesc')} {latestMetric.month} {latestMetric.finYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={demographicsData}
                colors={demographicsColors}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Households & Employment Trend */}
        <section>
          <Card className="border-t-4" style={{ borderTopColor: '#3B82F6' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('district.employmentTrend')}</CardTitle>
              <CardDescription className="text-base">
                {t('district.employmentTrendDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={trendData}
                lines={[
                  { dataKey: "households", stroke: "#514E80", name: t('district.households') },
                ]}
                xAxisKey="period"
                height={350}
              />
            </CardContent>
          </Card>
        </section>

        {/* Historical Data Table */}
        <section>
          <Card className="border-t-4" style={{ borderTopColor: '#F59E0B' }}>
            <CardHeader>
              <CardTitle className="text-2xl" style={{ color: '#252653' }}>{t('district.historicalData')}</CardTitle>
              <CardDescription className="text-base">
                {t('district.historicalDataDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2" style={{ borderBottomColor: '#E76D67' }}>
                      <th className="p-4 text-left font-bold text-gray-900 bg-gray-50">{t('table.period')}</th>
                      <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.expenditure')}</th>
                      <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.households')}</th>
                      <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.completed')}</th>
                      <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.ongoing')}</th>
                      <th className="p-4 text-right font-bold text-gray-900 bg-gray-50">{t('table.avgWage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {district.metrics.slice(0, 12).map((metric, index) => (
                      <tr key={metric.id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                        <td className="p-4 text-left font-medium" style={{ color: '#252653' }}>
                          {metric.month} {metric.finYear}
                        </td>
                        <td className="p-4 text-right font-semibold text-green-600">
                          {formatIndianNumber(metric.totalExpenditure)}
                        </td>
                        <td className="p-4 text-right text-gray-700">
                          {formatNumber(metric.totalHouseholdsWorked)}
                        </td>
                        <td className="p-4 text-right text-gray-700">
                          {formatNumber(metric.numberOfCompletedWorks)}
                        </td>
                        <td className="p-4 text-right text-gray-700">
                          {formatNumber(metric.numberOfOngoingWorks)}
                        </td>
                        <td className="p-4 text-right text-gray-700">
                          ₹{formatNumber(metric.averageWageRatePerDay)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
