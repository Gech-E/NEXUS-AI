import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    let sessions: any[] = [];

    if (role === "FOUNDER") {
      // Find sessions through the founder's startups matched mentors
      const mentorProfile = await prisma.mentorProfile.findMany({
        where: {
          matches: {
            some: {
              startup: { founderId: session.user.id },
              status: "ACCEPTED",
            },
          },
        },
        select: { id: true },
      });

      sessions = await prisma.mentorSession.findMany({
        where: {
          mentorId: { in: mentorProfile.map((mp) => mp.id) },
        },
        include: { mentor: { include: { user: { select: { name: true, image: true } } } } },
        orderBy: { scheduledAt: "asc" },
      });
    } else if (role === "MENTOR") {
      const profile = await prisma.mentorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        sessions = await prisma.mentorSession.findMany({
          where: { mentorId: profile.id },
          include: { mentor: { include: { user: { select: { name: true, image: true } } } } },
          orderBy: { scheduledAt: "asc" },
        });
      }
    } else {
      // Admin can see all sessions
      sessions = await prisma.mentorSession.findMany({
        include: { mentor: { include: { user: { select: { name: true, image: true } } } } },
        orderBy: { scheduledAt: "asc" },
        take: 50,
      });
    }

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
