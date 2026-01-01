import { describe, test, expect } from "bun:test";
import {
    formatDateISO,
    formatDateDisplay,
    parseISO,
    formatDateRangeDisplay,
    isValidDateRange
} from "../../../utils/dateFormatter";

describe("dateFormatter Utility", () => {

    test("formatDateISO should format date object correctly", () => {
        const date = new Date("2023-12-25T10:00:00");
        expect(formatDateISO(date)).toBe("2023-12-25");
    });

    test("formatDateISO should handle ISO string input", () => {
        expect(formatDateISO("2023-12-25")).toBe("2023-12-25");
    });

    test("formatDateDisplay should format for user display", () => {
        const date = new Date("2024-01-24");
        expect(formatDateDisplay(date)).toBe("Jan 24, 2024");
    });

    test("parseISO should return valid Date object for valid string", () => {
        const result = parseISO("2023-05-15");
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4); // May is 4
    });

    test("formatDateRangeDisplay should group by month if dates are in same month", () => {
        const result = formatDateRangeDisplay("2024-01-01", "2024-01-15");
        expect(result).toBe("Jan 1 - 15, 2024");
    });

    test("formatDateRangeDisplay should show full dates if dates are in different months", () => {
        const result = formatDateRangeDisplay("2024-01-25", "2024-02-05");
        expect(result).toBe("Jan 25, 2024 - Feb 5, 2024");
    });

    test("isValidDateRange should validate correctly", () => {
        expect(isValidDateRange("2024-01-01", "2024-01-10")).toBe(true);
        expect(isValidDateRange("2024-01-10", "2024-01-01")).toBe(false);
    });

});
