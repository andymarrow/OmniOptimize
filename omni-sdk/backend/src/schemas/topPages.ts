import { z } from "zod";

/**
 * Top Pages Analytics Zod Schemas
 * Query validation and response shape for /analytics/top-pages
 */

export const topPagesQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be ISO date YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be ISO date YYYY-MM-DD"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const topPagesResponseSchema = z.object({
  range: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  pages: z.array(
    z.object({
      path: z.string(),
      views: z.number().int(),
      avgTimeSeconds: z.number().int(),
    })
  ),
});

export type TopPagesQuery = z.infer<typeof topPagesQuerySchema>;
export type TopPagesResponse = z.infer<typeof topPagesResponseSchema>;
