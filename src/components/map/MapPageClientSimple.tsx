"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapWrapper } from '@/components/map/MapWrapper';
import { MapCreditsFooter } from '@/components/map/MapCreditsFooter';

// Dynamic import to avoid SSR issues with Leaflet
const IndiaMap = dynamic(() => import('@/components/map/IndiaMap').then(mod => mod.IndiaMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Loading interactive map...</p>
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

export function MapPageClient({ statesData, indiaGeoJson }: MapPageClientProps) {
  const router = useRouter();

  const handleFeatureClick = (feature: any) => {
    const stateName = feature.properties.st_nm || feature.properties.ST_NM || feature.properties.NAME_1;
    
    if (stateName) {
      // Convert state name to slug for URL routing
      // e.g., "Maharashtra" -> "maharashtra", "Andhra Pradesh" -> "andhra-pradesh"
      const stateSlug = stateName.toLowerCase().replace(/\s+/g, '-');
      router.push(`/map/${stateSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">India</h1>
              <p className="text-gray-600 mt-1">
                Click/Hover States to explore MGNREGA data
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Map and Download Panel Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Map Container */}
          <div className="relative aspect-square md:aspect-4/3 lg:aspect-video overflow-hidden flex-1 min-h-[420px] bg-white rounded-lg shadow-lg">
            <MapWrapper>
              <IndiaMap
                geoJsonData={indiaGeoJson}
                onFeatureClick={handleFeatureClick}
                height="100%"
                fillColor="#3498db"
                borderColor="#000000"
                borderWidth={1}
                fillOpacity={0.7}
                description="Click on any state to view district-level data"
                showPermanentLabels={true}
              />
            </MapWrapper>
          </div>

          {/* Stats Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-80 h-fit space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">All India Statistics</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                  <div className="text-xs text-red-600 font-medium mb-1">Total Expenditure</div>
                  <div className="text-2xl font-bold text-red-700">
                    ₹{(statesData.reduce((sum, s) => sum + s.totalExpenditure, 0) / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">Total Households</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(statesData.reduce((sum, s) => sum + s.totalHouseholds, 0) / 100000).toFixed(2)} L
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="text-xs text-green-600 font-medium mb-1">Total Person Days</div>
                  <div className="text-2xl font-bold text-green-700">
                    {(statesData.reduce((sum, s) => sum + s.totalPersonDays, 0) / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="text-xs text-yellow-600 font-medium mb-1">Total Works</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {(statesData.reduce((sum, s) => sum + s.totalWorks, 0) / 100000).toFixed(2)} L
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Coverage</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>States/UTs</span>
                  <span className="font-semibold text-gray-900">{statesData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">How to use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Hover</strong> over any state to see its name</li>
                <li>• <strong>Click</strong> on a state to view district-level MGNREGA data</li>
                <li>• Use <strong>scroll wheel</strong> or zoom controls to zoom in/out</li>
              </ul>
            </div>
          </div>
        </div>

        {/* All States Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All States & Union Territories</h2>
            <p className="text-gray-600">
              To see individual state's data, select any state from the list below
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {statesData
              .sort((a, b) => a.stateName.localeCompare(b.stateName))
              .map((state) => {
                const stateSlug = state.stateName.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link
                    key={state.stateCode}
                    href={`/state/${stateSlug}`}
                    className="group relative px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-accent-purple/10 hover:to-brand/10 rounded-lg text-sm font-medium text-gray-700 hover:text-accent-purple transition-all border border-gray-200 hover:border-accent-purple hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="line-clamp-2">{state.stateName}</span>
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-accent-purple group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        <MapCreditsFooter />
      </div>
    </div>
  );
}
