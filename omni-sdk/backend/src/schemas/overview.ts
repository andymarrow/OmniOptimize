import { z } from "zod";

/**
 * Overview Analytics Zod Schemas
 * Query validation and response shape for /analytics/overview
 */

export const overviewQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be ISO date YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be ISO date YYYY-MM-DD")
    .optional(),
});

export const overviewResponseSchema = z.object({
  range: z.object({
    start: z.string(),
    end: z.string(),
  }),
  comparison: z.object({
    start: z.string(),
    end: z.string(),
  }),
  cards: z.object({
    totalVisits: z.object({
      current: z.number(),
      previous: z.number(),
      changePct: z.number(),
    }),
    avgSession: z.object({
      current: z.number(),
      previous: z.number(),
      changePct: z.number(),
    }),
    bounceRate: z.object({
      current: z.number(),
      previous: z.number(),
      changePct: z.number(),
    }),
  }),
  chart: z.object({
    trafficOverview: z.array(
      z.object({
        date: z.string(),
        visitors: z.number(),
        bounceRate: z.number(),
      })
    ),
  }),
});

export type OverviewQuery = z.infer<typeof overviewQuerySchema>;
export type OverviewResponse = z.infer<typeof overviewResponseSchema>;
