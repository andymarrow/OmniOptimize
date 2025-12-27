import { z } from "zod";

/**
 * Traffic Analytics Dashboard Input Schemas
 * Validates query parameters for traffic analytics endpoints
 */

/**
 * ISO date string validation (YYYY-MM-DD)
 */
const isoDateString = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid date format. Use ISO 8601 (YYYY-MM-DD)"
  )
  .refine((date) => !isNaN(new Date(date).getTime()), "Invalid date string");

/**
 * Traffic analytics query parameters schema
 * Validates input for GET /traffic-analytics endpoint
 */
export const trafficAnalyticsQuerySchema = z
  .object({
    projectId: z
      .string()
      .min(1, "projectId is required")
      .max(255, "projectId too long"),
    startDate: isoDateString,
    endDate: isoDateString,
    timezone: z
      .string()
      .optional()
      .default("UTC")
      .describe(
        "Timezone for date calculations (currently UTC-only for backend)"
      ),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "startDate must be <= endDate",
    path: ["startDate"],
  });

/**
 * Parsed traffic analytics query parameters
 */
export type TrafficAnalyticsQuery = z.infer<typeof trafficAnalyticsQuerySchema>;

/**
 * Traffic analytics response schema
 * Describes the complete shape of the traffic analytics dashboard response
 */
export const trafficAnalyticsResponseSchema = z.object({
  range: z.object({
    start: z.string().describe("Start date of current range (ISO 8601)"),
    end: z.string().describe("End date of current range (ISO 8601)"),
  }),

  comparison: z.object({
    start: z.string().describe("Start date of previous period (ISO 8601)"),
    end: z.string().describe("End date of previous period (ISO 8601)"),
  }),

  cards: z.object({
    activeUsers: z.object({
      current: z
        .number()
        .nonnegative()
        .describe("Active users in current period"),
      previous: z
        .number()
        .nonnegative()
        .describe("Active users in previous period"),
      changePct: z
        .number()
        .describe("Percentage change (can be negative, e.g., -15.5)"),
    }),

    avgSessionTime: z.object({
      current: z
        .number()
        .nonnegative()
        .describe("Average session duration in seconds (current period)"),
      previous: z
        .number()
        .nonnegative()
        .describe("Average session duration in seconds (previous period)"),
      changePct: z.number().describe("Percentage change"),
    }),

    totalClicks: z.object({
      current: z
        .number()
        .nonnegative()
        .describe("Total clicks (current period)"),
      previous: z
        .number()
        .nonnegative()
        .describe("Total clicks (previous period)"),
      changePct: z.number().describe("Percentage change"),
    }),
  }),

  charts: z.object({
    visitorGrowth: z
      .array(
        z.object({
          date: z.string().describe("Date (ISO 8601)"),
          value: z.number().nonnegative().describe("Unique users that day"),
        })
      )
      .describe("Daily unique users for visitor growth chart"),
  }),

  demographics: z.object({
    countries: z
      .array(
        z.object({
          country: z.string().length(2).describe("ISO-2 country code"),
          percentage: z
            .number()
            .min(0)
            .max(100)
            .describe("Percentage of users from this country"),
        })
      )
      .describe("User distribution by country (based on first-seen location)"),
  }),

  devices: z.object({
    distribution: z
      .array(
        z.object({
          device: z
            .enum(["desktop", "mobile", "tablet"])
            .describe("Device type"),
          sessions: z
            .number()
            .nonnegative()
            .int()
            .describe("Number of sessions"),
          percentage: z
            .number()
            .min(0)
            .max(100)
            .describe("Percentage of total sessions"),
        })
      )
      .describe("Session distribution by device type"),
  }),
});

/**
 * Parsed traffic analytics response
 */
export type TrafficAnalyticsResponse = z.infer<
  typeof trafficAnalyticsResponseSchema
>;
