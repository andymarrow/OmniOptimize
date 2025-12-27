import {
  sessionRepository,
  rrwebRepository,
  heatmapRepository,
} from "../repositories";

/**
 * Session handler - fetch a session and all its rrweb replay events
 * No Hono/OpenAPI code, just business logic
 */
export async function getSessionHandler(sessionId: string) {
  if (!sessionId) {
    return {
      error: "sessionId is required",
      statusCode: 400,
    };
  }

  // Get session metadata
  const session = await sessionRepository.getSession(sessionId);
  if (!session) {
    return {
      error: "Session not found",
      statusCode: 404,
    };
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

  return {
    data: {
      session: {
        id: session.id,
        projectId: session.projectId,
        clientId: session.clientId,
        userId: session.userId,
        location: session.location,
        device: session.device,
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
    },
    statusCode: 200,
  };
}

/**
 * Replay handler - fetch a specific replay (single tab session)
 */
export async function getReplayHandler(replayId: string) {
  if (!replayId) {
    return {
      error: "replayId is required",
      statusCode: 400,
    };
  }

  const events = await rrwebRepository.getRrwebEventsByReplay(replayId);

  if (events.length === 0) {
    return {
      error: "Replay not found",
      statusCode: 404,
    };
  }

  return {
    data: {
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
    },
    statusCode: 200,
  };
}

/**
 * Project sessions handler - fetch all sessions for a project
 */
export async function getProjectSessionsHandler(projectId: string) {
  if (!projectId) {
    return {
      error: "projectId is required",
      statusCode: 400,
    };
  }

  // Get all sessions with stats
  const sessions = await sessionRepository.getSessionsWithStats(projectId);

  // Format response
  const formattedSessions = sessions.map((session) => {
    const duration = session.updatedAt.getTime() - session.createdAt.getTime();
    const startedAt = session.createdAt.getTime();

    return {
      id: session.id,
      clientId: session.clientId,
      userId: session.userId,
      location: session.location,
      device: session.device,
      duration,
      startedAt,
      endedAt: session.updatedAt.getTime(),
      eventsCount: session.eventsCount,
      rageClicks: session.rageClicks,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  });

  return {
    data: {
      projectId,
      sessionCount: formattedSessions.length,
      sessions: formattedSessions,
    },
    statusCode: 200,
  };
}
