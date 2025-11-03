"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface InteractiveIndiaMapArtsyProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

// State definitions with precise positioning to create realistic India map shape
// Based on absolute positioning similar to image mapping technique
const stateShapes = [
  // North
  { key: "jk", name: "JAMMU AND KASHMIR", display: "Jammu &\nKashmir", top: 9, left: 98, width: 110, height: 95 },
  { key: "ladakh", name: "LADAKH", display: "Ladakh", top: 9, left: 210, width: 85, height: 80 },
  { key: "hp", name: "HIMACHAL PRADESH", display: "Himachal\nPradesh", top: 94, left: 170, width: 80, height: 75 },
  { key: "punjab", name: "PUNJAB", display: "Punjab", top: 101, left: 118, width: 50, height: 50 },
  { key: "chandigarh", name: "CHANDIGARH", display: "CH", top: 115, left: 160, width: 12, height: 12 },
  { key: "haryana", name: "HARYANA", display: "Haryana", top: 130, left: 146, width: 60, height: 55 },
  { key: "delhi", name: "DELHI", display: "Delhi", top: 145, left: 175, width: 12, height: 12 },
  { key: "uttarakhand", name: "UTTARAKHAND", display: "Uttarakhand", top: 115, left: 250, width: 70, height: 50 },
  
  // Central
  { key: "rajasthan", name: "RAJASTHAN", display: "Rajasthan", top: 155, left: 31, width: 180, height: 210 },
  { key: "up", name: "UTTAR PRADESH", display: "Uttar\nPradesh", top: 165, left: 210, width: 160, height: 110 },
  { key: "mp", name: "MADHYA PRADESH", display: "Madhya\nPradesh", top: 245, left: 120, width: 185, height: 130 },
  
  // East
  { key: "bihar", name: "BIHAR", display: "Bihar", top: 203, left: 370, width: 85, height: 50 },
  { key: "jharkhand", name: "JHARKHAND", display: "Jharkhand", top: 253, left: 370, width: 75, height: 70 },
  { key: "wb", name: "WEST BENGAL", display: "West\nBengal", top: 260, left: 445, width: 75, height: 140 },
  { key: "sikkim", name: "SIKKIM", display: "Sikkim", top: 174, left: 450, width: 30, height: 30 },
  { key: "orissa", name: "ODISHA", display: "Odisha", top: 323, left: 365, width: 105, height: 125 },
  { key: "chhattisgarh", name: "CHHATTISGARH", display: "Chhattisgarh", top: 285, left: 305, width: 85, height: 125 },
  
  // Northeast
  { key: "arunachal", name: "ARUNACHAL PRADESH", display: "Arunachal\nPradesh", top: 115, left: 485, width: 140, height: 75 },
  { key: "assam", name: "ASSAM", display: "Assam", top: 190, left: 500, width: 145, height: 85 },
  { key: "nagaland", name: "NAGALAND", display: "Nagaland", top: 200, left: 645, width: 50, height: 45 },
  { key: "manipur", name: "MANIPUR", display: "Manipur", top: 245, left: 645, width: 50, height: 50 },
  { key: "mizoram", name: "MIZORAM", display: "Mizoram", top: 295, left: 630, width: 45, height: 60 },
  { key: "tripura", name: "TRIPURA", display: "Tripura", top: 275, left: 580, width: 45, height: 50 },
  { key: "meghalaya", name: "MEGHALAYA", display: "Meghalaya", top: 240, left: 520, width: 75, height: 45 },
  
  // West
  { key: "gujarat", name: "GUJARAT", display: "Gujarat", top: 290, left: 10, width: 140, height: 160 },
  { key: "dnh", name: "DADRA AND NAGAR HAVELI", display: "DNH", top: 345, left: 95, width: 18, height: 18 },
  { key: "dd", name: "DAMAN AND DIU", display: "DD", top: 330, left: 75, width: 15, height: 15 },
  { key: "maharashtra", name: "MAHARASHTRA", display: "Maharashtra", top: 365, left: 115, width: 210, height: 155 },
  { key: "goa", name: "GOA", display: "Goa", top: 475, left: 95, width: 35, height: 40 },
  
  // South
  { key: "telangana", name: "TELANGANA", display: "Telangana", top: 448, left: 285, width: 90, height: 85 },
  { key: "ap", name: "ANDHRA PRADESH", display: "Andhra\nPradesh", top: 470, left: 355, width: 110, height: 145 },
  { key: "karnataka", name: "KARNATAKA", display: "Karnataka", top: 505, left: 145, width: 140, height: 175 },
  { key: "tamilnadu", name: "TAMIL NADU", display: "Tamil\nNadu", top: 590, left: 245, width: 135, height: 155 },
  { key: "puducherry", name: "PUDUCHERRY", display: "PY", top: 640, left: 300, width: 15, height: 15 },
  { key: "kerala", name: "KERALA", display: "Kerala", top: 625, left: 155, width: 70, height: 120 },
  
  // Islands
  { key: "lakshadweep", name: "LAKSHADWEEP", display: "Lakshadweep", top: 600, left: 5, width: 55, height: 80 },
  { key: "andaman", name: "ANDAMAN AND NICOBAR", display: "Andaman &\nNicobar", top: 550, left: 675, width: 60, height: 165 },
];

