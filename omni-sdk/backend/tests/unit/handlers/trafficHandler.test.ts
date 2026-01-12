import { describe, test, expect, mock, beforeEach } from "bun:test";

// Mock DB client
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// Mock repository
const mockGetTrafficAnalytics = mock(() => Promise.resolve({
    range: { start: "2023-01-01", end: "2023-01-07" },
    comparison: { start: "2022-12-25", end: "2022-12-31" },
    activeUsersCurrent: 100,
    activeUsersPrevious: 50,
    avgSessionTimeCurrent: 120,
    avgSessionTimePrevious: 60,
    totalClicksCurrent: 200,
    totalClicksPrevious: 100,
    visitorGrowth: [],
    countries: [],
} as any));

const mockGetDeviceDistribution = mock(() => Promise.resolve([] as any[]));

mock.module("../../../src/repositories", () => ({
    trafficAnalyticsRepository: {
        getTrafficAnalytics: mockGetTrafficAnalytics,
        getDeviceDistribution: mockGetDeviceDistribution,
    },
    // Mock everything else to avoid missing export errors
    sessionRepository: {},
    rrwebRepository: {},
    heatmapRepository: {},
    eventRepository: {},
    userRepository: {},
    overviewAnalyticsRepository: {},
    topPagesRepository: {},
    retentionRepository: {},
}));

describe("Traffic Analytics Handler", () => {
    beforeEach(() => {
        mockGetTrafficAnalytics.mockClear();
        mockGetDeviceDistribution.mockClear();
    });

    test("should return 400 if validation fails", async () => {
        // Dynamic import
        const { getTrafficAnalyticsHandler } = await import("../../../src/handlers/traffic.handler");

        const result = await getTrafficAnalyticsHandler({
            projectId: "", // Invalid: empty string
            startDate: "invalid-date",
            endDate: "2023-01-01",
        });

        expect((result as any).statusCode).toBe(400);
        expect((result as any).error).toBe("Validation failed");
        expect((result as any).details).toBeDefined();
    });

    test("should return 200 and formatted metrics if success", async () => {
        const { getTrafficAnalyticsHandler } = await import("../../../src/handlers/traffic.handler");

        // Setup mock return
        mockGetTrafficAnalytics.mockResolvedValue({
            range: { start: "2023-01-01", end: "2023-01-07" },
            comparison: { start: "2022-12-25", end: "2022-12-31" },
            activeUsersCurrent: 100,
            activeUsersPrevious: 50,
            avgSessionTimeCurrent: 120,
            avgSessionTimePrevious: 60,
            totalClicksCurrent: 200,
            totalClicksPrevious: 100,
            visitorGrowth: [],
            countries: [],
        });

        mockGetDeviceDistribution.mockResolvedValue([
            { device: "desktop", sessions: 10, percentage: 100 }
        ]);

        const result = await getTrafficAnalyticsHandler({
            projectId: "proj_1",
            startDate: "2023-01-01",
            endDate: "2023-01-07",
        });

        expect((result as any).statusCode).toBe(200);
        const data = (result as any).data;

        // Check calculated percentages
        // 50 -> 100 is +100%
        expect(data.cards.activeUsers.changePct).toBe(100);
        expect(data.cards.activeUsers.current).toBe(100);
        expect(data.cards.activeUsers.previous).toBe(50);

        // 60 -> 120 is +100%
        expect(data.cards.avgSessionTime.changePct).toBe(100);

        // 100 -> 200 is +100%
        expect(data.cards.totalClicks.changePct).toBe(100);
    });

    test("should calculate percentages correctly for decrease", async () => {
        const { getTrafficAnalyticsHandler } = await import("../../../src/handlers/traffic.handler");

        mockGetTrafficAnalytics.mockResolvedValue({
            range: { start: "2023-01-01", end: "2023-01-07" },
            comparison: { start: "2022-12-25", end: "2022-12-31" },
            activeUsersCurrent: 50,
            activeUsersPrevious: 100, // Decrease
            avgSessionTimeCurrent: 0,
            avgSessionTimePrevious: 0,
            totalClicksCurrent: 0,
            totalClicksPrevious: 0,
            visitorGrowth: [],
            countries: [],
        });

        const result = await getTrafficAnalyticsHandler({
            projectId: "proj_1",
            startDate: "2023-01-01",
            endDate: "2023-01-07",
        });

        const data = (result as any).data;
        // 100 -> 50 is -50%
        expect(data.cards.activeUsers.changePct).toBe(-50);
    });

    test("should handle zero previous value (avoid div by zero)", async () => {
        const { getTrafficAnalyticsHandler } = await import("../../../src/handlers/traffic.handler");

        mockGetTrafficAnalytics.mockResolvedValue({
            range: { start: "2023-01-01", end: "2023-01-07" },
            comparison: { start: "2022-12-25", end: "2022-12-31" },
            activeUsersCurrent: 10,
            activeUsersPrevious: 0, // Zero previous
            avgSessionTimeCurrent: 0,
            avgSessionTimePrevious: 0,
            totalClicksCurrent: 0,
            totalClicksPrevious: 0,
            visitorGrowth: [],
            countries: [],
        });

        const result = await getTrafficAnalyticsHandler({
            projectId: "proj_1",
            startDate: "2023-01-01",
            endDate: "2023-01-07",
        });

        const data = (result as any).data;
        // 0 -> 10 is treated os 100% increase in the handler logic
        expect(data.cards.activeUsers.changePct).toBe(100);
    });
});
