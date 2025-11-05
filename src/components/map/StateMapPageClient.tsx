"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapWrapper } from '@/components/map/MapWrapper';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { getColorForValue, formatIndianNumber, getMinMax, generateLegendItems, COLOR_SCALES } from '@/lib/map-utils';
import { StateInfo } from '@/lib/state-utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with Leaflet
const IndiaMap = dynamic(() => import('@/components/map/IndiaMap').then(mod => mod.IndiaMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface DistrictData {
  id: string;
  code: string;
  name: string;
  stateCode: string;
  stateName: string;
  totalExpenditure: number;
  totalHouseholds: number;
  totalPersonDays: number;
  totalWorks: number;
  hasData: boolean;
}

interface StateMapPageClientProps {
  stateInfo: StateInfo;
  stateGeoJson: any;
  districtsData: DistrictData[];
}

type MetricType = 'expenditure' | 'households' | 'personDays' | 'works';

export function StateMapPageClient({ stateInfo, stateGeoJson, districtsData }: StateMapPageClientProps) {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('expenditure');
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);

  // Create a map of district names to data
  const districtDataMap = new Map(
    districtsData.map(district => [district.name.toLowerCase(), district])
  );

  // Get metric values for color scaling
  const metricValues = districtsData.map(district => {
    switch (selectedMetric) {
      case 'expenditure': return district.totalExpenditure;
      case 'households': return district.totalHouseholds;
      case 'personDays': return district.totalPersonDays;
      case 'works': return district.totalWorks;
      default: return 0;
    }
  });

  const { min, max } = getMinMax(metricValues);
  const colorScale = COLOR_SCALES[selectedMetric];

  // Style function for GeoJSON features
  const getFeatureStyle = (feature: any) => {
    const districtName = (feature.properties.district || feature.properties.dtname || feature.properties.NAME_2 || '').toLowerCase();
    const districtData = districtDataMap.get(districtName);
    
    if (!districtData || !districtData.hasData) {
      return {
        fillColor: '#e5e7eb',
        weight: 1.5,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.6,
      };
    }

    let value = 0;
    switch (selectedMetric) {
      case 'expenditure': value = districtData.totalExpenditure; break;
      case 'households': value = districtData.totalHouseholds; break;
      case 'personDays': value = districtData.totalPersonDays; break;
      case 'works': value = districtData.totalWorks; break;
    }

    return {
      fillColor: getColorForValue(value, min, max, colorScale),
      weight: 1.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7,
    };
  };

  const handleFeatureClick = (feature: any) => {
    const districtName = (feature.properties.district || feature.properties.dtname || feature.properties.NAME_2 || '').toLowerCase();
    const districtData = districtDataMap.get(districtName);
    
    if (districtData && districtData.hasData) {
      // Navigate directly to district page
      router.push(`/district/${districtData.id}`);
    }
  };

  const handleFeatureHover = (feature: any) => {
    const districtName = (feature.properties.district || feature.properties.dtname || feature.properties.NAME_2 || '').toLowerCase();
    const districtData = districtDataMap.get(districtName);
    setHoveredDistrict(districtData || null);
  };

  const handleFullscreen = () => {
    const elem = document.getElementById('map-container');
    if (!document.fullscreenElement && elem) {
      elem.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const legendItems = generateLegendItems(
    min,
    max,
    colorScale,
    selectedMetric === 'expenditure' ? formatIndianNumber : (v) => v.toLocaleString('en-IN')
  );

  const metricLabels = {
    expenditure: 'Total Expenditure',
    households: 'Households Provided Employment',
    personDays: 'Person Days Generated',
    works: 'Works Completed',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to India Map
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {stateInfo.displayName} - Districts
              </h1>
              <p className="text-gray-600 mt-1">
                Click on any district to view detailed data
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
            >
              Home
            </Link>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(metricLabels) as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="map-container" className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          <MapWrapper>
            <IndiaMap
              geoJsonData={stateGeoJson}
              onFeatureClick={handleFeatureClick}
              onFeatureHover={handleFeatureHover}
              getFeatureStyle={getFeatureStyle}
              height="700px"
              showPermanentLabels={true}
              labelType="district"
            />
            
            <MapControls
              onFullscreen={handleFullscreen}
              onHome={() => router.push('/map')}
              showHomeButton={true}
            />
            
            <MapLegend
              title={metricLabels[selectedMetric]}
              items={legendItems}
              position="bottom-left"
            />

            {/* Hovered District Info Card */}
            {hoveredDistrict && (
              <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {hoveredDistrict.name}
                </h3>
                {hoveredDistrict.hasData ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expenditure:</span>
                      <span className="font-semibold text-brand">
                        {formatIndianNumber(hoveredDistrict.totalExpenditure)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Households:</span>
                      <span className="font-semibold">
                        {hoveredDistrict.totalHouseholds.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Person Days:</span>
                      <span className="font-semibold">
                        {hoveredDistrict.totalPersonDays.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Works:</span>
                      <span className="font-semibold">
                        {hoveredDistrict.totalWorks.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 pt-2 border-t">Click to view detailed dashboard</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No data available for this district</p>
                )}
              </div>
            )}
          </MapWrapper>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Expenditure</div>
            <div className="text-2xl font-bold text-brand">
              {formatIndianNumber(districtsData.reduce((sum, d) => sum + d.totalExpenditure, 0))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Households</div>
            <div className="text-2xl font-bold text-blue-600">
              {districtsData.reduce((sum, d) => sum + d.totalHouseholds, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Person Days</div>
            <div className="text-2xl font-bold text-green-600">
              {districtsData.reduce((sum, d) => sum + d.totalPersonDays, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Works</div>
            <div className="text-2xl font-bold text-yellow-600">
              {districtsData.reduce((sum, d) => sum + d.totalWorks, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Districts List */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Districts ({districtsData.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {districtsData.map((district) => (
              <Link
                key={district.id}
                href={`/district/${district.id}`}
                className="px-3 py-2 bg-gray-50 hover:bg-brand/10 rounded-lg text-sm text-gray-700 hover:text-brand transition-colors"
              >
                {district.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
