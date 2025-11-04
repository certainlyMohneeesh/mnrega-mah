/**
 * API Utilities
 * Helper functions for API calls and URL construction
 */

/**
 * Get the base URL for API calls
 * Works in both development (localhost) and production (Vercel)
 * 
 * Priority:
 * 1. VERCEL_URL (automatically set by Vercel in production)
 * 2. NEXT_PUBLIC_APP_URL (can be set manually for custom domains)
 * 3. http://localhost:3000 (fallback for local development)
 * 
 * @returns The base URL with protocol (e.g., "https://your-app.vercel.app")
 */
export function getBaseUrl(): string {
  // In Vercel deployments, VERCEL_URL is automatically set
  // Format: your-project.vercel.app (without https://)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // For custom domains or manual configuration
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for local development
  return "http://localhost:3000";
}

/**
 * Get the full API URL for a given endpoint
 * 
 * @param endpoint - The API endpoint (e.g., "/api/districts")
 * @returns The full URL (e.g., "https://your-app.vercel.app/api/districts")
 * 
 * @example
 * ```ts
 * const url = getApiUrl("/api/districts?includeStats=true");
 * // Returns: "https://your-app.vercel.app/api/districts?includeStats=true"
 * ```
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
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
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    baseUrl: getBaseUrl(),
    isProduction: isProduction(),
    isVercel: isVercel(),
  };
}
