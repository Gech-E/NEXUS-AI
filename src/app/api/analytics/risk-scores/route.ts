import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDropoutRisk } from "@/lib/risk-engine";

// GET — retrieve all founder risk scores (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const riskScores = await prisma.founderRiskScore.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, lastLoginAt: true, createdAt: true },
        },
      },
      orderBy: { riskScore: "desc" },
    });

    // Also get founder count for stats
    const totalFounders = await prisma.user.count({ where: { role: "FOUNDER" } });
    const scoredFounders = riskScores.length;

    const distribution = {
      low: riskScores.filter(r => r.riskLevel === "LOW").length,
      medium: riskScores.filter(r => r.riskLevel === "MEDIUM").length,
      high: riskScores.filter(r => r.riskLevel === "HIGH").length,
      critical: riskScores.filter(r => r.riskLevel === "CRITICAL").length,
    };

    return NextResponse.json({
      riskScores,
      stats: { totalFounders, scoredFounders, distribution },
    });
  } catch (error) {
    console.error("Risk scores GET error:", error);
    return NextResponse.json({ error: "Failed to fetch risk scores" }, { status: 500 });
  }
}

// POST — recalculate risk scores for all founders (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all founders
    const founders = await prisma.user.findMany({
      where: { role: "FOUNDER" },
      select: { id: true },
    });

    let calculated = 0;

    for (const founder of founders) {
      try {
        const result = await calculateDropoutRisk(founder.id);

        await prisma.founderRiskScore.upsert({
          where: { userId: founder.id },
          update: {
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            factors: result.factors as any,
            lastCalculatedAt: new Date(),
          },
          create: {
            userId: founder.id,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            factors: result.factors as any,
          },
        });
        calculated++;
      } catch (e) {
        console.error(`Risk calc failed for ${founder.id}:`, e);
      }
    }

    return NextResponse.json({
      message: `Risk scores calculated for ${calculated}/${founders.length} founders`,
      calculated,
      total: founders.length,
    });
  } catch (error) {
    console.error("Risk scores POST error:", error);
    return NextResponse.json({ error: "Failed to calculate risk scores" }, { status: 500 });
  }
}
