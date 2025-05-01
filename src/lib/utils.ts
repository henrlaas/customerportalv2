
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'NOK')
 * @returns The formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'NOK'): string {
  return new Intl.NumberFormat('no-NO', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
