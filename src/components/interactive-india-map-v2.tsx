"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { stateNameToSlug, ALL_INDIAN_STATES } from "@/lib/state-utils";
import { cn } from "@/lib/utils";

interface InteractiveIndiaMapProps {
  className?: string;
  onStateClick?: (stateCode: string) => void;
}

// India TopoJSON URL (using public CDN)
const INDIA_TOPO_JSON = "https://cdn.jsdelivr.net/npm/india-map-geojson@1.0.0/india.json";

// Map state names from TopoJSON to our database state names
const STATE_NAME_MAP: Record<string, string> = {
  "Andaman & Nicobar": "ANDAMAN AND NICOBAR",
  "Andhra Pradesh": "ANDHRA PRADESH",
  "Arunachal Pradesh": "ARUNACHAL PRADESH",
  "Assam": "ASSAM",
  "Bihar": "BIHAR",
  "Chandigarh": "CHANDIGARH",
  "Chhattisgarh": "CHHATTISGARH",
  "Dadra & Nagar Haveli": "DADRA AND NAGAR HAVELI",
  "Daman & Diu": "DAMAN AND DIU",
  "Delhi": "DELHI",
  "Goa": "GOA",
  "Gujarat": "GUJARAT",
  "Haryana": "HARYANA",
  "Himachal Pradesh": "HIMACHAL PRADESH",
  "Jammu & Kashmir": "JAMMU AND KASHMIR",
  "Jharkhand": "JHARKHAND",
  "Karnataka": "KARNATAKA",
  "Kerala": "KERALA",
  "Ladakh": "LADAKH",
  "Lakshadweep": "LAKSHADWEEP",
  "Madhya Pradesh": "MADHYA PRADESH",
  "Maharashtra": "MAHARASHTRA",
  "Manipur": "MANIPUR",
  "Meghalaya": "MEGHALAYA",
  "Mizoram": "MIZORAM",
  "Nagaland": "NAGALAND",
  "Odisha": "ODISHA",
  "Puducherry": "PUDUCHERRY",
  "Punjab": "PUNJAB",
  "Rajasthan": "RAJASTHAN",
  "Sikkim": "SIKKIM",
  "Tamil Nadu": "TAMIL NADU",
  "Telangana": "TELANGANA",
  "Tripura": "TRIPURA",
  "Uttar Pradesh": "UTTAR PRADESH",
  "Uttarakhand": "UTTARAKHAND",
  "West Bengal": "WEST BENGAL",
};

