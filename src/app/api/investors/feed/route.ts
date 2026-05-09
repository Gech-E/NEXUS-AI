import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const startups = await prisma.startup.findMany({
      where: {
        isPublic: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { industry: { contains: search, mode: "insensitive" } },
                { tagline: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        evaluations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { nexusScore: true },
        },
        founder: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const deals = startups.map((s) => ({
      id: s.id,
      name: s.name,
      tagline: s.tagline || "",
      industry: s.industry,
      stage: s.stage,
      nexusScore: s.evaluations[0]?.nexusScore || 0,
      fundingSeeking: s.fundingSeeking || 0,
      teamSize: s.teamSize,
      founder: s.founder.name || "Unknown",
    }));

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Investors feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal flow" },
      { status: 500 }
    );
  }
}
