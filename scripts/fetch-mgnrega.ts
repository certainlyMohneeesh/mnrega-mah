import axios, { AxiosError } from "axios";
import prisma from "../src/lib/prisma";

/**
 * Data.gov.in MGNREGA API Configuration
 */
const API_CONFIG = {
  baseUrl: process.env.DATA_GOV_API_URL || "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722",
  apiKey: process.env.DATA_GOV_API_KEY || "579b464db66ec23bdd0000011b14954939de4eed5265d7c08c0b8631",
  format: "json",
  limit: 1000, // Maximum records per request
};

/**
 * Retry configuration with exponential backoff
 */
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 32000, // 32 seconds
  backoffMultiplier: 2,
};

/**
 * Rate limiting configuration
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Sleep utility for delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Rate-limited axios request with retry and backoff
 */
async function makeRequest<T>(url: string, params: Record<string, any>, attempt = 0): Promise<T> {
  // Enforce rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    console.log(`🌐 Making request (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})...`);
    
    const response = await axios.get<T>(url, {
      params: {
        ...params,
        "api-key": API_CONFIG.apiKey,
        format: API_CONFIG.format,
      },
      timeout: 30000, // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    // Handle rate limiting (429) or server errors (5xx)
    if (
      axiosError.response?.status === 429 ||
      (axiosError.response?.status && axiosError.response.status >= 500)
    ) {
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getBackoffDelay(attempt);
        console.warn(
          `⚠️  Request failed with status ${axiosError.response?.status}. Retrying in ${Math.round(delay / 1000)}s...`
        );
        await sleep(delay);
        return makeRequest<T>(url, params, attempt + 1);
      }
    }

    // Handle timeout errors
    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = getBackoffDelay(attempt);
        console.warn(`⚠️  Request timed out. Retrying in ${Math.round(delay / 1000)}s...`);
        await sleep(delay);
        return makeRequest<T>(url, params, attempt + 1);
      }
    }

    // If we've exhausted retries or it's a different error, throw
    throw error;
  }
}

/**
 * Data.gov.in API response structure
 * Note: Actual field names may vary - adjust based on real API response
 */
interface MGNREGARecord {
  state_name?: string;
  state_code?: string;
  district_name?: string;
  district_code?: string;
  financial_year?: string;
  month?: string;
  year?: string;
  households_issued?: string | number;
  households_employed?: string | number;
  persondays_generated?: string | number;
  women_persondays?: string | number;
  sc_persondays?: string | number;
  st_persondays?: string | number;
  total_expenditure?: string | number;
  wage_expenditure?: string | number;
  material_expenditure?: string | number;
  works_completed?: string | number;
  works_ongoing?: string | number;
  [key: string]: any; // Allow for other fields
}

interface APIResponse {
  records?: MGNREGARecord[];
  total?: number;
  count?: number;
  offset?: number;
  limit?: number;
}

/**
 * Parse and normalize a numeric field from API response
 */
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Parse and normalize a BigInt field from API response
 */
function parseBigInt(value: any): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    const str = typeof value === "string" ? value.replace(/,/g, "") : String(value);
    return BigInt(Math.floor(parseFloat(str)));
  } catch {
    return null;
  }
}

/**
 * Parse month name to month number
 */
function parseMonth(monthStr: string): number {
  const months: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  return months[monthStr.toLowerCase()] || parseInt(monthStr) || 1;
}

/**
 * Fetch and ingest MGNREGA data for Maharashtra
 */
