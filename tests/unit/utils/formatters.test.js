import { describe, test, expect } from "bun:test";
import {
    formatNumberCompact,
    formatPercentage,
    formatDurationSeconds,
    formatDurationMs,
    truncateClientId,
    getTrend
} from "../../../utils/formatters";

describe("formatters Utility", () => {

    test("formatNumberCompact should format large numbers", () => {
        expect(formatNumberCompact(1500)).toBe("1.5K");
        expect(formatNumberCompact(2500000)).toBe("2.5M");
        expect(formatNumberCompact(0)).toBe("0");
        expect(formatNumberCompact(null)).toBe("—");
    });

    test("formatPercentage should add sign and handle decimals", () => {
        expect(formatPercentage(15.5)).toBe("+15.5%");
        expect(formatPercentage(-5)).toBe("-5.0%");
        expect(formatPercentage(0)).toBe("0.0%");
        expect(formatPercentage(null)).toBe("—");
    });

    test("formatDurationSeconds should format seconds to m s", () => {
        expect(formatDurationSeconds(45)).toBe("45s");
        expect(formatDurationSeconds(125)).toBe("2m 5s");
        expect(formatDurationSeconds(0)).toBe("0s");
    });

    test("formatDurationMs should format milliseconds correctly", () => {
        expect(formatDurationMs(45000)).toBe("45s");
        expect(formatDurationMs(90000)).toBe("1m 30s");
    });

    test("truncateClientId should truncate UUIDs correctly", () => {
        const guid = "12345678-abcd-1234-abcd-123456789012";
        expect(truncateClientId(guid)).toBe("12345678...012");
    });

    test("truncateClientId should return original if short", () => {
        expect(truncateClientId("abc-123")).toBe("abc-123");
    });

    test("getTrend should return correct direction", () => {
        expect(getTrend(15)).toBe("up");
        expect(getTrend(-5)).toBe("down");
        expect(getTrend(0)).toBe("neutral");
    });

    test("getTrend should handle inverted logic", () => {
        // For bounce rate, negative change is "up" (good)
        expect(getTrend(-5, true)).toBe("up");
        expect(getTrend(5, true)).toBe("down");
    });

});
