import { describe, test, expect } from "bun:test";
import { cn } from "../../../lib/utils";

describe("lib/utils (cn utility)", () => {

    test("should merge class names correctly", () => {
        expect(cn("base-class", "extra-class")).toBe("base-class extra-class");
    });

    test("should handle conditional classes", () => {
        expect(cn("base", true && "is-true", false && "is-false")).toBe("base is-true");
    });

    test("should merge Tailwind classes correctly", () => {
        // tailwind-merge logic: last one wins for same property
        expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
    });

    test("should handle array and object inputs", () => {
        expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
    });

    test("should return empty string for no input", () => {
        expect(cn()).toBe("");
    });

});
