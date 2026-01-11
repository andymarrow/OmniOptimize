import { describe, test, expect, mock, beforeEach } from "bun:test";

// Mock DB client to prevent connection attempt and env check
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// Mock repositories
const mockGetSession = mock(() => Promise.resolve(null as any));
const mockGetRrwebEventsBySession = mock(() => Promise.resolve([] as any[]));
const mockGetRrwebEventsByReplay = mock(() => Promise.resolve([] as any[]));
const mockGetSessionsWithStats = mock(() => Promise.resolve([] as any[]));

mock.module("../../../src/repositories", () => ({
    sessionRepository: {
        getSession: mockGetSession,
        getSessionsWithStats: mockGetSessionsWithStats,
    },
    rrwebRepository: {
        getRrwebEventsBySession: mockGetRrwebEventsBySession,
        getRrwebEventsByReplay: mockGetRrwebEventsByReplay,
    },
    // Mock everything else to avoid missing export errors
    heatmapRepository: {},
    eventRepository: {},
    userRepository: {},
    trafficAnalyticsRepository: {},
    overviewAnalyticsRepository: {},
    topPagesRepository: {},
    retentionRepository: {},
}));

describe("Sessions Handler", () => {
    beforeEach(() => {
        mockGetSession.mockClear();
        mockGetRrwebEventsBySession.mockClear();
        mockGetRrwebEventsByReplay.mockClear();
        mockGetSessionsWithStats.mockClear();
    });

    describe("getSessionHandler", () => {
        test("should return 400 if sessionId is missing", async () => {
            const { getSessionHandler } = await import("../../../src/handlers/sessions.handler");
            const result = await getSessionHandler("");
            expect((result as any).statusCode).toBe(400);
            expect((result as any).error).toBeDefined();
        });

        test("should return 404 if session not found", async () => {
            const { getSessionHandler } = await import("../../../src/handlers/sessions.handler");
            mockGetSession.mockResolvedValue(null);
            const result = await getSessionHandler("sess_unknown");
            expect((result as any).statusCode).toBe(404);
        });

        test("should return 200 and formatted session data", async () => {
            const { getSessionHandler } = await import("../../../src/handlers/sessions.handler");
            // Mock session
            mockGetSession.mockResolvedValue({
                id: "sess_1",
                projectId: "proj_1",
                clientId: "client_1",
                userId: "user_1",
                location: "US",
                device: "Desktop",
                createdAt: new Date("2023-01-01T10:00:00Z"),
                updatedAt: new Date("2023-01-01T10:30:00Z"),
            });

            // Mock events
            mockGetRrwebEventsBySession.mockResolvedValue([
                {
                    id: 1,
                    eventId: "evt_1",
                    replayId: "replay_1",
                    timestamp: new Date("2023-01-01T10:05:00Z"),
                    url: "/home",
                    rrwebPayload: { type: 2, data: {} },
                    schemaVersion: "v1",
                },
                {
                    id: 2,
                    eventId: "evt_2",
                    replayId: "replay_1",
                    timestamp: new Date("2023-01-01T10:10:00Z"),
                    url: "/home",
                    rrwebPayload: { type: 3, data: {} },
                    schemaVersion: "v1",
                },
            ]);

            const result = await getSessionHandler("sess_1");
            const data = (result as any).data;

            expect((result as any).statusCode).toBe(200);
            expect(data.session.id).toBe("sess_1");
            expect(data.eventCount).toBe(2);
            expect(data.replays.length).toBe(1);
            expect(data.replays[0].replayId).toBe("replay_1");
            expect(data.replays[0].events.length).toBe(2);
        });
    });

    describe("getReplayHandler", () => {
        test("should return 400 if replayId is missing", async () => {
            const { getReplayHandler } = await import("../../../src/handlers/sessions.handler");
            const result = await getReplayHandler("");
            expect((result as any).statusCode).toBe(400);
        });

        test("should return 404 if replay has no events", async () => {
            const { getReplayHandler } = await import("../../../src/handlers/sessions.handler");
            mockGetRrwebEventsByReplay.mockResolvedValue([]);
            const result = await getReplayHandler("replay_unknown");
            expect((result as any).statusCode).toBe(404);
        });

        test("should return 200 and replay data", async () => {
            const { getReplayHandler } = await import("../../../src/handlers/sessions.handler");
            mockGetRrwebEventsByReplay.mockResolvedValue([
                {
                    id: 1,
                    eventId: "evt_1",
                    sessionId: "sess_1",
                    clientId: "c1",
                    userId: "u1",
                    timestamp: new Date("2023-01-01T10:00:00Z"),
                    url: "/app",
                    rrwebPayload: {},
                    schemaVersion: "v1",
                    pageWidth: 1024,
                    pageHeight: 768,
                    viewportWidth: 1024,
                    viewportHeight: 768,
                },
            ]);

            const result = await getReplayHandler("replay_1");
            expect((result as any).statusCode).toBe(200);
            expect((result as any).data.replayId).toBe("replay_1");
            expect((result as any).data.eventCount).toBe(1);
        });
    });

    describe("getProjectSessionsHandler", () => {
        test("should return 400 if projectId is missing", async () => {
            const { getProjectSessionsHandler } = await import("../../../src/handlers/sessions.handler");
            const result = await getProjectSessionsHandler("");
            expect((result as any).statusCode).toBe(400);
        });

        test("should return 200 and list of sessions", async () => {
            const { getProjectSessionsHandler } = await import("../../../src/handlers/sessions.handler");
            const now = new Date();
            const past = new Date(now.getTime() - 1000);

            mockGetSessionsWithStats.mockResolvedValue([
                {
                    id: "sess_1",
                    clientId: "c1",
                    userId: "u1",
                    location: "US",
                    device: "Mobile",
                    createdAt: past,
                    updatedAt: now,
                    eventsCount: 10,
                    rageClicks: 0,
                },
            ]);

            const result = await getProjectSessionsHandler("proj_1");
            const data = (result as any).data;

            expect((result as any).statusCode).toBe(200);
            expect(data.projectId).toBe("proj_1");
            expect(data.sessionCount).toBe(1);
            expect(data.sessions[0].duration).toBe(1000);
            expect(data.sessions[0].eventsCount).toBe(10);
        });
    });
});
