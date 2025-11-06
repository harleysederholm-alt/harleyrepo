import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Muotoile päivämäärä suomalaiseen muotoon
 */
export function formatDateFi(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Laske päivien määrä tästä hetkestä annettuun päivämäärään
 */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Muotoile AI-osuvuusprosentti visuaaliseksi
 */
export function formatMatchPercentage(percentage: number): {
  label: string;
  color: string;
  badge: string;
} {
  if (percentage >= 80) {
    return {
      label: 'Erinomainen osuma',
      color: 'text-green-700',
      badge: 'badge-success',
    };
  } else if (percentage >= 60) {
    return {
      label: 'Hyvä osuma',
      color: 'text-blue-700',
      badge: 'badge-primary',
    };
  } else if (percentage >= 40) {
    return {
      label: 'Kohtalainen osuma',
      color: 'text-yellow-700',
      badge: 'badge-warning',
    };
  } else {
    return {
      label: 'Heikko osuma',
      color: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800',
    };
  }
}

/**
 * Truncate teksti tiettyyn pituuteen
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Sleep-funktio (async)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
