/**
 * Financial Year Management Utility
 * 
 * Handles Indian financial year calculations (April 1 - March 31)
 * Automatically manages transitions and determines active years for data sync
 */

export interface FinancialYear {
  code: string;        // "2024-2025"
  startYear: number;   // 2024
  endYear: number;     // 2025
  startDate: Date;     // April 1, 2024
  endDate: Date;       // March 31, 2025
  isCurrent: boolean;  // Is this the current FY?
  isPrevious: boolean; // Is this the previous FY?
}

/**
 * Get the current financial year based on today's date
 * Indian FY runs from April 1 to March 31
 */
export function getCurrentFinancialYear(): FinancialYear {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-indexed (0 = January, 3 = April)
  const currentYear = today.getFullYear();
  
  // If we're in Jan-Mar, FY started last year
  // If we're in Apr-Dec, FY started this year
  const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
  const endYear = startYear + 1;
  
  return {
    code: `${startYear}-${endYear}`,
    startYear,
    endYear,
    startDate: new Date(startYear, 3, 1), // April 1
    endDate: new Date(endYear, 2, 31),    // March 31
    isCurrent: true,
    isPrevious: false,
  };
}

/**
 * Get the previous financial year
 */
export function getPreviousFinancialYear(): FinancialYear {
  const current = getCurrentFinancialYear();
  const startYear = current.startYear - 1;
  const endYear = current.endYear - 1;
  
  return {
    code: `${startYear}-${endYear}`,
    startYear,
    endYear,
    startDate: new Date(startYear, 3, 1),
    endDate: new Date(endYear, 2, 31),
    isCurrent: false,
    isPrevious: true,
  };
}

/**
 * Get both current and previous financial years
 * This is what we sync daily to keep data fresh
 */
export function getActiveFinancialYears(): FinancialYear[] {
  return [
    getPreviousFinancialYear(),
    getCurrentFinancialYear(),
  ];
}

/**
 * Get all financial years to sync (for initial bulk import)
 * Returns previous + current FY
 */
export function getBulkImportFinancialYears(): string[] {
  const years = getActiveFinancialYears();
  return years.map(fy => fy.code);
}

/**
 * Check if a date falls within a financial year
 */
export function isDateInFinancialYear(date: Date, fy: FinancialYear): boolean {
  return date >= fy.startDate && date <= fy.endDate;
}

/**
 * Get financial year for a specific date
 */
export function getFinancialYearForDate(date: Date): FinancialYear {
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const startYear = month < 3 ? year - 1 : year;
  const endYear = startYear + 1;
  
  const current = getCurrentFinancialYear();
  
  return {
    code: `${startYear}-${endYear}`,
    startYear,
    endYear,
    startDate: new Date(startYear, 3, 1),
    endDate: new Date(endYear, 2, 31),
    isCurrent: current.code === `${startYear}-${endYear}`,
    isPrevious: current.startYear - 1 === startYear,
  };
}

/**
 * Format financial year for display
 * Example: "2024-25" or "FY 2024-25"
 */
export function formatFinancialYear(fyCode: string, includePrefix = false): string {
  const [startYear, endYear] = fyCode.split("-");
  const shortEndYear = endYear.slice(-2);
  const formatted = `${startYear}-${shortEndYear}`;
  return includePrefix ? `FY ${formatted}` : formatted;
}

/**
 * Get the next financial year (for planning purposes)
 */
export function getNextFinancialYear(): FinancialYear {
  const current = getCurrentFinancialYear();
  const startYear = current.startYear + 1;
  const endYear = current.endYear + 1;
  
  return {
    code: `${startYear}-${endYear}`,
    startYear,
    endYear,
    startDate: new Date(startYear, 3, 1),
    endDate: new Date(endYear, 2, 31),
    isCurrent: false,
    isPrevious: false,
  };
}

/**
 * Calculate days until next financial year starts
 */
export function daysUntilNextFinancialYear(): number {
  const today = new Date();
  const current = getCurrentFinancialYear();
  const diffMs = current.endDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get sync configuration based on current date
 * Returns which financial years should be synced
 */
export function getSyncConfiguration(): {
  years: string[];
  isTransitionPeriod: boolean;
  message: string;
} {
  const active = getActiveFinancialYears();
  const daysUntilNext = daysUntilNextFinancialYear();
  const isTransitionPeriod = daysUntilNext <= 30; // Last 30 days of FY
  
  let message = `Syncing data for ${active.map(fy => formatFinancialYear(fy.code, true)).join(" and ")}`;
  
  if (isTransitionPeriod) {
    message += ` (Transition period: ${daysUntilNext} days until new FY)`;
  }
  
  return {
    years: active.map(fy => fy.code),
    isTransitionPeriod,
    message,
  };
}

// Export commonly used values
export const CURRENT_FY = getCurrentFinancialYear();
export const PREVIOUS_FY = getPreviousFinancialYear();
export const ACTIVE_FYS = getActiveFinancialYears();
