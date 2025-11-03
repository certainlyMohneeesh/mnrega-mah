"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface InteractiveIndiaMapProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

// Map GeoJSON state names to our database state names
const normalizeStateName = (name: string): string => {
  const normalized = name.toUpperCase()
    .replace(/&/g, "AND")
    .replace(/\s+/g, " ")
    .trim();
  
  const mappings: Record<string, string> = {
    "ANDAMAN AND N ICOBAR": "ANDAMAN AND NICOBAR",
    "ANDAMAN AND NICOBAR": "ANDAMAN AND NICOBAR",
    "ANDAMAN & NICOBAR": "ANDAMAN AND NICOBAR",
    "ANDAMAN AND NICOBAR ISLANDS": "ANDAMAN AND NICOBAR",
    "DADRA AND NAGAR HAVE": "DADRA AND NAGAR HAVELI",
    "DADRA & NAGAR HAVELI": "DADRA AND NAGAR HAVELI",
    "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "DADRA AND NAGAR HAVELI",
    "DAMAN & DIU": "DAMAN AND DIU",
    "JAMMU & KASHMIR": "JAMMU AND KASHMIR",
    "NCT OF DELHI": "DELHI",
    "DAMAN AND DIU": "DAMAN AND DIU",
    "LAKSHADWEEP": "LAKSHADWEEP",
    "PONDICHERRY": "PUDUCHERRY",
  };
  
  return mappings[normalized] || normalized;
};

export function InteractiveIndiaMapCanvas({ className, onStateClick }: InteractiveIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string>("");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  // Build state map once
  const stateMap = useRef<Map<string, typeof ALL_INDIAN_STATES[0]>>(
    new Map(ALL_INDIAN_STATES.map(state => [state.name, state]))
  ).current;

  // Load GeoJSON data once
  useEffect(() => {
    let isMounted = true;
    
    fetch("/india-states.json")
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setGeoData(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to load map data:", err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Mercator projection (simplified, inline for performance)
  const project = useCallback((lon: number, lat: number): [number, number] => {
    const scale = 1100;
    const centerLon = 82;
    const centerLat = 23;
    
    const x = scale * (lon - centerLon);
    const y = -scale * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const offsetY = scale * Math.log(Math.tan(Math.PI / 4 + (centerLat * Math.PI) / 360));
    
    return [x + 400, y + offsetY + 450];
  }, []);

  // Convert coordinates to SVG path
  const coordsToPath = useCallback((coords: any): string => {
    if (!coords || coords.length === 0) return "";
    
    const processRing = (ring: any[]): string => {
      if (!Array.isArray(ring[0])) return "";
      
      const points = ring.map(([lon, lat]) => project(lon, lat));
      if (points.length === 0) return "";
      
      let path = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i][0]} ${points[i][1]}`;
      }
      path += " Z";
      return path;
    };

    if (coords[0] && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
      // MultiPolygon
      return coords.map((polygon: any) => 
        polygon.map((ring: any) => processRing(ring)).join(" ")
      ).join(" ");
    } else if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      // Polygon
      return coords.map((ring: any) => processRing(ring)).join(" ");
    }
    
    return "";
  }, [project]);

  const handleStateClick = useCallback((stateName: string) => {
    const normalizedName = normalizeStateName(stateName);
    const stateInfo = stateMap.get(normalizedName);
    
    if (stateInfo) {
      const slug = stateNameToSlug(stateInfo.name);
      if (onStateClick) {
        onStateClick(slug);
      } else {
        router.push(`/state/${slug}`);
      }
    }
  }, [stateMap, onStateClick, router]);

  const handleMouseEnter = useCallback((stateName: string, event: React.MouseEvent) => {
    const normalizedName = normalizeStateName(stateName);
    const stateInfo = stateMap.get(normalizedName);
    
    setHoveredState(normalizedName);
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      name: stateInfo?.displayName || stateName,
    });
  }, [stateMap]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => prev ? {
      ...prev,
      x: event.clientX,
      y: event.clientY,
    } : null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredState("");
    setTooltip(null);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
        <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading India map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
        <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-sm text-muted-foreground">Failed to load map data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
        {/* Tooltip - Fixed positioning */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none transition-none"
            style={{
              left: `${tooltip.x + 15}px`,
              top: `${tooltip.y - 50}px`,
              transform: "translate3d(0,0,0)", // Force GPU
            }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap border border-primary-foreground/20">
              {tooltip.name}
              <div className="text-xs opacity-90 mt-0.5">Click to explore districts</div>
            </div>
          </div>
        )}

        {/* Native SVG Map - No react-simple-maps overhead */}
        <div className="relative w-full" style={{ aspectRatio: "1 / 1.2" }}>
          <svg
            ref={svgRef}
            viewBox="0 0 800 900"
            className="w-full h-full"
            style={{
              shapeRendering: "geometricPrecision",
            }}
          >
            <defs>
              <style>{`
                .state-path {
                  transition: none;
                  vector-effect: non-scaling-stroke;
                }
              `}</style>
            </defs>
            
            {geoData.features.map((feature: any, index: number) => {
              const stateName = feature.properties.NAME_1 || feature.properties.NAME || "";
              const normalizedName = normalizeStateName(stateName);
              const isHovered = hoveredState === normalizedName;
              const stateInfo = stateMap.get(normalizedName);
              const isDataAvailable = !!stateInfo;
              const pathData = coordsToPath(feature.geometry.coordinates);

              return (
                <path
                  key={`state-${index}`}
                  className="state-path"
                  d={pathData}
                  fill={isHovered 
                    ? (isDataAvailable ? "#2563eb" : "#64748b")
                    : (isDataAvailable ? "#3b82f6" : "#94a3b8")
                  }
                  stroke="#1e293b"
                  strokeWidth={isHovered ? 1 : 0.5}
                  onMouseEnter={(e) => handleMouseEnter(stateName, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleStateClick(stateName)}
                  style={{
                    cursor: isDataAvailable ? "pointer" : "not-allowed",
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            🗺️ Navigate India's MGNREGA Data
          </p>
          <p className="text-xs text-muted-foreground">
            Click on any state to explore detailed district-level employment and expenditure data
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-600" style={{ backgroundColor: "#3b82f6" }}></div>
              <span>Data Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-600" style={{ backgroundColor: "#2563eb" }}></div>
              <span>Hover State</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
