import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the module under test
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    startup: { findMany: vi.fn() },
    chatMessage: { findFirst: vi.fn() },
    mentorProfile: { findMany: vi.fn() },
    mentorSession: { findMany: vi.fn() },
  },
}));

import { calculateDropoutRisk } from "@/lib/risk-engine";
import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma, true);

beforeEach(() => { vi.clearAllMocks(); });

function setupMocks(overrides: {
  lastLoginDaysAgo?: number; milestones?: { status: string }[];
  lastChatDaysAgo?: number | null; sessions?: { status: string }[];
} = {}) {
  const now = new Date();
  const { lastLoginDaysAgo = 1, milestones = [], lastChatDaysAgo = 1, sessions = [] } = overrides;

  mockedPrisma.user.findUnique.mockResolvedValue({
    lastLoginAt: new Date(now.getTime() - (lastLoginDaysAgo) * 86400000),
    createdAt: new Date("2026-01-01"),
  } as any);

  mockedPrisma.startup.findMany.mockResolvedValue([
    { milestones } as any,
  ]);

  if (lastChatDaysAgo === null) {
    mockedPrisma.chatMessage.findFirst.mockResolvedValue(null);
  } else {
    mockedPrisma.chatMessage.findFirst.mockResolvedValue({
      createdAt: new Date(now.getTime() - lastChatDaysAgo * 86400000),
    } as any);
  }

  mockedPrisma.mentorProfile.findMany.mockResolvedValue(
    sessions.length > 0 ? [{ id: "mentor1" } as any] : []
  );
  mockedPrisma.mentorSession.findMany.mockResolvedValue(
    sessions.map(s => s as any)
  );
}

describe("calculateDropoutRisk", () => {
  it("returns LOW risk for active founder", async () => {
    setupMocks({
      lastLoginDaysAgo: 0,
      milestones: [{ status: "COMPLETED" }, { status: "COMPLETED" }, { status: "IN_PROGRESS" }],
      lastChatDaysAgo: 1,
      sessions: [{ status: "COMPLETED" }, { status: "COMPLETED" }],
    });
    const result = await calculateDropoutRisk("user1");
    expect(result.riskLevel).toBe("LOW");
    expect(result.riskScore).toBeLessThan(25);
  });

  it("returns CRITICAL risk for disengaged founder", async () => {
    setupMocks({
      lastLoginDaysAgo: 45,
      milestones: [{ status: "OVERDUE" }, { status: "OVERDUE" }, { status: "OVERDUE" }, { status: "OVERDUE" }],
      lastChatDaysAgo: null,
      sessions: [{ status: "NO_SHOW" }, { status: "NO_SHOW" }],
    });
    const result = await calculateDropoutRisk("user2");
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.riskScore).toBeGreaterThanOrEqual(75);
  });

  it("returns MEDIUM/HIGH for partially engaged founder", async () => {
    setupMocks({
      lastLoginDaysAgo: 10,
      milestones: [{ status: "COMPLETED" }, { status: "OVERDUE" }],
      lastChatDaysAgo: 10,
      sessions: [],
    });
    const result = await calculateDropoutRisk("user3");
    expect(["MEDIUM", "HIGH"]).toContain(result.riskLevel);
    expect(result.riskScore).toBeGreaterThanOrEqual(25);
    expect(result.riskScore).toBeLessThan(75);
  });

  it("has correct risk factor weights summing to 1.0", async () => {
    setupMocks();
    const result = await calculateDropoutRisk("user4");
    const totalWeight = Object.values(result.factors).reduce((sum, f) => sum + f.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0);
  });

  it("includes descriptive detail strings for each factor", async () => {
    setupMocks({ milestones: [], lastChatDaysAgo: null });
    const result = await calculateDropoutRisk("user5");
    for (const factor of Object.values(result.factors)) {
      expect(typeof factor.detail).toBe("string");
      expect(factor.detail.length).toBeGreaterThan(0);
    }
  });

  it("handles user with no milestones", async () => {
    setupMocks({ milestones: [] });
    const result = await calculateDropoutRisk("user6");
    expect(result.factors.milestoneCompletion.score).toBe(60);
    expect(result.factors.milestoneCompletion.detail).toContain("No milestones");
  });

  it("handles user with no chat history", async () => {
    setupMocks({ lastChatDaysAgo: null });
    const result = await calculateDropoutRisk("user7");
    expect(result.factors.chatbotEngagement.score).toBe(80);
  });

  it("score is always between 0 and 100", async () => {
    setupMocks();
    const result = await calculateDropoutRisk("user8");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});
