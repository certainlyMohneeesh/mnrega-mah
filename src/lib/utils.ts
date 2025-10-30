import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number to Indian numbering system with Lakhs/Crores
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`
  }
  return `₹${num.toFixed(2)}`
}

/**
 * Format large numbers with Indian commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(num))
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
