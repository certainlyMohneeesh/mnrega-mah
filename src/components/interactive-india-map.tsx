"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface StateMapData {
  name: string;
  code: string;
  color: string;
}

interface InteractiveIndiaMapProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

export function InteractiveIndiaMap({ className, onStateClick }: InteractiveIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const router = useRouter();

  const handleStateClick = (stateName: string) => {
    const slug = stateNameToSlug(stateName);
    if (onStateClick) {
      onStateClick(slug);
    } else {
      router.push(`/state/${slug}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, stateName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: stateName,
    });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltip(null);
  };

  // Grid-based representation of Indian states for a simple interactive map
  // This is a simplified visual representation
  const stateGrid = [
    { name: "JAMMU AND KASHMIR", gridArea: "1 / 2 / 3 / 4", size: "large" },
    { name: "LADAKH", gridArea: "1 / 4 / 2 / 6", size: "large" },
    { name: "HIMACHAL PRADESH", gridArea: "2 / 2 / 3 / 3", size: "small" },
    { name: "PUNJAB", gridArea: "2 / 3 / 3 / 4", size: "small" },
    { name: "UTTARAKHAND", gridArea: "2 / 4 / 3 / 5", size: "small" },
    { name: "HARYANA", gridArea: "3 / 2 / 4 / 3", size: "small" },
    { name: "CHANDIGARH", gridArea: "3 / 3 / 4 / 4", size: "tiny" },
    { name: "UTTAR PRADESH", gridArea: "3 / 4 / 5 / 7", size: "xlarge" },
    { name: "RAJASTHAN", gridArea: "3 / 1 / 6 / 3", size: "xlarge" },
    { name: "BIHAR", gridArea: "4 / 7 / 5 / 9", size: "medium" },
    { name: "MADHYA PRADESH", gridArea: "5 / 2 / 7 / 6", size: "xlarge" },
    { name: "GUJARAT", gridArea: "6 / 1 / 8 / 3", size: "large" },
    { name: "JHARKHAND", gridArea: "5 / 7 / 6 / 9", size: "medium" },
    { name: "WEST BENGAL", gridArea: "5 / 9 / 7 / 11", size: "medium" },
    { name: "SIKKIM", gridArea: "4 / 9 / 5 / 10", size: "tiny" },
    { name: "ARUNACHAL PRADESH", gridArea: "3 / 10 / 5 / 12", size: "large" },
    { name: "ASSAM", gridArea: "5 / 10 / 6 / 12", size: "medium" },
    { name: "NAGALAND", gridArea: "5 / 12 / 6 / 13", size: "small" },
    { name: "MANIPUR", gridArea: "6 / 12 / 7 / 13", size: "small" },
    { name: "MEGHALAYA", gridArea: "6 / 10 / 7 / 11", size: "small" },
    { name: "TRIPURA", gridArea: "6 / 11 / 7 / 12", size: "small" },
    { name: "MIZORAM", gridArea: "7 / 11 / 8 / 12", size: "small" },
    { name: "ODISHA", gridArea: "6 / 7 / 8 / 9", size: "medium" },
    { name: "CHHATTISGARH", gridArea: "6 / 6 / 8 / 8", size: "medium" },
    { name: "DADRA AND NAGAR HAVELI", gridArea: "7 / 2 / 8 / 3", size: "tiny" },
    { name: "DAMAN AND DIU", gridArea: "7 / 1 / 8 / 2", size: "tiny" },
    { name: "MAHARASHTRA", gridArea: "7 / 3 / 9 / 6", size: "xlarge" },
    { name: "GOA", gridArea: "8 / 3 / 9 / 4", size: "tiny" },
    { name: "TELANGANA", gridArea: "8 / 6 / 9 / 7", size: "medium" },
    { name: "ANDHRA PRADESH", gridArea: "8 / 7 / 10 / 9", size: "large" },
    { name: "KARNATAKA", gridArea: "9 / 4 / 11 / 7", size: "large" },
    { name: "TAMIL NADU", gridArea: "10 / 6 / 12 / 8", size: "large" },
    { name: "PUDUCHERRY", gridArea: "10 / 8 / 11 / 9", size: "tiny" },
    { name: "KERALA", gridArea: "11 / 4 / 13 / 6", size: "medium" },
    { name: "LAKSHADWEEP", gridArea: "12 / 2 / 13 / 3", size: "tiny" },
    { name: "ANDAMAN AND NICOBAR", gridArea: "11 / 10 / 13 / 12", size: "small" },
  ];

  const getSizeClass = (size: string) => {
    switch (size) {
      case "tiny":
        return "h-8";
      case "small":
        return "h-12";
      case "medium":
        return "h-16";
      case "large":
        return "h-20";
      case "xlarge":
        return "h-24";
      default:
        return "h-16";
    }
  };

  return (
    <div className={cn("relative w-full max-w-6xl mx-auto", className)}>
      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
          }}
        >
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
            {tooltip.name}
            <div className="text-xs opacity-80 mt-0.5">Click to view districts</div>
          </div>
        </motion.div>
      )}

      {/* Grid-based State Map */}
      <div className="grid grid-cols-12 gap-1 p-4 bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl border border-primary/20">
        {stateGrid.map((state, index) => {
          const stateInfo = ALL_INDIAN_STATES.find(s => s.name === state.name);
          const isHovered = hoveredState === state.name;

          return (
            <motion.button
              key={state.name}
              onClick={() => handleStateClick(state.name)}
              onMouseEnter={(e) => {
                setHoveredState(state.name);
                handleMouseMove(e, stateInfo?.displayName || state.name);
              }}
              onMouseMove={(e) => handleMouseMove(e, stateInfo?.displayName || state.name)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.05, z: 10 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative border-2 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-medium overflow-hidden",
                getSizeClass(state.size),
                isHovered
                  ? "bg-primary text-primary-foreground border-primary shadow-lg z-20"
                  : "bg-card hover:bg-accent border-border hover:border-primary/50"
              )}
              style={{ gridArea: state.gridArea }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
            >
              <span className={cn(
                "text-center px-1 leading-tight",
                state.size === "tiny" ? "text-[8px]" : state.size === "small" ? "text-[10px]" : "text-xs"
              )}>
                {stateInfo?.displayName || state.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p className="font-medium mb-2">🗺️ Click on any state to explore districts</p>
        <p className="text-xs">Hover over states to see names • 36 states & UTs available</p>
      </div>
    </div>
  );
}
