"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface IndiaMapProps {
  geoJsonData: any;
  onFeatureClick?: (feature: any) => void;
  onFeatureHover?: (feature: any) => void;
  center?: [number, number];
  zoom?: number;
  bounds?: LatLngBoundsExpression;
  height?: string;
  getFeatureStyle?: (feature: any) => any;
  showTooltip?: boolean;
}

// Component to fit bounds when data changes
function FitBounds({ bounds }: { bounds?: LatLngBoundsExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

export function IndiaMap({
  geoJsonData,
  onFeatureClick,
  onFeatureHover,
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  bounds,
  height = "600px",
  getFeatureStyle,
  showTooltip = true,
}: IndiaMapProps) {
  const geoJsonLayerRef = useRef<L.GeoJSON>(null);
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const defaultStyle = {
    fillColor: '#3b82f6',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.6,
  };

  const hoverStyle = {
    weight: 3,
    color: '#1e40af',
    fillOpacity: 0.8,
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle(hoverStyle);
        
        if (onFeatureHover) {
          onFeatureHover(feature);
        }
        
        if (showTooltip) {
          const districtName = feature.properties.district || feature.properties.NAME_1 || feature.properties.ST_NM || 'Unknown';
          setTooltipContent(districtName);
          setTooltipPosition({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle(e.target);
        }
        setTooltipPosition(null);
      },
      mousemove: (e: L.LeafletMouseEvent) => {
        if (showTooltip) {
          setTooltipPosition({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
        }
      },
      click: (e: L.LeafletMouseEvent) => {
        if (onFeatureClick) {
          onFeatureClick(feature);
        }
      },
    });
  };

  const style = (feature: any) => {
    if (getFeatureStyle) {
      return getFeatureStyle(feature);
    }
    return defaultStyle;
  };

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoJsonData && (
          <GeoJSON
            ref={geoJsonLayerRef}
            data={geoJsonData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        
        {bounds && <FitBounds bounds={bounds} />}
      </MapContainer>

      {/* Custom Tooltip */}
      {tooltipPosition && tooltipContent && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}