export function InteractiveIndiaMapArtsy({ className, onStateClick }: InteractiveIndiaMapArtsyProps) {
  const [hoveredState, setHoveredState] = useState<string>("");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const router = useRouter();

  // Build state map for quick lookup
  const stateMap = new Map(ALL_INDIAN_STATES.map(state => [state.name, state]));

  const handleStateClick = useCallback((stateName: string) => {
    const stateInfo = stateMap.get(stateName);
    if (stateInfo) {
      const slug = stateNameToSlug(stateInfo.name);
      if (onStateClick) {
        onStateClick(slug);
      } else {
        router.push(`/state/${slug}`);
      }
    }
  }, [stateMap, onStateClick, router]);

  const handleMouseEnter = useCallback((state: typeof stateShapes[0], event: React.MouseEvent) => {
    const stateInfo = stateMap.get(state.name);
    setHoveredState(state.key);
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      name: stateInfo?.displayName || state.display.replace('\n', ' '),
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
    <div className={cn("relative w-full max-w-6xl mx-auto", className)}>
      <div className="relative p-8 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
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

        {/* Map Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Interactive India Map
          </h3>
          <p className="text-sm text-muted-foreground">
            Hover over states to see details, click to explore
          </p>
        </div>

        {/* India Map Container with absolute positioned states */}
        <div className="relative mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden shadow-inner border-2 border-primary/20"
          style={{
            width: "750px",
            height: "750px",
            maxWidth: "100%",
          }}
        >
          {stateShapes.map((state) => {
            const isHovered = hoveredState === state.key;
            const stateInfo = stateMap.get(state.name);
            const isDataAvailable = !!stateInfo;

            return (
              <div
                key={state.key}
                className={cn(
                  "absolute rounded border-2 transition-all duration-200 ease-out",
                  "flex items-center justify-center text-[9px] leading-tight font-semibold text-center p-1",
                  "overflow-hidden",
                  isDataAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                  isHovered && isDataAvailable && "ring-2 ring-primary ring-offset-2 scale-105 z-20 shadow-2xl"
                )}
                style={{
                  top: `${state.top}px`,
                  left: `${state.left}px`,
                  width: `${state.width}px`,
                  height: `${state.height}px`,
                  backgroundColor: isHovered
                    ? (isDataAvailable ? "#2563eb" : "#64748b")
                    : (isDataAvailable ? "#3b82f6" : "#94a3b8"),
                  borderColor: isHovered ? "#0f172a" : "#1e293b",
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => handleMouseEnter(state, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => isDataAvailable && handleStateClick(state.name)}
              >
                <span style={{ whiteSpace: "pre-line" }}>{state.display}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 text-center space-y-3">
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
              <div className="w-4 h-4 rounded border-2 border-gray-600 opacity-70" style={{ backgroundColor: "#94a3b8" }}></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
