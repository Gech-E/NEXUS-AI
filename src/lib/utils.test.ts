import { describe, it, expect } from "vitest";
import {
  cn, formatDate, formatRelativeTime, getInitials,
  truncate, generateNexusScore, getScoreColor, getScoreLabel,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class strings", () => { expect(cn("px-4", "py-2")).toBe("px-4 py-2"); });
  it("resolves Tailwind conflicts", () => { expect(cn("px-4", "px-8")).toBe("px-8"); });
  it("handles falsy values", () => { expect(cn("base", false, null, undefined, "end")).toBe("base end"); });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const r = formatDate(new Date("2026-01-15"));
    expect(r).toContain("Jan"); expect(r).toContain("15"); expect(r).toContain("2026");
  });
  it("formats an ISO string", () => {
    const r = formatDate("2025-12-25T00:00:00Z");
    expect(r).toContain("Dec"); expect(r).toContain("2025");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for < 60s", () => { expect(formatRelativeTime(new Date())).toBe("just now"); });
  it("returns minutes for < 60m", () => { expect(formatRelativeTime(new Date(Date.now() - 5*60*1000))).toBe("5m ago"); });
  it("returns hours for < 24h", () => { expect(formatRelativeTime(new Date(Date.now() - 3*3600*1000))).toBe("3h ago"); });
  it("returns days for < 7d", () => { expect(formatRelativeTime(new Date(Date.now() - 2*86400*1000))).toBe("2d ago"); });
  it("returns date for >= 7d", () => { expect(formatRelativeTime(new Date(Date.now() - 14*86400*1000))).toMatch(/\w{3} \d{1,2}, \d{4}/); });
});

describe("getInitials", () => {
  it("extracts from full name", () => { expect(getInitials("John Doe")).toBe("JD"); });
  it("handles single name", () => { expect(getInitials("Alice")).toBe("A"); });
  it("caps at 2 initials", () => { expect(getInitials("John Michael Doe")).toBe("JM"); });
});

describe("truncate", () => {
  it("returns full string within limit", () => { expect(truncate("Hello", 10)).toBe("Hello"); });
  it("truncates with ellipsis", () => { expect(truncate("Hello World!", 5)).toBe("Hello..."); });
  it("handles exact boundary", () => { expect(truncate("12345", 5)).toBe("12345"); });
});

describe("generateNexusScore", () => {
  it("weighted average: 80/70/60/50/40 = 62", () => {
    expect(generateNexusScore({ market: 80, uniqueness: 70, execution: 60, viability: 50, teamFit: 40 })).toBe(62);
  });
  it("returns 100 for all perfect", () => {
    expect(generateNexusScore({ market: 100, uniqueness: 100, execution: 100, viability: 100, teamFit: 100 })).toBe(100);
  });
  it("returns 0 for all zero", () => {
    expect(generateNexusScore({ market: 0, uniqueness: 0, execution: 0, viability: 0, teamFit: 0 })).toBe(0);
  });
  it("market weight is highest (0.25)", () => {
    expect(generateNexusScore({ market: 100, uniqueness: 0, execution: 0, viability: 0, teamFit: 0 })).toBe(25);
  });
});

describe("getScoreColor", () => {
  it("emerald for >= 80", () => { expect(getScoreColor(85)).toBe("text-emerald-500"); });
  it("amber for 60-79", () => { expect(getScoreColor(65)).toBe("text-amber-500"); });
  it("orange for 40-59", () => { expect(getScoreColor(45)).toBe("text-orange-500"); });
  it("red for < 40", () => { expect(getScoreColor(20)).toBe("text-red-500"); });
});

describe("getScoreLabel", () => {
  it("Excellent for >= 80", () => { expect(getScoreLabel(90)).toBe("Excellent"); });
  it("Good for 60-79", () => { expect(getScoreLabel(70)).toBe("Good"); });
  it("Fair for 40-59", () => { expect(getScoreLabel(50)).toBe("Fair"); });
  it("Needs Work for < 40", () => { expect(getScoreLabel(30)).toBe("Needs Work"); });
});
