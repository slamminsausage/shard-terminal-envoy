// Imperial Calendar Utilities for Traveller RPG
// Standard Imperial Calendar format: DDD-YYYY (day of year - year)
// Example: 001-1105 = Day 1 of Year 1105

import { ImperialDate } from '@/types/calendar';

/**
 * Parse an Imperial Date string (e.g., "001-1105") into components
 */
export function parseImperialDate(imperialDateStr: string): ImperialDate | null {
  const match = imperialDateStr.match(/^(\d{3})-(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  if (day < 1 || day > 365 || year < 0) return null;

  return {
    day,
    year,
    formatted: imperialDateStr,
  };
}

/**
 * Format an Imperial Date from day and year
 */
export function formatImperialDate(day: number, year: number): string {
  const dayStr = day.toString().padStart(3, '0');
  const yearStr = year.toString().padStart(4, '0');
  return `${dayStr}-${yearStr}`;
}

/**
 * Create an ImperialDate object from day and year
 */
export function createImperialDate(day: number, year: number): ImperialDate {
  return {
    day,
    year,
    formatted: formatImperialDate(day, year),
  };
}

/**
 * Get current real-world date as Imperial Date
 * Default year: 1105 (classic Traveller era)
 */
export function getCurrentImperialDate(baseYear: number = 1105): ImperialDate {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return createImperialDate(dayOfYear, baseYear);
}

/**
 * Add days to an Imperial Date
 */
export function addDays(date: ImperialDate, days: number): ImperialDate {
  let newDay = date.day + days;
  let newYear = date.year;

  while (newDay > 365) {
    newDay -= 365;
    newYear++;
  }

  while (newDay < 1) {
    newDay += 365;
    newYear--;
  }

  return createImperialDate(newDay, newYear);
}

/**
 * Subtract days from an Imperial Date
 */
export function subtractDays(date: ImperialDate, days: number): ImperialDate {
  return addDays(date, -days);
}

/**
 * Calculate difference in days between two Imperial Dates
 */
export function daysBetween(date1: ImperialDate, date2: ImperialDate): number {
  const totalDays1 = date1.year * 365 + date1.day;
  const totalDays2 = date2.year * 365 + date2.day;
  return totalDays2 - totalDays1;
}

/**
 * Compare two Imperial Dates
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareImperialDates(date1: ImperialDate, date2: ImperialDate): number {
  if (date1.year < date2.year) return -1;
  if (date1.year > date2.year) return 1;
  if (date1.day < date2.day) return -1;
  if (date1.day > date2.day) return 1;
  return 0;
}

/**
 * Check if date1 is before date2
 */
export function isBefore(date1: ImperialDate, date2: ImperialDate): boolean {
  return compareImperialDates(date1, date2) < 0;
}

/**
 * Check if date1 is after date2
 */
export function isAfter(date1: ImperialDate, date2: ImperialDate): boolean {
  return compareImperialDates(date1, date2) > 0;
}

/**
 * Check if two dates are the same
 */
export function isSameDate(date1: ImperialDate, date2: ImperialDate): boolean {
  return compareImperialDates(date1, date2) === 0;
}

/**
 * Calculate jump travel time based on parsecs
 * Standard jump time: ~1 week (7 days) per jump, regardless of distance within jump range
 */
export function calculateJumpTime(parsecs: number, jumpRating: number = 1): number {
  if (parsecs === 0) return 0;

  // Calculate number of jumps needed
  const jumpsNeeded = Math.ceil(parsecs / jumpRating);

  // Each jump takes approximately 7 days (1 week in jump space)
  return jumpsNeeded * 7;
}

/**
 * Calculate arrival date after jump travel
 */
export function calculateArrivalDate(
  departureDate: ImperialDate,
  parsecs: number,
  jumpRating: number = 1
): ImperialDate {
  const travelDays = calculateJumpTime(parsecs, jumpRating);
  return addDays(departureDate, travelDays);
}

/**
 * Get human-readable description of Imperial Date
 * E.g., "Day 135, Year 1105"
 */
export function formatImperialDateLong(date: ImperialDate): string {
  return `Day ${date.day}, Year ${date.year}`;
}

/**
 * Get month approximation (for display purposes)
 * Assumes 30-day months for simplicity
 */
export function getApproximateMonth(day: number): { month: number; dayOfMonth: number } {
  const month = Math.floor((day - 1) / 30) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  return { month, dayOfMonth };
}

/**
 * Format with approximate month
 * E.g., "Month 5, Day 15, Year 1105"
 */
export function formatWithMonth(date: ImperialDate): string {
  const { month, dayOfMonth } = getApproximateMonth(date.day);
  return `Month ${month}, Day ${dayOfMonth}, Year ${date.year}`;
}

/**
 * Validate if a day number is valid (1-365)
 */
export function isValidDay(day: number): boolean {
  return day >= 1 && day <= 365 && Number.isInteger(day);
}

/**
 * Validate if a year number is reasonable
 */
export function isValidYear(year: number): boolean {
  return year >= 0 && year <= 9999 && Number.isInteger(year);
}

/**
 * Get the next occurrence of a specific day of year
 */
export function getNextOccurrence(currentDate: ImperialDate, targetDay: number): ImperialDate {
  if (currentDate.day < targetDay) {
    // Target day is later this year
    return createImperialDate(targetDay, currentDate.year);
  } else {
    // Target day is next year
    return createImperialDate(targetDay, currentDate.year + 1);
  }
}

/**
 * Calculate monthly expense due date (assumes day 1 of each month = every 30 days)
 */
export function getNextMonthlyDueDate(currentDate: ImperialDate): ImperialDate {
  // Find next day that's a multiple of 30 (approximately monthly)
  const nextMonthDay = Math.ceil(currentDate.day / 30) * 30;

  if (nextMonthDay <= 365) {
    return createImperialDate(nextMonthDay, currentDate.year);
  } else {
    // Next month is next year
    return createImperialDate(30, currentDate.year + 1);
  }
}

/**
 * Check if a date is a monthly due date (day is multiple of 30)
 */
export function isMonthlyDueDate(day: number): boolean {
  return day % 30 === 0;
}
