"use client";

import { useEffect, useState } from 'react';

interface MapWrapperProps {
  children: React.ReactNode;
}

export function MapWrapper({ children }: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fix for default marker icons in Leaflet with Next.js
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        // @ts-ignore
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        });
      });
    }
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
}
