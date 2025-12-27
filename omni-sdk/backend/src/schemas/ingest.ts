import { z } from "zod";

/**
 * Ingest request schemas
 * Single source of truth for batch validation
 */

const DimensionsSchema = z.object({
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});

const RrwebPayloadSchema = z.object({
  type: z.number(),
  data: z.record(z.any()),
  timestamp: z.number().optional(),
});

const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  projectId: z.string().min(1),
  clientId: z.string().min(1),
  sessionId: z.string().min(1),
  userId: z.string().nullable(),
  type: z.enum([
    "pageview",
    "click",
    "input",
    "route",
    "custom",
    "session_snapshot",
    "rrweb",
  ]),
  timestamp: z.number(),
  url: z.string().url(),
  referrer: z.string(),
  pageDimensions: DimensionsSchema,
  viewport: DimensionsSchema,
  properties: z.record(z.any()).optional(),
});

const RrwebEventSchema = BaseEventSchema.extend({
  type: z.literal("rrweb"),
  replayId: z.string().min(1),
  rrwebPayload: RrwebPayloadSchema,
  schemaVersion: z.string(),
});

const ClickEventSchema = BaseEventSchema.extend({
  type: z.literal("click"),
  pageX: z.number(),
  pageY: z.number(),
  xNorm: z.number().min(0).max(1),
  yNorm: z.number().min(0).max(1),
  selector: z.string().min(1),
  tagName: z.string().min(1),
  elementTextHash: z.string().optional(),
  xpath: z.string().optional(),
  screenClass: z.enum(["mobile", "tablet", "desktop"]).optional(),
  layoutHash: z.string().optional(),
});

const EventSchema = z.union([
  RrwebEventSchema,
  ClickEventSchema,
  BaseEventSchema,
]);

/**
 * Request schema for batch ingestion
 */
export const BatchSchema = z.object({
  batchId: z.string().min(1),
  timestamp: z.number(),
  events: z.array(EventSchema).min(1),
});

/**
 * Response schemas
 */
export const IngestSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  batchId: z.string(),
  jobId: z.string(),
});

export const IngestErrorResponseSchema = z.object({
  error: z.string(),
});

/**
 * Type exports for handler implementations
 */
export type IngestRequest = z.infer<typeof BatchSchema>;
export type IngestSuccessResponse = z.infer<typeof IngestSuccessResponseSchema>;
export type IngestErrorResponse = z.infer<typeof IngestErrorResponseSchema>;
