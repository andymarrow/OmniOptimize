import { describe, test, expect, mock, beforeEach } from "bun:test";

// Mock DB client
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// Mock repositories
const mockGetOverviewAnalytics = mock(() => Promise.resolve({
    range: { start: "2023-01-01", end: "2023-01-30" },
    comparison: { start: "2022-12-01", end: "2022-12-30" },
    totalVisitsCurrent: 1000,
    totalVisitsPrevious: 800,
    avgSessionCurrent: 120,
    avgSessionPrevious: 100,
    bounceRateCurrent: 40,
    bounceRatePrevious: 50,
    dailyTraffic: [],
} as any));

const mockGetTopPages = mock(() => Promise.resolve([
    { path: "/home", views: 500, avgTimeSeconds: 60 },
    { path: "/pricing", views: 200, avgTimeSeconds: 90 },
] as any[]));

mock.module("../../../src/repositories", () => ({
    overviewAnalyticsRepository: {
        getOverviewAnalytics: mockGetOverviewAnalytics,
    },
    topPagesRepository: {
        getTopPages: mockGetTopPages,
    },
    // Mock everything else to avoid missing export errors
    sessionRepository: {},
    rrwebRepository: {},
    heatmapRepository: {},
    eventRepository: {},
    userRepository: {},
    trafficAnalyticsRepository: {},
    retentionRepository: {},
}));

describe("Analytics Handlers", () => {
    beforeEach(() => {
        mockGetOverviewAnalytics.mockClear();
        mockGetTopPages.mockClear();
    });

    describe("getOverviewAnalyticsHandler", () => {
        test("should use default dates if not provided", async () => {
            const { getOverviewAnalyticsHandler } = await import("../../../src/handlers/overview.handler");

            await getOverviewAnalyticsHandler({ projectId: "proj_1" });

            expect(mockGetOverviewAnalytics).toHaveBeenCalled();
            const callArgs = (mockGetOverviewAnalytics.mock.calls[0] as any);
            // Arg 0: projectId
            expect(callArgs[0]).toBe("proj_1");
            // Arg 1 & 2: dates should be strings (YYYY-MM-DD)
            expect(callArgs[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(callArgs[2]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test("should return 400 if validation fails", async () => {
            const { getOverviewAnalyticsHandler } = await import("../../../src/handlers/overview.handler");

            const result = await getOverviewAnalyticsHandler({ projectId: "" }); // Empty projectId
            expect((result as any).statusCode).toBe(400);
            expect((result as any).error).toBe("Validation failed");
        });

        test("should calculate percentage changes correctly", async () => {
            const { getOverviewAnalyticsHandler } = await import("../../../src/handlers/overview.handler");

            mockGetOverviewAnalytics.mockResolvedValue({
                range: { start: "2023-01-01", end: "2023-01-30" },
                comparison: { start: "2022-12-01", end: "2022-12-30" },
                totalVisitsCurrent: 150,
                totalVisitsPrevious: 100, // +50%
                avgSessionCurrent: 90,
                avgSessionPrevious: 100, // -10%
                bounceRateCurrent: 0,
                bounceRatePrevious: 0,
                dailyTraffic: [],
            } as any);

            const result = await getOverviewAnalyticsHandler({ projectId: "proj_1" });
            const data = (result as any).data;

            expect(data.cards.totalVisits.changePct).toBe(50);
            expect(data.cards.avgSession.changePct).toBe(-10);
        });
    });

    describe("getTopPagesHandler", () => {
        test("should return 400 if dates are missing", async () => {
            const { getTopPagesHandler } = await import("../../../src/handlers/topPages.handler");

            const result = await getTopPagesHandler({ projectId: "proj_1" }); // Missing dates
            expect((result as any).statusCode).toBe(400);
        });

        test("should return 200 and pages list", async () => {
            const { getTopPagesHandler } = await import("../../../src/handlers/topPages.handler");

            mockGetTopPages.mockResolvedValue([
                { path: "/home", views: 500, avgTimeSeconds: 60 },
            ] as any[]);

            const result = await getTopPagesHandler({
                projectId: "proj_1",
                startDate: "2023-01-01",
                endDate: "2023-01-07",
                limit: "5"
            });

            expect((result as any).statusCode).toBe(200);
            expect((result as any).data.pages).toHaveLength(1);
            expect((result as any).data.pages[0].path).toBe("/home");

            expect(mockGetTopPages).toHaveBeenCalledWith("proj_1", "2023-01-01", "2023-01-07", 5);
        });
    });
});
