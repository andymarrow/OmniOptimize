import { z } from "zod";

/**
 * Retention Analytics Input Schemas
 * Validates query parameters for retention endpoints
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
 * Retention query parameters schema
 * Validates input for GET /analytics/retention endpoint
 */
export const retentionQuerySchema = z
  .object({
    projectId: z
      .string()
      .min(1, "projectId is required")
      .max(255, "projectId too long"),
    startDate: isoDateString,
    endDate: isoDateString,
    intervals: z
      .string()
      .optional()
      .default("0,1,3,7,14,30")
      .transform((val) => {
        // Parse comma-separated integers
        return val
          .split(",")
          .map((i) => {
            const parsed = parseInt(i.trim(), 10);
            return isNaN(parsed) ? null : parsed;
          })
          .filter((i): i is number => i !== null && i >= 0);
      })
      .refine(
        (intervals) => intervals.length > 0,
        "At least one valid interval required"
      ),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "startDate must be <= endDate",
    path: ["startDate"],
  });

/**
 * Parsed retention query parameters
 */
export type RetentionQuery = z.infer<typeof retentionQuerySchema>;

/**
 * Retention response schema
 * Describes the shape of the retention analytics response
 */
export const retentionResponseSchema = z.object({
  cohorts: z.array(
    z.object({
      date: z.string().describe("ISO date of cohort start (YYYY-MM-DD)"),
      size: z
        .number()
        .int()
        .nonnegative()
        .describe("Number of users in cohort"),
      retention: z
        .record(z.number().min(0).max(1))
        .describe("Day offset => retention percentage (0-1)"),
    })
  ),
});

/**
 * Parsed retention response
 */
export type RetentionResponse = z.infer<typeof retentionResponseSchema>;
