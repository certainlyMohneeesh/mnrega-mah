"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface InteractiveIndiaMapProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

// India GeoJSON - using simplified local file for optimal performance
const INDIA_GEOJSON = "/india-states-simplified.json";

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

// Memoized Geography component for better performance
const MemoizedGeography = memo(({ 
  geo, 
  isHovered, 
  isDataAvailable,
  onMouseEnter,
  onMouseLeave,
  onClick
}: any) => {
  return (
    <Geography
      geography={geo}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        default: {
          fill: isDataAvailable ? "#3b82f6" : "#94a3b8",
          stroke: "#1e293b",
          strokeWidth: 0.5,
          outline: "none",
        },
        hover: {
          fill: isDataAvailable ? "#2563eb" : "#64748b",
          stroke: "#0f172a",
          strokeWidth: 1,
          outline: "none",
          cursor: isDataAvailable ? "pointer" : "not-allowed",
        },
        pressed: {
          fill: "#1d4ed8",
          stroke: "#0f172a",
          strokeWidth: 1,
          outline: "none",
        },
      }}
    />
  );
});

MemoizedGeography.displayName = "MemoizedGeography";

export function InteractiveIndiaMap({ className, onStateClick }: InteractiveIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const router = useRouter();

  const handleStateClick = useCallback((geoStateName: string) => {
    const normalizedName = normalizeStateName(geoStateName);
    const stateInfo = ALL_INDIAN_STATES.find(s => s.name === normalizedName);
    
    if (stateInfo) {
      const slug = stateNameToSlug(stateInfo.name);
      if (onStateClick) {
        onStateClick(slug);
      } else {
        router.push(`/state/${slug}`);
      }
    }
  }, [onStateClick, router]);

  const handleMouseEnter = useCallback((geo: any, event: React.MouseEvent) => {
    const geoStateName = geo.properties.NAME_1 || geo.properties.ST_NM || geo.properties.NAME || geo.properties.name;
    const normalizedName = normalizeStateName(geoStateName);
    const stateInfo = ALL_INDIAN_STATES.find(s => s.name === normalizedName);
    
    setHoveredState(normalizedName);
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      name: stateInfo?.displayName || geoStateName,
    });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (tooltip) {
      setTooltip({
        ...tooltip,
        x: event.clientX,
        y: event.clientY,
      });
    }
  }, [tooltip]);

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
    setTooltip(null);
  }, []);

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
        {/* Tooltip */}
        <AnimatePresence mode="wait">
          {tooltip && (
            <motion.div
              key={tooltip.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltip.x + 15,
                top: tooltip.y - 50,
              }}
            >
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap border border-primary-foreground/20">
                {tooltip.name}
                <div className="text-xs opacity-90 mt-0.5">Click to explore districts</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div 
          className="relative w-full" 
          style={{ height: "600px" }}
          onMouseMove={handleMouseMove}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 600,
              center: [82.8, 23],
            }}
            width={800}
            height={900}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={INDIA_GEOJSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoStateName = geo.properties.NAME_1 || geo.properties.NAME || geo.properties.ST_NM || geo.properties.name || "";
                  const normalizedName = normalizeStateName(geoStateName);
                  const isHovered = hoveredState === normalizedName;
                  const stateInfo = ALL_INDIAN_STATES.find(s => s.name === normalizedName);
                  const isDataAvailable = !!stateInfo;

                  return (
                    <MemoizedGeography
                      key={geo.rsmKey}
                      geo={geo}
                      isHovered={isHovered}
                      isDataAvailable={isDataAvailable}
                      onMouseEnter={(event: React.MouseEvent) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleStateClick(geoStateName)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
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