async function fetchMGNREGAData(
  stateCode: string = "MH",
  year?: number,
  month?: number
): Promise<void> {
  const startTime = Date.now();
  let totalRecords = 0;
  let errorMessage: string | null = null;
  let status: "success" | "error" | "partial" = "success";

  try {
    console.log("🚀 Starting MGNREGA data fetch...");
    console.log(`📍 State: ${stateCode}`);
    if (year) console.log(`📅 Year: ${year}`);
    if (month) console.log(`📅 Month: ${month}`);

    // Build query parameters
    const params: Record<string, any> = {
      limit: API_CONFIG.limit,
      offset: 0,
    };

    // Add filters if provided
    // Note: Adjust filter field names based on actual API
    if (stateCode) {
      params.filters = JSON.stringify({
        state_code: stateCode,
        ...(year && { year: year.toString() }),
        ...(month && { month: month.toString() }),
      });
    }

    // Fetch data with pagination
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      params.offset = offset;
      
      try {
        const response = await makeRequest<APIResponse>(API_CONFIG.baseUrl, params);
        
        if (!response.records || response.records.length === 0) {
          console.log("✅ No more records to fetch");
          hasMore = false;
          break;
        }

        console.log(`📦 Fetched ${response.records.length} records (offset: ${offset})`);

        // Process and upsert records
        for (const record of response.records) {
          try {
            await processRecord(record);
            totalRecords++;
          } catch (error) {
            console.error(`❌ Error processing record:`, error);
            status = "partial";
          }
        }

        // Check if there are more records
        if (response.records.length < API_CONFIG.limit) {
          hasMore = false;
        } else {
          offset += API_CONFIG.limit;
          // Small delay between pagination requests
          await sleep(500);
        }
      } catch (error) {
        console.error(`❌ Error fetching data at offset ${offset}:`, error);
        errorMessage = error instanceof Error ? error.message : String(error);
        status = offset === 0 ? "error" : "partial";
        hasMore = false;
      }
    }

    // Caches will be automatically revalidated via ISR (no Redis needed)
    if (totalRecords > 0) {
      console.log("✅ Data ingested successfully. ISR will revalidate caches.");
    }

    console.log(`✅ Data ingestion completed. Total records processed: ${totalRecords}`);
  } catch (error) {
    console.error("❌ Fatal error during data ingestion:", error);
    errorMessage = error instanceof Error ? error.message : String(error);
    status = "error";
  } finally {
    // Log the fetch operation
    const responseTime = Date.now() - startTime;
    
    await prisma.fetchLog.create({
      data: {
        source: "data.gov.in",
        operation: "fetch_monthly_metrics",
        status,
        recordsCount: totalRecords,
        errorMessage,
        requestParams: { stateCode, year, month },
        responseTime,
        startedAt: new Date(startTime),
        completedAt: new Date(),
      },
    });

    console.log(`⏱️  Total time: ${Math.round(responseTime / 1000)}s`);
  }
}

/**
 * Process and upsert a single MGNREGA record
 */
async function processRecord(record: MGNREGARecord): Promise<void> {
  // Find or create district
  const districtCode = record.district_code || `MH_${record.district_name?.toUpperCase().replace(/\s+/g, "_")}`;
  
  let district = await prisma.district.findUnique({
    where: { code: districtCode },
  });

  if (!district && record.district_name) {
    // Create district if it doesn't exist
    district = await prisma.district.create({
      data: {
        code: districtCode,
        name: record.district_name,
        stateCode: "MH",
        stateName: "Maharashtra",
      },
    });
    console.log(`➕ Created new district: ${record.district_name}`);
  }

  if (!district) {
    console.warn(`⚠️  Could not find or create district for record:`, record);
    return;
  }

  // Parse year and month
  const year = parseNumber(record.year || record.financial_year?.split("-")[0]) || new Date().getFullYear();
  const month = record.month ? parseMonth(record.month) : 1;

  // Create data date
  // Note: This script is deprecated - use seed-csv.ts instead
  // The schema has changed to match CSV structure with finYear/month as strings
  // This would need to be updated to match the current schema structure
  
  console.warn("⚠️  This script is deprecated. Use seed-csv.ts for importing data.");
  throw new Error("This script is not compatible with the current schema. Use seed-csv.ts instead.");
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const stateCode = args.find((arg) => arg.startsWith("--state="))?.split("=")[1] || "MH";
  const year = args.find((arg) => arg.startsWith("--year="))?.split("=")[1];
  const month = args.find((arg) => arg.startsWith("--month="))?.split("=")[1];

  try {
    await fetchMGNREGAData(
      stateCode,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { fetchMGNREGAData, processRecord };
