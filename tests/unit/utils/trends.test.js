import { describe, test, expect } from "bun:test";
import { getTrend, getTrendColors } from "../../../utils/formatters";

describe("Trend Utility Logic", () => {

    test("getTrend should identify positive, negative and neutral trends", () => {
        expect(getTrend(10)).toBe("up");
        expect(getTrend(-10)).toBe("down");
        expect(getTrend(0)).toBe("neutral");
    });

    test("getTrendColors should return correct color objects for each trend", () => {
        const upColors = getTrendColors("up");
        expect(upColors.text).toContain("green");

        const downColors = getTrendColors("down");
        expect(downColors.text).toContain("red");

        const neutralColors = getTrendColors("neutral");
        expect(neutralColors.text).toContain("slate");
    });

    test("getTrendColors should fallback to neutral for unknown trends", () => {
        const fallback = getTrendColors("something-else");
        expect(fallback.text).toContain("slate");
    });

    test("getTrend with inverted=true should flip up/down", () => {
        // For bounce rate, lower is better (up trend)
        expect(getTrend(-5, true)).toBe("up");
        expect(getTrend(5, true)).toBe("down");
    });

});
