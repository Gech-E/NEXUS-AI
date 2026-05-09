import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const role = (session.user as any).role;

    let matches: any[] = [];

    if (role === "FOUNDER") {
      // Find matches for the founder's startups
      const startups = await prisma.startup.findMany({
        where: { founderId: userId },
        select: { id: true },
      });
      const startupIds = startups.map((s) => s.id);

      matches = await prisma.match.findMany({
        where: { startupId: { in: startupIds } },
        include: {
          mentor: {
            include: {
              user: {
                select: { name: true, image: true },
              },
            },
          },
          startup: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "MENTOR") {
      const profile = await prisma.mentorProfile.findUnique({
        where: { userId },
      });

      if (profile) {
        matches = await prisma.match.findMany({
          where: { mentorId: profile.id },
          include: {
            startup: {
              include: {
                founder: {
                  select: { name: true, image: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } else if (role === "INVESTOR") {
      // For investors, show investor-startup type matches
      const startups = await prisma.startup.findMany({
        where: { isPublic: true },
        select: { id: true },
      });

      matches = await prisma.match.findMany({
        where: {
          type: "investor-startup",
          startupId: { in: startups.map((s) => s.id) },
        },
        include: {
          startup: {
            include: {
              founder: {
                select: { name: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Admin: show all matches
      matches = await prisma.match.findMany({
        include: {
          mentor: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
          startup: {
            include: {
              founder: { select: { name: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }

    const formattedMatches = matches.map((m) => ({
      id: m.id,
      type: m.type,
      status: m.status,
      compatibilityScore: m.compatibilityScore,
      aiExplanation: m.aiExplanation,
      createdAt: m.createdAt,
      name:
        m.type === "mentor-founder"
          ? m.mentor?.user?.name || m.startup?.founder?.name || "Unknown"
          : m.startup?.name || "Unknown",
      subtitle:
        m.type === "mentor-founder"
          ? m.mentor?.headline || m.mentor?.user?.name || ""
          : `${m.startup?.stage || ""} · ${m.startup?.industry || ""}`,
    }));

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error("Matches API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matchId, action } = await req.json();

    if (!matchId || !["ACCEPTED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: action,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Match update error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
