import { describe, test, expect, mock, beforeEach } from "bun:test";

// Mock DB client
mock.module("../../../src/db/client", () => ({
    db: {},
}));

// Mock repository
const mockGetRetentionCohorts = mock(() => Promise.resolve([] as any[]));

mock.module("../../../src/repositories", () => ({
    retentionRepository: {
        getRetentionCohorts: mockGetRetentionCohorts,
    },
    // Mock everything else to avoid missing export errors
    sessionRepository: {},
    rrwebRepository: {},
    heatmapRepository: {},
    eventRepository: {},
    userRepository: {},
    trafficAnalyticsRepository: {},
    overviewAnalyticsRepository: {},
    topPagesRepository: {},
}));

describe("Retention Handler", () => {
    beforeEach(() => {
        mockGetRetentionCohorts.mockClear();
    });

    test("should return 400 if validation fails", async () => {
        const { getRetentionHandler } = await import("../../../src/handlers/retention.handler");

        const result = await getRetentionHandler({
            projectId: "", // Invalid
            startDate: "invalid",
        });

        expect((result as any).statusCode).toBe(400);
        expect((result as any).error).toBe("Validation failed");
    });

    test("should calculate retention percentages correctly", async () => {
        const { getRetentionHandler } = await import("../../../src/handlers/retention.handler");

        // Mock data: 
        // Cohort 2023-01-01: 100 users. Day 1: 50 returned. Day 7: 25 returned.
        mockGetRetentionCohorts.mockResolvedValue([
            {
                date: "2023-01-01",
                size: 100,
                retention: { 1: 50, 7: 25 },
            },
        ] as any[]);

        const result = await getRetentionHandler({
            projectId: "proj_1",
            startDate: "2023-01-01",
            endDate: "2023-01-30",
            intervals: "0,1,7",
        });

        expect((result as any).statusCode).toBe(200);
        const cohorts = (result as any).data.cohorts;

        expect(cohorts).toHaveLength(1);
        const c1 = cohorts[0];

        expect(c1.size).toBe(100);
        // Day 0 should be 1.0 (100%)
        expect(c1.retention[0]).toBe(1.0);
        // Day 1: 50/100 = 0.5
        expect(c1.retention[1]).toBe(0.5);
        // Day 7: 25/100 = 0.25
        expect(c1.retention[7]).toBe(0.25);
    });

    test("should handle empty cohorts (division by zero)", async () => {
        const { getRetentionHandler } = await import("../../../src/handlers/retention.handler");

        mockGetRetentionCohorts.mockResolvedValue([
            {
                date: "2023-01-02",
                size: 0,
                retention: {},
            },
        ] as any[]);

        const result = await getRetentionHandler({
            projectId: "proj_1",
            startDate: "2023-01-01",
            endDate: "2023-01-30",
        });

        const c1 = (result as any).data.cohorts[0];
        expect(c1.size).toBe(0);
        expect(c1.retention[0]).toBe(0); // Should be 0, not NaN or Infinity
        expect(c1.retention[1]).toBe(0);
    });
});
