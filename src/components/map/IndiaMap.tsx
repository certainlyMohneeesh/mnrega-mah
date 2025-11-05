"use client";

import { MapContainer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, GeoJSON as LeafletGeoJSON, Layer } from 'leaflet';
import { useEffect, useRef } from 'react';

interface IndiaMapProps {
  geoJsonData: any;
  onFeatureClick?: (feature: any) => void;
  onFeatureHover?: (feature: any) => void;
  getFeatureStyle?: (feature: any) => any;
  center?: [number, number];
  zoom?: number;
  height?: string;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fillOpacity?: number;
  description?: string;
}

// Component to fit bounds automatically
function FitBounds() {
  const map = useMap();
  
  useEffect(() => {
    // Fit map to show all of India with padding
    map.fitBounds([
      [8.4, 68.7], // Southwest corner
      [35.5, 97.4], // Northeast corner
    ], { padding: [20, 20] });
  }, [map]);
  
  return null;
}

export function IndiaMap({
  geoJsonData,
  onFeatureClick,
  onFeatureHover,
  getFeatureStyle,
  center = [22, 80], // Center of India
  zoom = 4,
  height = "600px",
  fillColor = "#3498db",
  borderColor = "#000000",
  borderWidth = 1,
  fillOpacity = 0.7,
  description = "Click on any state to view details"
}: IndiaMapProps) {
  const geoJsonLayerRef = useRef<LeafletGeoJSON>(null);

  const defaultStyle = {
    fillColor: fillColor,
    weight: borderWidth,
    opacity: 1,
    color: borderColor,
    fillOpacity: fillOpacity,
  };

  const hoverStyle = {
    weight: borderWidth + 1,
    fillOpacity: Math.min(fillOpacity + 0.2, 1),
    dashArray: '0 4 0',
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.st_nm || feature.properties.ST_NM || feature.properties.district || 'Unknown';
    
    // Bind tooltip to show state name on hover
    layer.bindTooltip(stateName, {
      permanent: false,
      direction: 'top',
      className: 'leaflet-custom-tooltip',
      opacity: 0.9,
    });

    // Add hover and click interactions
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle(hoverStyle);
        layer.openTooltip();
        
        if (onFeatureHover) {
          onFeatureHover(feature);
        }
      },
      mouseout: (e: any) => {
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle(e.target);
        }
        e.target.closeTooltip();
      },
      click: (e: any) => {
        if (onFeatureClick) {
          onFeatureClick(feature);
        }
      },
    });
  };
  
  // Style function
  const styleFeature = (feature: any) => {
    if (getFeatureStyle) {
      return getFeatureStyle(feature);
    }
    return defaultStyle;
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#f3f4f6' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="outline-none"
      >
        {geoJsonData && (
          <GeoJSON
            ref={geoJsonLayerRef}
            data={geoJsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        
        <FitBounds />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Description overlay */}
      {description && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-700 font-medium">{description}</p>
        </div>
      )}
    </div>
  );
}
