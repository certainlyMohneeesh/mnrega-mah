/**
 * API Utilities
 * Helper functions for API calls and URL construction
 */

/**
 * Get the base URL for API calls
 * 
 * IMPORTANT: For server-side static generation (SSG), we MUST use relative URLs
 * because environment variables like VERCEL_URL are not available at build time.
 * 
 * This function returns:
 * - Empty string for server-side code (use relative URLs)
 * - Full URL with protocol for client-side code
 * 
 * Priority for client-side:
 * 1. window.location.origin (browser)
 * 2. NEXT_PUBLIC_APP_URL (manual configuration)
 * 3. http://localhost:3000 (development fallback)
 * 
 * @returns The base URL or empty string for server-side relative URLs
 */
export function getBaseUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: return empty string to force relative URLs
  // This works because Next.js server can resolve relative paths
  return "";
}

/**
 * Get the full API URL for a given endpoint
 * 
 * For server-side calls, this returns a relative URL (e.g., "/api/districts")
 * For client-side calls, this returns an absolute URL (e.g., "https://your-app.vercel.app/api/districts")
 * 
 * @param endpoint - The API endpoint (e.g., "/api/districts" or "api/districts")
 * @returns The full URL or relative URL depending on environment
 * 
 * @example
 * ```ts
 * // Server-side (SSG/SSR)
 * const url = getApiUrl("/api/districts");
 * // Returns: "/api/districts"
 * 
 * // Client-side (browser)
 * const url = getApiUrl("/api/districts");
 * // Returns: "https://your-app.vercel.app/api/districts"
 * ```
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Server-side: return relative URL
  if (!baseUrl) {
    return cleanEndpoint;
  }
  
  // Client-side: return absolute URL
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Check if the app is running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

/**
 * Check if the app is running on Vercel
 */
export function isVercel(): boolean {
  return !!process.env.VERCEL_URL || !!process.env.VERCEL;
}

/**
 * Get environment information for debugging
 */
export function getEnvironmentInfo() {
  return {
    runtime: typeof window !== "undefined" ? "client" : "server",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    baseUrl: getBaseUrl(),
    isProduction: isProduction(),
    isVercel: isVercel(),
  };
}

/**
 * Get the absolute URL for server-side API calls
 * This is needed for external fetch calls during SSG/SSR
 * 
 * @returns The absolute URL to use for internal API calls
 */
export function getServerUrl(): string {
  // 1. Try VERCEL_URL (set at runtime in Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 2. Try NEXT_PUBLIC_APP_URL (manually configured)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // 3. Fallback to localhost for development
  return "http://localhost:3000";
}
