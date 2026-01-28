import { describe, test, expect } from "bun:test";
import {
    hslToRgb,
    intensityToColor
} from "../../../omni-sdk/frontend-visualize/src/utils/heatmapRenderer";

describe("heatmapRenderer Utility (Logic)", () => {

    describe("hslToRgb", () => {
        test("should convert white (lightness 100) correctly", () => {
            const [r, g, b] = hslToRgb(0, 0, 100);
            expect(r).toBe(255);
            expect(g).toBe(255);
            expect(b).toBe(255);
        });

        test("should convert black (lightness 0) correctly", () => {
            const [r, g, b] = hslToRgb(0, 0, 0);
            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(0);
        });

        test("should convert red (hue 0, 100, 50) correctly", () => {
            const [r, g, b] = hslToRgb(0, 100, 50);
            expect(r).toBe(255);
            expect(g).toBe(0);
            expect(b).toBe(0);
        });

        test("should convert green (hue 120, 100, 50) correctly", () => {
            const [r, g, b] = hslToRgb(120, 100, 50);
            expect(r).toBe(0);
            expect(g).toBe(255);
            expect(b).toBe(0);
        });

        test("should convert blue (hue 240, 100, 50) correctly", () => {
            const [r, g, b] = hslToRgb(240, 100, 50);
            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(255);
        });
    });

    describe("intensityToColor", () => {
        test("should return blue for 0 intensity", () => {
            const result = intensityToColor(0);
            expect(result).toBe("rgb(0, 0, 255)");
        });

        test("should return red for 1 intensity", () => {
            const result = intensityToColor(1);
            expect(result).toBe("rgb(255, 0, 0)");
        });

        test("should clamp intensity values", () => {
            expect(intensityToColor(-1)).toBe("rgb(0, 0, 255)");
            expect(intensityToColor(2)).toBe("rgb(255, 0, 0)");
        });

        test("should return middle color (greenish) for 0.5 intensity", () => {
            const result = intensityToColor(0.5);
            // Hue 120 (240 * 0.5) is green
            expect(result).toBe("rgb(0, 255, 0)");
        });
    });

});
