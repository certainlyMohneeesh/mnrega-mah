import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/maintenance/status
 * Check if system is in maintenance mode (data sync in progress)
 */
export async function GET() {
  try {
    // Check if there's an active sync operation in the last 30 minutes
    const recentSync = await prisma.fetchLog.findFirst({
      where: {
        operation: {
          startsWith: "daily_sync"
        },
        startedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        }
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    const isMaintenanceMode = recentSync && recentSync.status === "success";
    
    // Estimate completion time (assume 15 minutes for full sync)
    const estimatedCompletion = recentSync 
      ? new Date(recentSync.startedAt.getTime() + 15 * 60 * 1000)
      : null;

    return NextResponse.json({
      isMaintenanceMode: false, // Set to true when sync is running
      estimatedCompletion,
      lastSync: recentSync?.completedAt,
    });

  } catch (error) {
    console.error("Error checking maintenance status:", error);
    return NextResponse.json(
      {
        isMaintenanceMode: false,
        error: "Failed to check maintenance status"
      },
      { status: 500 }
    );
  }
}
