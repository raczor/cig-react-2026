import { describe, expect, it } from "vitest";
import { YearlySequenceCodeGenerator } from "../../../server/src/domain/orderCode.js";

describe("YearlySequenceCodeGenerator", () => {
    const in2026 = new YearlySequenceCodeGenerator(() => new Date("2026-06-15T12:00:00Z"));

    it("is OS-<year>-<id padded to three digits>", () => {
        expect(in2026.generate(7)).toBe("OS-2026-007");
        expect(in2026.generate(25)).toBe("OS-2026-025");
    });

    it("grows past three digits instead of truncating", () => {
        expect(in2026.generate(1234)).toBe("OS-2026-1234");
    });

    it("uses the year of the clock it is given", () => {
        expect(new YearlySequenceCodeGenerator(() => new Date("2031-01-02T00:00:00Z")).generate(1)).toBe("OS-2031-001");
    });

    it("defaults to the real clock", () => {
        expect(new YearlySequenceCodeGenerator().generate(1)).toBe(`OS-${new Date().getFullYear()}-001`);
    });
});
