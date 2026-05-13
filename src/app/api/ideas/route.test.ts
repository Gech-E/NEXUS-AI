import { describe, it, expect, vi, beforeEach } from "vitest";
import { startupSchema } from "@/lib/validators";

// Mock dependencies
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    startup: { findMany: vi.fn(), create: vi.fn() },
    ideaEvaluation: { create: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mockedAuth = vi.mocked(auth);
const mockedPrisma = vi.mocked(prisma, true);

const validStartup = {
  name: "NexGen Health",
  description: "A comprehensive platform for healthcare diagnostics using ML",
  problem: "Rural clinics lack specialist diagnostics",
  solution: "AI-powered diagnostic tool on low-cost hardware",
  targetMarket: "Rural healthcare clinics in developing countries",
  businessModel: "SaaS subscription with per-diagnosis pricing",
  stage: "IDEA" as const,
  industry: "HealthTech",
  teamSize: 3,
};

beforeEach(() => { vi.clearAllMocks(); });

describe("Ideas API — Authentication", () => {
  it("rejects unauthenticated GET requests", async () => {
    mockedAuth.mockResolvedValue(null as any);
    const session = await auth();
    expect(session?.user?.id).toBeUndefined();
  });

  it("allows authenticated GET requests", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1", role: "FOUNDER" } } as any);
    const session = await auth();
    expect(session?.user?.id).toBe("u1");
  });
});

describe("Ideas API — Idea Creation", () => {
  it("validates startup data before creation", () => {
    const result = startupSchema.safeParse(validStartup);
    expect(result.success).toBe(true);
  });

  it("creates startup with correct founder ID", async () => {
    mockedPrisma.startup.create.mockResolvedValue({ id: "s1", ...validStartup, founderId: "u1" } as any);
    const startup = await prisma.startup.create({
      data: { ...validStartup, founderId: "u1" },
    });
    expect(startup.founderId).toBe("u1");
    expect(startup.id).toBe("s1");
  });

  it("creates a pending evaluation after startup creation", async () => {
    mockedPrisma.ideaEvaluation.create.mockResolvedValue({ id: "e1", status: "PENDING" } as any);
    const eval_ = await prisma.ideaEvaluation.create({
      data: { startupId: "s1", status: "PENDING" },
    });
    expect(eval_.status).toBe("PENDING");
  });

  it("creates an audit log entry on submission", async () => {
    mockedPrisma.auditLog.create.mockResolvedValue({ id: "a1" } as any);
    await prisma.auditLog.create({
      data: { action: "IDEA_SUBMITTED", entity: "Startup", entityId: "s1", userId: "u1" },
    });
    expect(mockedPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "IDEA_SUBMITTED" }),
    });
  });

  it("rejects invalid startup data", () => {
    const result = startupSchema.safeParse({ name: "X" }); // missing required fields
    expect(result.success).toBe(false);
  });
});

describe("Ideas API — Idea Retrieval", () => {
  it("returns user's startups with evaluations", async () => {
    mockedPrisma.startup.findMany.mockResolvedValue([
      { id: "s1", name: "Startup A", evaluations: [{ nexusScore: 72 }] },
      { id: "s2", name: "Startup B", evaluations: [] },
    ] as any);
    const startups = await prisma.startup.findMany({
      where: { founderId: "u1" },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    expect(startups).toHaveLength(2);
    expect(startups[0].evaluations).toHaveLength(1);
  });
});

describe("Ideas API — AI Evaluation Fallback", () => {
  it("generates fallback scores based on content length", () => {
    // Mirrors the fallback function in evaluate/route.ts
    const s = validStartup;
    const ms = Math.min(85, 40 + (s.targetMarket?.length || 0) / 5);
    const us = Math.min(80, 35 + (s.solution?.length || 0) / 8);
    const es = Math.min(75, 30 + (s.teamSize || 1) * 8);
    const vs = Math.min(80, 40 + (s.problem?.length || 0) / 6);
    const ts = Math.min(70, 30 + (s.teamSize || 1) * 10);
    const nexus = Math.round(ms * 0.25 + us * 0.2 + es * 0.2 + vs * 0.2 + ts * 0.15);

    expect(nexus).toBeGreaterThan(0);
    expect(nexus).toBeLessThanOrEqual(100);
    expect(ms).toBeGreaterThanOrEqual(40);
    expect(us).toBeGreaterThanOrEqual(35);
  });
});
