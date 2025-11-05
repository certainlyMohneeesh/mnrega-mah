"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapWrapper } from '@/components/map/MapWrapper';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { getColorForValue, formatIndianNumber, getMinMax, generateLegendItems, stateNameToSlug, COLOR_SCALES } from '@/lib/map-utils';

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

interface StateData {
  stateCode: string;
  stateName: string;
  totalExpenditure: number;
  totalHouseholds: number;
  totalPersonDays: number;
  totalWorks: number;
}

interface MapPageClientProps {
  statesData: StateData[];
  indiaGeoJson: any;
}

type MetricType = 'expenditure' | 'households' | 'personDays' | 'works';

export function MapPageClient({ statesData, indiaGeoJson }: MapPageClientProps) {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('expenditure');
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Create a map of state names to data
  const stateDataMap = new Map(
    statesData.map(state => [state.stateName.toLowerCase(), state])
  );

  // Get metric values for color scaling
  const metricValues = statesData.map(state => {
    switch (selectedMetric) {
      case 'expenditure': return state.totalExpenditure;
      case 'households': return state.totalHouseholds;
      case 'personDays': return state.totalPersonDays;
      case 'works': return state.totalWorks;
      default: return 0;
    }
  });

  const { min, max } = getMinMax(metricValues);
  const colorScale = COLOR_SCALES[selectedMetric];

  // Style function for GeoJSON features
  const getFeatureStyle = (feature: any) => {
    const stateName = (feature.properties.ST_NM || feature.properties.NAME_1 || '').toLowerCase();
    const stateData = stateDataMap.get(stateName);
    
    if (!stateData) {
      return {
        fillColor: '#e5e7eb',
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.6,
      };
    }

    let value = 0;
    switch (selectedMetric) {
      case 'expenditure': value = stateData.totalExpenditure; break;
      case 'households': value = stateData.totalHouseholds; break;
      case 'personDays': value = stateData.totalPersonDays; break;
      case 'works': value = stateData.totalWorks; break;
    }

    return {
      fillColor: getColorForValue(value, min, max, colorScale),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7,
    };
  };

  const handleFeatureClick = (feature: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.NAME_1;
    const stateData = stateDataMap.get(stateName.toLowerCase());
    
    if (stateData) {
      router.push(`/map/${stateData.stateCode}`);
    }
  };

  const handleFeatureHover = (feature: any) => {
    const stateName = (feature.properties.ST_NM || feature.properties.NAME_1 || '').toLowerCase();
    const stateData = stateDataMap.get(stateName);
    setHoveredState(stateData || null);
  };

  const handleFullscreen = () => {
    const elem = document.getElementById('map-container');
    if (!document.fullscreenElement && elem) {
      elem.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement map export functionality
    alert('Export functionality coming soon!');
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
              <h1 className="text-3xl font-bold text-gray-900">
                MGNREGA India - Interactive Map
              </h1>
              <p className="text-gray-600 mt-1">
                Click on any state to view district-level data
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
            >
              Back to Home
            </button>
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
              geoJsonData={indiaGeoJson}
              onFeatureClick={handleFeatureClick}
              onFeatureHover={handleFeatureHover}
              getFeatureStyle={getFeatureStyle}
              height="700px"
            />
            
            <MapControls
              onFullscreen={handleFullscreen}
              onExport={handleExport}
              onHome={() => router.push('/')}
              showHomeButton={true}
            />
            
            <MapLegend
              title={metricLabels[selectedMetric]}
              items={legendItems}
              position="bottom-left"
            />

            {/* Hovered State Info Card */}
            {hoveredState && (
              <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {hoveredState.stateName}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expenditure:</span>
                    <span className="font-semibold text-brand">
                      {formatIndianNumber(hoveredState.totalExpenditure)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Households:</span>
                    <span className="font-semibold">
                      {hoveredState.totalHouseholds.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Person Days:</span>
                    <span className="font-semibold">
                      {hoveredState.totalPersonDays.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Works:</span>
                    <span className="font-semibold">
                      {hoveredState.totalWorks.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Click to view districts</p>
              </div>
            )}
          </MapWrapper>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Expenditure</div>
            <div className="text-2xl font-bold text-brand">
              {formatIndianNumber(statesData.reduce((sum, s) => sum + s.totalExpenditure, 0))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Households</div>
            <div className="text-2xl font-bold text-blue-600">
              {statesData.reduce((sum, s) => sum + s.totalHouseholds, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Person Days</div>
            <div className="text-2xl font-bold text-green-600">
              {statesData.reduce((sum, s) => sum + s.totalPersonDays, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Works</div>
            <div className="text-2xl font-bold text-yellow-600">
              {statesData.reduce((sum, s) => sum + s.totalWorks, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
