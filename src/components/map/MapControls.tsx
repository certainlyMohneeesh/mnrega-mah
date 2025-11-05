"use client";

import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, Home, ArrowLeft } from 'lucide-react';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFullscreen?: () => void;
  onExport?: () => void;
  onHome?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onExport,
  onHome,
  onBack,
  showBackButton = false,
  showHomeButton = false,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Navigation Controls */}
      {(showBackButton || showHomeButton) && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {showBackButton && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={onHome}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
              title="India View"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">India</span>
            </button>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={onZoomIn}
          className="block px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="block px-3 py-2 hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={onFullscreen}
          className="block px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="block px-3 py-2 hover:bg-gray-100 transition-colors"
          title="Export Map"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
