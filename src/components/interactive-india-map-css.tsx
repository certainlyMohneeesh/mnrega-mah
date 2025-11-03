"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface InteractiveIndiaMapCSSProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

// CSS-based India map layout using CSS Grid
// Each state positioned based on approximate geographic location
const statePositions: Record<string, { 
  gridArea: string; 
  displayName: string;
  dbName: string;
}> = {
  // North
  "jk": { gridArea: "1 / 2 / 3 / 4", displayName: "Jammu & Kashmir", dbName: "JAMMU AND KASHMIR" },
  "ladakh": { gridArea: "1 / 4 / 2 / 6", displayName: "Ladakh", dbName: "LADAKH" },
  "hp": { gridArea: "2 / 3 / 3 / 5", displayName: "Himachal Pradesh", dbName: "HIMACHAL PRADESH" },
  "pb": { gridArea: "2 / 2 / 3 / 3", displayName: "Punjab", dbName: "PUNJAB" },
  "ch": { gridArea: "3 / 2 / 4 / 3", displayName: "Chandigarh", dbName: "CHANDIGARH" },
  "uk": { gridArea: "3 / 4 / 4 / 5", displayName: "Uttarakhand", dbName: "UTTARAKHAND" },
  "hr": { gridArea: "3 / 3 / 4 / 4", displayName: "Haryana", dbName: "HARYANA" },
  "dl": { gridArea: "4 / 3 / 5 / 4", displayName: "Delhi", dbName: "DELHI" },
  
  // Northeast
  "ar": { gridArea: "2 / 8 / 3 / 10", displayName: "Arunachal Pradesh", dbName: "ARUNACHAL PRADESH" },
  "as": { gridArea: "3 / 8 / 4 / 9", displayName: "Assam", dbName: "ASSAM" },
  "nl": { gridArea: "3 / 9 / 4 / 10", displayName: "Nagaland", dbName: "NAGALAND" },
  "mn": { gridArea: "4 / 9 / 5 / 10", displayName: "Manipur", dbName: "MANIPUR" },
  "mz": { gridArea: "5 / 9 / 6 / 10", displayName: "Mizoram", dbName: "MIZORAM" },
  "tr": { gridArea: "4 / 8 / 5 / 9", displayName: "Tripura", dbName: "TRIPURA" },
  "ml": { gridArea: "5 / 8 / 6 / 9", displayName: "Meghalaya", dbName: "MEGHALAYA" },
  "sk": { gridArea: "4 / 5 / 5 / 6", displayName: "Sikkim", dbName: "SIKKIM" },
  
  // Central & East
  "up": { gridArea: "4 / 4 / 6 / 6", displayName: "Uttar Pradesh", dbName: "UTTAR PRADESH" },
  "rj": { gridArea: "4 / 2 / 7 / 4", displayName: "Rajasthan", dbName: "RAJASTHAN" },
  "mp": { gridArea: "6 / 3 / 8 / 5", displayName: "Madhya Pradesh", dbName: "MADHYA PRADESH" },
  "wb": { gridArea: "5 / 6 / 7 / 8", displayName: "West Bengal", dbName: "WEST BENGAL" },
  "br": { gridArea: "5 / 5 / 7 / 6", displayName: "Bihar", dbName: "BIHAR" },
  "jh": { gridArea: "6 / 5 / 7 / 6", displayName: "Jharkhand", dbName: "JHARKHAND" },
  "ct": { gridArea: "7 / 5 / 8 / 6", displayName: "Chhattisgarh", dbName: "CHHATTISGARH" },
  "or": { gridArea: "7 / 6 / 9 / 7", displayName: "Odisha", dbName: "ODISHA" },
  
  // West
  "gj": { gridArea: "6 / 1 / 8 / 3", displayName: "Gujarat", dbName: "GUJARAT" },
  "dd": { gridArea: "6 / 2 / 7 / 3", displayName: "Dadra & Nagar Haveli", dbName: "DADRA AND NAGAR HAVELI" },
  "dn": { gridArea: "7 / 2 / 8 / 3", displayName: "Daman & Diu", dbName: "DAMAN AND DIU" },
  "mh": { gridArea: "8 / 2 / 10 / 5", displayName: "Maharashtra", dbName: "MAHARASHTRA" },
  "ga": { gridArea: "9 / 2 / 10 / 3", displayName: "Goa", dbName: "GOA" },
  
  // South
  "ts": { gridArea: "9 / 5 / 10 / 6", displayName: "Telangana", dbName: "TELANGANA" },
  "ap": { gridArea: "9 / 6 / 11 / 7", displayName: "Andhra Pradesh", dbName: "ANDHRA PRADESH" },
  "ka": { gridArea: "10 / 3 / 12 / 5", displayName: "Karnataka", dbName: "KARNATAKA" },
  "kl": { gridArea: "11 / 3 / 13 / 4", displayName: "Kerala", dbName: "KERALA" },
  "tn": { gridArea: "11 / 4 / 13 / 6", displayName: "Tamil Nadu", dbName: "TAMIL NADU" },
  "py": { gridArea: "11 / 5 / 12 / 6", displayName: "Puducherry", dbName: "PUDUCHERRY" },
  
  // Islands
  "ld": { gridArea: "11 / 1 / 12 / 2", displayName: "Lakshadweep", dbName: "LAKSHADWEEP" },
  "an": { gridArea: "12 / 6 / 13 / 7", displayName: "Andaman & Nicobar", dbName: "ANDAMAN AND NICOBAR" },
};

