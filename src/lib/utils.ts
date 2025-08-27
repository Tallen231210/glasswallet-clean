import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines className strings with Tailwind CSS class merging
 * Removes duplicate classes and handles Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values for display
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format credit score for display with color coding
 */
export function formatCreditScore(score: number): {
  formatted: string;
  category: 'excellent' | 'very-good' | 'good' | 'fair' | 'poor';
} {
  let category: 'excellent' | 'very-good' | 'good' | 'fair' | 'poor';

  if (score >= 800) category = 'excellent';
  else if (score >= 740) category = 'very-good';
  else if (score >= 670) category = 'good';
  else if (score >= 580) category = 'fair';
  else category = 'poor';

  return {
    formatted: score.toString(),
    category,
  };
}

/**
 * Generate initials from name for avatar display
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}