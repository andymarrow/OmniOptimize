import {
  sessionRepository,
  rrwebRepository,
  heatmapRepository,
} from "../repositories";
import type { Context } from "hono";

/**
 * GET /sessions/:sessionId
 * Fetch a session and all its rrweb replay events
 */
export async function getSessionHandler(c: Context) {
  try {
    const sessionId = c.req.param("sessionId");

    if (!sessionId) {
      return c.json({ error: "sessionId is required" }, 400);
    }

    // Get session metadata
    const session = await sessionRepository.getSession(sessionId);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Get all rrweb events for this session
    const events = await rrwebRepository.getRrwebEventsBySession(sessionId);

    // Group events by replayId (each tab gets its own replay)
    const replays = new Map<string, typeof events>();
    for (const event of events) {
      const replay = replays.get(event.replayId) || [];
      replay.push(event);
      replays.set(event.replayId, replay);
    }

    return c.json({
      session: {
        id: session.id,
        projectId: session.projectId,
        clientId: session.clientId,
        userId: session.userId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      eventCount: events.length,
      replays: Array.from(replays.entries()).map(
        ([replayId, replayEvents]) => ({
          replayId,
          eventCount: replayEvents.length,
          startTime: replayEvents[0]?.timestamp,
          endTime: replayEvents[replayEvents.length - 1]?.timestamp,
          events: replayEvents.map((e) => ({
            id: e.id,
            eventId: e.eventId,
            timestamp: e.timestamp,
            url: e.url,
            rrwebPayload: e.rrwebPayload,
            schemaVersion: e.schemaVersion,
          })),
        })
      ),
    });
  } catch (error) {
    console.error("[GetSession] Error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

/**
 * GET /replays/:replayId
 * Fetch a specific replay (single tab session)
 */
export async function getReplayHandler(c: Context) {
  try {
    const replayId = c.req.param("replayId");

    if (!replayId) {
      return c.json({ error: "replayId is required" }, 400);
    }

    const events = await rrwebRepository.getRrwebEventsByReplay(replayId);

    if (events.length === 0) {
      return c.json({ error: "Replay not found" }, 404);
    }

    return c.json({
      replayId,
      sessionId: events[0].sessionId,
      clientId: events[0].clientId,
      userId: events[0].userId,
      eventCount: events.length,
      startTime: events[0].timestamp,
      endTime: events[events.length - 1].timestamp,
      events: events.map((e) => ({
        id: e.id,
        eventId: e.eventId,
        timestamp: e.timestamp,
        url: e.url,
        rrwebPayload: e.rrwebPayload,
        schemaVersion: e.schemaVersion,
        pageWidth: e.pageWidth,
        pageHeight: e.pageHeight,
        viewportWidth: e.viewportWidth,
        viewportHeight: e.viewportHeight,
      })),
    });
  } catch (error) {
    console.error("[GetReplay] Error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
