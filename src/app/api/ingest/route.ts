import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Protect this endpoint with a secret
const CRON_SECRET = process.env.CRON_SECRET;

export const maxDuration = 300; // 5 minutes max execution time

/**
 * POST /api/ingest
 * Triggers the MGNREGA data ingestion script
 * Protected by CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');

    if (!secret || secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting MGNREGA data ingestion...');

    // Run the ingest script
    const { stdout, stderr } = await execAsync('pnpm ingest', {
      cwd: process.cwd(),
      env: process.env,
    });

    console.log('📥 Ingestion output:', stdout);
    if (stderr) console.error('⚠️  Ingestion warnings:', stderr);

    return NextResponse.json({
      success: true,
      message: 'Data ingestion completed successfully',
      output: stdout,
    });
  } catch (error: any) {
    console.error('❌ Data ingestion failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Data ingestion failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest
 * Returns ingestion status and instructions
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ingest',
    method: 'POST',
    description: 'Triggers MGNREGA data ingestion from data.gov.in',
    authentication: 'Bearer token required (CRON_SECRET)',
    usage: 'POST /api/ingest with Authorization: Bearer <CRON_SECRET> header',
    maxDuration: '5 minutes',
  });
}