export function InteractiveIndiaMapCSS({ className, onStateClick }: InteractiveIndiaMapCSSProps) {
  const [hoveredState, setHoveredState] = useState<string>("");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const router = useRouter();

  // Build state map for quick lookup
  const stateMap = new Map(ALL_INDIAN_STATES.map(state => [state.name, state]));

  const handleStateClick = useCallback((dbName: string) => {
    const stateInfo = stateMap.get(dbName);
    if (stateInfo) {
      const slug = stateNameToSlug(stateInfo.name);
      if (onStateClick) {
        onStateClick(slug);
      } else {
        router.push(`/state/${slug}`);
      }
    }
  }, [stateMap, onStateClick, router]);

  const handleMouseEnter = useCallback((stateKey: string, event: React.MouseEvent) => {
    const state = statePositions[stateKey];
    if (!state) return;

    const stateInfo = stateMap.get(state.dbName);
    setHoveredState(stateKey);
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      name: stateInfo?.displayName || state.displayName,
    });
  }, [stateMap]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredState("");
    setTooltip(null);
  }, []);

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${tooltip.x + 15}px`,
              top: `${tooltip.y - 50}px`,
              transform: "translate3d(0,0,0)",
            }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap border border-primary-foreground/20 animate-in fade-in duration-150">
              {tooltip.name}
              <div className="text-xs opacity-90 mt-0.5">Click to explore districts</div>
            </div>
          </div>
        )}

        {/* CSS Grid India Map */}
        <div className="relative w-full">
          <div 
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
              gridTemplateRows: "repeat(13, 40px)",
              maxWidth: "800px",
            }}
          >
            {Object.entries(statePositions).map(([stateKey, state]) => {
              const isHovered = hoveredState === stateKey;
              const stateInfo = stateMap.get(state.dbName);
              const isDataAvailable = !!stateInfo;

              return (
                <div
                  key={stateKey}
                  className={cn(
                    "relative rounded-md border-2 transition-all duration-200 ease-out",
                    "flex items-center justify-center text-[10px] font-medium text-center p-1",
                    "hover:scale-105 hover:z-10 hover:shadow-lg",
                    isDataAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                    isHovered && isDataAvailable && "ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-lg"
                  )}
                  style={{
                    gridArea: state.gridArea,
                    backgroundColor: isHovered
                      ? (isDataAvailable ? "#2563eb" : "#64748b")
                      : (isDataAvailable ? "#3b82f6" : "#94a3b8"),
                    borderColor: isHovered ? "#0f172a" : "#1e293b",
                    color: "white",
                  }}
                  onMouseEnter={(e) => handleMouseEnter(stateKey, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => isDataAvailable && handleStateClick(state.dbName)}
                >
                  <span className="leading-tight">{state.displayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            🗺️ Navigate India's MGNREGA Data
          </p>
          <p className="text-xs text-muted-foreground">
            Click on any state to explore detailed district-level employment and expenditure data
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-600" style={{ backgroundColor: "#3b82f6" }}></div>
              <span>Data Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-600" style={{ backgroundColor: "#2563eb" }}></div>
              <span>Hover State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-600 opacity-60" style={{ backgroundColor: "#94a3b8" }}></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
