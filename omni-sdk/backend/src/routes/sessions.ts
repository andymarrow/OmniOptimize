import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import {
  getSessionHandler,
  getReplayHandler,
  getProjectSessionsHandler,
} from "../handlers";
import { z } from "zod";

/**
 * Create sessions router
 */
export function createSessionsRouter() {
  const router = new Hono();

  /**
   * GET /sessions/:sessionId
   * Fetch a session and all its rrweb replay events
   */
  router.get(
    "/:sessionId",
    describeRoute({
      description:
        "Fetch a session and all its rrweb replay events grouped by replay ID",
      responses: {
        200: {
          description: "Session found with replay events",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({
                    session: z.object({
                      id: z.string(),
                      projectId: z.string(),
                      clientId: z.string(),
                      userId: z.string().nullable(),
                      location: z.string(),
                      device: z.string(),
                      createdAt: z.date(),
                      updatedAt: z.date(),
                    }),
                    eventCount: z.number(),
                    replays: z.array(
                      z.object({
                        replayId: z.string(),
                        eventCount: z.number(),
                        startTime: z.number().optional(),
                        endTime: z.number().optional(),
                        events: z.array(z.record(z.any())),
                      })
                    ),
                  }),
                })
              ),
            },
          },
        },
        400: {
          description: "Missing or invalid sessionId",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        404: {
          description: "Session not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const sessionId = c.req.param("sessionId");
      const result = await getSessionHandler(sessionId);

      if ("error" in result) {
        return c.json(
          { error: result.error },
          (result.statusCode || 400) as 400 | 404
        );
      }

      return c.json(result.data, 200);
    }
  );

  /**
   * GET /replays/:replayId
   * Fetch a specific replay (single tab session)
   */
  router.get(
    "/replays/:replayId",
    describeRoute({
      description: "Fetch a specific replay with all rrweb events",
      responses: {
        200: {
          description: "Replay found with events",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({
                    replayId: z.string(),
                    sessionId: z.string(),
                    clientId: z.string(),
                    userId: z.string().nullable(),
                    eventCount: z.number(),
                    startTime: z.number(),
                    endTime: z.number(),
                    events: z.array(z.record(z.any())),
                  }),
                })
              ),
            },
          },
        },
        400: {
          description: "Missing or invalid replayId",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        404: {
          description: "Replay not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const replayId = c.req.param("replayId");
      const result = await getReplayHandler(replayId);

      if ("error" in result) {
        return c.json(
          { error: result.error },
          (result.statusCode || 400) as 400 | 404
        );
      }

      return c.json(result.data, 200);
    }
  );

  /**
   * GET /projects/:projectId/sessions
   * Fetch all sessions for a project
   */
  router.get(
    "/projects/:projectId",
    describeRoute({
      description: "Fetch all sessions for a project with statistics",
      responses: {
        200: {
          description: "Project sessions retrieved",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  data: z.object({
                    projectId: z.string(),
                    sessionCount: z.number(),
                    sessions: z.array(z.record(z.any())),
                  }),
                })
              ),
            },
          },
        },
        400: {
          description: "Missing or invalid projectId",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const projectId = c.req.param("projectId");
      const result = await getProjectSessionsHandler(projectId);

      if ("error" in result) {
        return c.json(
          { error: result.error },
          (result.statusCode || 400) as 400
        );
      }

      return c.json(result.data, 200);
    }
  );

  return router;
}

// Export default instance (overridden in index.ts)
export default new Hono();
