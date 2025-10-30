"use client";

import { useEffect, useState } from "react";
import { MapPin, X, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import {
  detectUserDistrict,
  saveDetectedDistrict,
  getSavedDetectedDistrict,
} from "@/lib/geolocation";

interface LocationDetectorProps {
  onDistrictDetected?: (districtId: string) => void;
}

export function LocationDetector({ onDistrictDetected }: LocationDetectorProps) {
  const [detecting, setDetecting] = useState(false);
  const [detectedDistrict, setDetectedDistrict] = useState<{
    key: string;
    name: string;
  } | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if user has already dismissed or if we have a saved district
    const hasDismissed = localStorage.getItem('locationBannerDismissed') === 'true';
    const savedDistrict = getSavedDetectedDistrict();

    if (hasDismissed) {
      setDismissed(true);
      return;
    }

    if (savedDistrict) {
      setDetectedDistrict(savedDistrict);
      setShowBanner(true);
    } else {
      // Auto-detect on first load if not dismissed
      handleDetectLocation();
    }
  }, []);

  const handleDetectLocation = async () => {
    setDetecting(true);
    
    try {
      const district = await detectUserDistrict();
      
      if (district) {
        setDetectedDistrict({
          key: district.districtKey,
          name: district.districtName,
        });
        saveDetectedDistrict(district.districtKey, district.districtName);
        setShowBanner(true);
        
        if (onDistrictDetected) {
          onDistrictDetected(district.districtKey);
        }
      } else {
        console.log('Could not detect district');
      }
    } catch (error) {
      console.error('Location detection error:', error);
    } finally {
      setDetecting(false);
    }
  };

  const handleViewDistrict = async () => {
    if (!detectedDistrict) return;

    // Find the district in the database by name
    try {
      const response = await fetch('/api/districts');
      const data = await response.json();
      
      if (data.success) {
        const district = data.data.find((d: any) => 
          d.name.toLowerCase() === detectedDistrict.name.toLowerCase()
        );
        
        if (district) {
          router.push(`/district/${district.id}`);
        }
      }
    } catch (error) {
      console.error('Error finding district:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('locationBannerDismissed', 'true');
  };

  if (dismissed || !showBanner || !detectedDistrict) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-brand p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-brand" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              Location Detected
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              You appear to be in <span className="font-semibold text-brand">{detectedDistrict.name}</span> district
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleViewDistrict}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                View My District
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
