"use client";

import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  // @ts-ignore
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

interface MapWrapperProps {
  children: React.ReactNode;
}

export function MapWrapper({ children }: MapWrapperProps) {
  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
}
