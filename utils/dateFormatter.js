/**
 * Date utilities for analytics
 * Uses date-fns for all date operations
 */

import { format, parse, subDays, isValid } from "date-fns";

export function formatDateISO(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function formatDateDisplay(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function parseISO(dateString) {
  const d = parse(dateString, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : null;
}

export function getDefaultDateRange() {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  return {
    startDate: formatDateISO(thirtyDaysAgo),
    endDate: formatDateISO(today),
  };
}

export function formatDateRangeDisplay(startDate, endDate) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (!start || !end) return "";

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

export function formatChartLabel(dateString) {
  const d = parseISO(dateString);
  if (!d) return dateString;
  return format(d, "MMM d");
}

export function isValidDateRange(startDate, endDate) {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  if (!start || !end) return false;
  return start <= end;
}
