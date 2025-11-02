"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Database, Clock } from "lucide-react";

export function MaintenanceMode() {
  const [show, setShow] = useState(false);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);

  useEffect(() => {
    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  async function checkMaintenanceStatus() {
    try {
      const response = await fetch("/api/maintenance/status");
      const data = await response.json();
      
      setShow(data.isMaintenanceMode);
      if (data.estimatedCompletion) {
        setEstimatedCompletion(new Date(data.estimatedCompletion));
      }
    } catch (error) {
      console.error("Error checking maintenance status:", error);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#E76D67] to-[#514E80] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        {/* Animated Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-[#514E80]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-[#514E80]" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          System Update in Progress
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          We're currently updating our MGNREGA database with the latest data from all Indian states. 
          This process ensures you get the most accurate and up-to-date information.
        </p>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Database className="w-6 h-6 text-[#E76D67]" />
            <div className="text-left">
              <div className="text-sm text-gray-500">Data Source</div>
              <div className="font-semibold text-gray-900">data.gov.in</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-6 h-6 text-[#514E80]" />
            <div className="text-left">
              <div className="text-sm text-gray-500">Estimated Time</div>
              <div className="font-semibold text-gray-900">
                {estimatedCompletion 
                  ? estimatedCompletion.toLocaleTimeString() 
                  : "10-15 minutes"}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#E76D67] to-[#514E80]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-sm text-gray-500">
          This page will automatically reload once the update is complete. 
          Thank you for your patience!
        </p>
      </motion.div>
    </div>
  );
}