// Fallback simple SVG paths if TopoJSON fails to load
const FALLBACK_STATE_PATHS = {
  "JAMMU AND KASHMIR": "M 190 45 L 220 40 L 235 50 L 245 65 L 235 80 L 220 85 L 200 82 L 185 70 L 180 55 Z",
  "LADAKH": "M 250 35 L 285 30 L 305 45 L 310 60 L 300 75 L 280 78 L 260 72 L 248 55 Z",
  "HIMACHAL PRADESH": "M 190 88 L 210 86 L 225 95 L 230 105 L 220 115 L 200 112 L 188 102 Z",
  "PUNJAB": "M 170 93 L 188 91 L 195 102 L 192 112 L 178 118 L 168 110 Z",
  "UTTARAKHAND": "M 235 90 L 255 88 L 270 100 L 275 112 L 265 122 L 248 120 L 238 108 Z",
  "CHANDIGARH": "M 178 105 L 183 105 L 183 110 L 178 110 Z",
  "HARYANA": "M 168 115 L 188 113 L 198 125 L 195 138 L 180 142 L 168 132 Z",
  "DELHI": "M 185 125 L 190 125 L 190 130 L 185 130 Z",
  "RAJASTHAN": "M 80 130 L 165 125 L 180 160 L 185 200 L 170 245 L 140 265 L 100 258 L 70 230 L 65 180 Z",
  "UTTAR PRADESH": "M 200 125 L 330 120 L 345 145 L 355 170 L 350 195 L 325 210 L 290 212 L 250 205 L 220 185 L 205 155 Z",
  "SIKKIM": "M 360 128 L 372 126 L 380 135 L 378 145 L 368 148 L 360 142 Z",
  "ARUNACHAL PRADESH": "M 385 90 L 445 85 L 470 105 L 478 130 L 470 155 L 445 168 L 415 165 L 390 150 L 380 130 Z",
  "BIHAR": "M 295 150 L 345 148 L 360 165 L 365 185 L 355 205 L 330 215 L 305 212 L 290 195 Z",
  "WEST BENGAL": "M 350 152 L 385 150 L 400 170 L 408 195 L 405 225 L 390 245 L 370 248 L 355 235 L 348 210 Z",
  "ASSAM": "M 395 155 L 445 152 L 460 168 L 465 185 L 458 202 L 435 208 L 410 205 L 395 190 Z",
  "MEGHALAYA": "M 405 210 L 428 208 L 436 218 L 432 228 L 418 232 L 408 225 Z",
  "MANIPUR": "M 450 215 L 468 213 L 475 228 L 472 240 L 460 245 L 450 238 Z",
  "MIZORAM": "M 438 250 L 452 248 L 458 262 L 453 275 L 442 278 L 435 268 Z",
  "TRIPURA": "M 418 238 L 432 236 L 438 248 L 433 258 L 422 260 L 416 250 Z",
  "NAGALAND": "M 448 175 L 465 173 L 473 188 L 470 202 L 458 208 L 448 200 Z",
  "GUJARAT": "M 45 205 L 115 200 L 135 245 L 140 280 L 125 315 L 95 325 L 65 318 L 48 285 L 42 245 Z",
  "DAMAN AND DIU": "M 52 255 L 60 255 L 60 262 L 52 262 Z",
  "DADRA AND NAGAR HAVELI": "M 70 268 L 78 268 L 78 275 L 70 275 Z",
  "MADHYA PRADESH": "M 175 220 L 290 215 L 310 245 L 320 280 L 310 315 L 280 335 L 230 340 L 185 330 L 160 295 L 155 255 Z",
  "CHHATTISGARH": "M 295 250 L 330 248 L 345 270 L 352 295 L 345 320 L 320 335 L 298 332 L 285 310 Z",
  "JHARKHAND": "M 310 220 L 345 218 L 358 238 L 362 258 L 352 278 L 330 285 L 315 275 L 308 250 Z",
  "ODISHA": "M 335 290 L 368 288 L 385 315 L 392 345 L 385 375 L 360 390 L 335 385 L 320 360 L 318 325 Z",
  "MAHARASHTRA": "M 135 280 L 200 275 L 240 285 L 270 305 L 285 340 L 285 375 L 265 410 L 230 428 L 185 430 L 145 415 L 115 385 L 105 345 L 108 310 Z",
  "GOA": "M 120 395 L 135 393 L 142 408 L 138 420 L 125 422 L 118 410 Z",
  "TELANGANA": "M 240 345 L 275 343 L 288 365 L 292 390 L 282 415 L 260 425 L 242 418 L 235 395 Z",
  "ANDHRA PRADESH": "M 268 390 L 310 388 L 335 410 L 350 445 L 348 480 L 325 510 L 290 515 L 260 505 L 248 470 L 250 430 Z",
  "KARNATAKA": "M 150 430 L 230 425 L 255 445 L 270 480 L 272 520 L 255 560 L 225 575 L 185 575 L 155 560 L 140 525 L 138 485 Z",
  "TAMIL NADU": "M 235 520 L 280 518 L 300 545 L 308 580 L 302 615 L 278 640 L 248 645 L 220 635 L 205 605 L 205 565 L 215 540 Z",
  "KERALA": "M 175 530 L 210 528 L 220 555 L 225 590 L 222 625 L 210 655 L 188 665 L 168 660 L 158 630 L 160 585 L 168 550 Z",
  "PUDUCHERRY": "M 290 580 L 298 580 L 298 588 L 290 588 Z",
  "LAKSHADWEEP": "M 95 540 L 108 540 L 108 553 L 95 553 Z",
  "ANDAMAN AND NICOBAR": "M 420 540 L 442 538 L 450 565 L 455 600 L 452 640 L 445 670 L 432 680 L 418 675 L 412 645 L 410 605 L 415 570 Z",
};

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

  const handleMouseEnter = (e: React.MouseEvent<SVGPathElement>, stateName: string) => {
    const stateInfo = ALL_INDIAN_STATES.find(s => s.name === stateName);
    setHoveredState(stateName);
    
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
        name: stateInfo?.displayName || stateName,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (svgRect && tooltip) {
      setTooltip({
        ...tooltip,
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltip(null);
  };

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      <div className="relative p-6 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-2xl border border-primary/20 shadow-xl">
        {/* Tooltip */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y - 40,
            }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
              {tooltip.name}
              <div className="text-xs opacity-90 mt-0.5">Click to explore districts</div>
            </div>
          </motion.div>
        )}

        {/* SVG Map */}
        <svg
          viewBox="0 0 550 720"
          className="w-full h-auto bg-transparent"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* No background - transparent */}

          {/* State paths */}
          {Object.entries(STATE_PATHS).map(([stateName, pathData], index) => {
            const isHovered = hoveredState === stateName;
            
            return (
              <motion.path
                key={stateName}
                d={pathData}
                fill={isHovered ? "hsl(var(--primary) / 0.6)" : "hsl(var(--primary) / 0.25)"}
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth={isHovered ? "2.5" : "1.5"}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleStateClick(stateName)}
                onMouseEnter={(e) => handleMouseEnter(e, stateName)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                whileHover={{
                  fill: "hsl(var(--primary) / 0.5)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                }}
                style={{
                  transformOrigin: "center",
                }}
              />
            );
          })}

          {/* State labels for major states */}
          {[
            { name: "RAJASTHAN", x: 125, y: 200, size: "12" },
            { name: "MAHARASHTRA", x: 195, y: 360, size: "11" },
            { name: "UTTAR PRADESH", x: 270, y: 165, size: "10" },
            { name: "MADHYA PRADESH", x: 235, y: 285, size: "10" },
            { name: "GUJARAT", x: 82, y: 265, size: "11" },
            { name: "KARNATAKA", x: 195, y: 510, size: "11" },
            { name: "TAMIL NADU", x: 260, y: 590, size: "11" },
            { name: "ANDHRA PRADESH", x: 290, y: 455, size: "10" },
            { name: "BIHAR", x: 320, y: 180, size: "10" },
            { name: "WEST BENGAL", x: 375, y: 200, size: "9" },
            { name: "KERALA", x: 195, y: 600, size: "10" },
            { name: "ODISHA", x: 355, y: 340, size: "10" },
          ].map(({ name, x, y, size }) => {
            const stateInfo = ALL_INDIAN_STATES.find(s => s.name === name);
            return (
              <text
                key={name}
                x={x}
                y={y}
                fontSize={size}
                fontWeight="600"
                fill="hsl(var(--foreground) / 0.6)"
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {stateInfo?.displayName.split(" ")[0] || name.split(" ")[0]}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            🗺️ Navigate India's MGNREGA Data
          </p>
          <p className="text-xs text-muted-foreground">
            Click on any state to explore detailed district-level employment and expenditure data across all 36 Indian states and Union Territories
          </p>
        </div>
      </div>
    </div>
  );
}
