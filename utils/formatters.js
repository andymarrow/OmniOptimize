/**
 * Reusable formatters for analytics data
 * Uses Intl API for numbers and custom logic for durations/trends
 */

export function formatNumberCompact(value) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercentage(value) {
  if (value === null || value === undefined) return "—";

  const num = Number(value);
  const sign = num > 0 ? "+" : "";

  return `${sign}${num.toFixed(1)}%`;
}

export function formatDurationSeconds(seconds) {
  if (!seconds || seconds < 1) return "0s";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function getTrend(changePct, inverted = false) {
  if (changePct === 0) return "neutral";

  const positive = inverted ? changePct < 0 : changePct > 0;
  return positive ? "up" : "down";
}

export function getTrendColors(trend) {
  const colors = {
    up: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    down: {
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    neutral: {
      text: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-900/30",
    },
  };

  return colors[trend] || colors.neutral;
}
