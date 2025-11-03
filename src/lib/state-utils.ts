/**
 * State utilities and constants for MGNREGA dashboard
 * Contains state codes, names, and helper functions
 */

export interface StateInfo {
  code: string;
  name: string;
  displayName: string;
}

// All Indian States and UTs with codes
export const ALL_INDIAN_STATES: StateInfo[] = [
  { code: "AN", name: "ANDAMAN AND NICOBAR", displayName: "Andaman and Nicobar" },
  { code: "AP", name: "ANDHRA PRADESH", displayName: "Andhra Pradesh" },
  { code: "AR", name: "ARUNACHAL PRADESH", displayName: "Arunachal Pradesh" },
  { code: "AS", name: "ASSAM", displayName: "Assam" },
  { code: "BR", name: "BIHAR", displayName: "Bihar" },
  { code: "CH", name: "CHANDIGARH", displayName: "Chandigarh" },
  { code: "CT", name: "CHHATTISGARH", displayName: "Chhattisgarh" },
  { code: "DN", name: "DADRA AND NAGAR HAVELI", displayName: "Dadra and Nagar Haveli" },
  { code: "DD", name: "DAMAN AND DIU", displayName: "Daman and Diu" },
  { code: "GA", name: "GOA", displayName: "Goa" },
  { code: "GJ", name: "GUJARAT", displayName: "Gujarat" },
  { code: "HR", name: "HARYANA", displayName: "Haryana" },
  { code: "HP", name: "HIMACHAL PRADESH", displayName: "Himachal Pradesh" },
  { code: "JK", name: "JAMMU AND KASHMIR", displayName: "Jammu and Kashmir" },
  { code: "JH", name: "JHARKHAND", displayName: "Jharkhand" },
  { code: "KA", name: "KARNATAKA", displayName: "Karnataka" },
  { code: "KL", name: "KERALA", displayName: "Kerala" },
  { code: "LA", name: "LADAKH", displayName: "Ladakh" },
  { code: "LD", name: "LAKSHADWEEP", displayName: "Lakshadweep" },
  { code: "MP", name: "MADHYA PRADESH", displayName: "Madhya Pradesh" },
  { code: "MH", name: "MAHARASHTRA", displayName: "Maharashtra" },
  { code: "MN", name: "MANIPUR", displayName: "Manipur" },
  { code: "ML", name: "MEGHALAYA", displayName: "Meghalaya" },
  { code: "MZ", name: "MIZORAM", displayName: "Mizoram" },
  { code: "NL", name: "NAGALAND", displayName: "Nagaland" },
  { code: "OR", name: "ODISHA", displayName: "Odisha" },
  { code: "PY", name: "PUDUCHERRY", displayName: "Puducherry" },
  { code: "PB", name: "PUNJAB", displayName: "Punjab" },
  { code: "RJ", name: "RAJASTHAN", displayName: "Rajasthan" },
  { code: "SK", name: "SIKKIM", displayName: "Sikkim" },
  { code: "TN", name: "TAMIL NADU", displayName: "Tamil Nadu" },
  { code: "TS", name: "TELANGANA", displayName: "Telangana" },
  { code: "TR", name: "TRIPURA", displayName: "Tripura" },
  { code: "UP", name: "UTTAR PRADESH", displayName: "Uttar Pradesh" },
  { code: "UK", name: "UTTARAKHAND", displayName: "Uttarakhand" },
  { code: "WB", name: "WEST BENGAL", displayName: "West Bengal" },
];

/**
 * Convert state name to URL-safe slug
 * Example: "ANDHRA PRADESH" -> "andhra-pradesh"
 */
export function stateNameToSlug(stateName: string): string {
  return stateName.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert slug back to state name
 * Example: "andhra-pradesh" -> "ANDHRA PRADESH"
 */
export function slugToStateName(slug: string): string {
  if (!slug) return "";
  return slug.toUpperCase().replace(/-/g, " ");
}

/**
 * Get state info by code
 */
export function getStateByCode(code: string): StateInfo | undefined {
  if (!code) return undefined;
  return ALL_INDIAN_STATES.find(
    (state) => state.code.toLowerCase() === code.toLowerCase()
  );
}

/**
 * Get state info by name (case-insensitive)
 */
export function getStateByName(name: string): StateInfo | undefined {
  if (!name) return undefined;
  const normalizedName = name.toUpperCase();
  return ALL_INDIAN_STATES.find((state) => state.name === normalizedName);
}

/**
 * Get state info by slug
 */
export function getStateBySlug(slug: string): StateInfo | undefined {
  if (!slug) return undefined;
  const stateName = slugToStateName(slug);
  return getStateByName(stateName);
}

/**
 * Get all state slugs for static path generation
 */
export function getAllStateParams(): { stateCode: string }[] {
  return ALL_INDIAN_STATES.map((state) => ({
    stateCode: stateNameToSlug(state.name),
  }));
}

/**
 * Format number to Indian numbering system (Lakhs/Crores)
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    // 1 crore = 10 million
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // 1 lakh = 100k
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(2)}`;
}

/**
 * Format large numbers with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Validate if a slug corresponds to a valid state
 */
export function isValidStateSlug(slug: string): boolean {
  return getStateBySlug(slug) !== undefined;
}
