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

    if (role === "FOUNDER") {
      const startups = await prisma.startup.findMany({
        where: { founderId: userId },
        include: {
          evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
          milestones: true,
        },
      });

      const ideasSubmitted = startups.length;

      // Calculate average Nexus Score across all evaluated startups
      const scores = startups
        .map((s) => s.evaluations[0]?.nexusScore)
        .filter((s): s is number => s != null);
      const avgNexusScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      // Active matches
      const activeMatches = await prisma.match.count({
        where: {
          startup: { founderId: userId },
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });

      // Milestones
      const allMilestones = startups.flatMap((s) => s.milestones);
      const completedMilestones = allMilestones.filter(
        (m) => m.status === "COMPLETED"
      ).length;
      const totalMilestones = allMilestones.length;

      // Recent activity from notifications
      const recentNotifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return NextResponse.json({
        role: "FOUNDER",
        stats: {
          ideasSubmitted,
          avgNexusScore,
          activeMatches,
          completedMilestones,
          totalMilestones,
        },
        recentActivity: recentNotifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
        })),
      });
    }

    if (role === "MENTOR") {
      const profile = await prisma.mentorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return NextResponse.json({
          role: "MENTOR",
          stats: {
            activeMentees: 0,
            sessionsThisMonth: 0,
            avgRating: 0,
            totalSessions: 0,
          },
          upcomingSessions: [],
        });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const sessionsThisMonth = await prisma.mentorSession.count({
        where: {
          mentorId: profile.id,
          scheduledAt: { gte: startOfMonth },
        },
      });

      const upcomingSessions = await prisma.mentorSession.findMany({
        where: {
          mentorId: profile.id,
          scheduledAt: { gte: now },
          status: "SCHEDULED",
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      });

      return NextResponse.json({
        role: "MENTOR",
        stats: {
          activeMentees: profile.currentMentees,
          sessionsThisMonth,
          avgRating: profile.rating,
          totalSessions: profile.totalSessions,
        },
        upcomingSessions: upcomingSessions.map((s) => ({
          id: s.id,
          title: s.title,
          scheduledAt: s.scheduledAt,
          duration: s.duration,
        })),
      });
    }

    if (role === "INVESTOR") {
      const investorProfile = await prisma.investorProfile.findUnique({
        where: { userId },
        include: { watchlists: true },
      });

      const dealFlowCount = await prisma.startup.count({
        where: { isPublic: true },
      });

      const watchlistCount = investorProfile?.watchlists?.length || 0;

      // Avg nexus score of watchlisted startups
      const watchlistedStartups = investorProfile
        ? await prisma.startup.findMany({
            where: {
              id: {
                in: investorProfile.watchlists.map((w) => w.startupId),
              },
            },
            include: {
              evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          })
        : [];

      const watchlistScores = watchlistedStartups
        .map((s) => s.evaluations[0]?.nexusScore)
        .filter((s): s is number => s != null);
      const avgScore =
        watchlistScores.length > 0
          ? Math.round(
              watchlistScores.reduce((a, b) => a + b, 0) /
                watchlistScores.length
            )
          : 0;

      // Intro requests (matches of type investor-startup)
      const introRequests = await prisma.match.count({
        where: {
          startup: {
            id: {
              in:
                investorProfile?.watchlists.map((w) => w.startupId) || [],
            },
          },
          type: "investor-startup",
        },
      });

      // Top startups by nexus score
      const topStartups = await prisma.startup.findMany({
        where: { isPublic: true },
        include: {
          evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
          founder: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return NextResponse.json({
        role: "INVESTOR",
        stats: {
          dealFlow: dealFlowCount,
          watchlist: watchlistCount,
          avgNexusScore: avgScore,
          introRequests,
        },
        topStartups: topStartups.map((s) => ({
          id: s.id,
          name: s.name,
          nexusScore: s.evaluations[0]?.nexusScore || 0,
          stage: s.stage,
          industry: s.industry,
        })),
      });
    }

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      const totalUsers = await prisma.user.count();
      const activeStartups = await prisma.startup.count();
      const totalEvaluations = await prisma.ideaEvaluation.count();
      const platformHealth = 99.9;

      const recentNotifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Recent user registrations count (today)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const newUsersToday = await prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      });

      // Today's evaluations
      const evalToday = await prisma.ideaEvaluation.count({
        where: { createdAt: { gte: todayStart } },
      });

      return NextResponse.json({
        role: "ADMIN",
        stats: {
          totalUsers,
          activeStartups,
          totalEvaluations,
          platformHealth,
        },
        recentActivity: [
          ...(newUsersToday > 0
            ? [
                {
                  type: "SYSTEM",
                  title: `${newUsersToday} new user${newUsersToday > 1 ? "s" : ""} registered today`,
                  createdAt: new Date(),
                },
              ]
            : []),
          ...(evalToday > 0
            ? [
                {
                  type: "EVALUATION",
                  title: `${evalToday} AI evaluation${evalToday > 1 ? "s" : ""} processed today`,
                  createdAt: new Date(),
                },
              ]
            : []),
          ...recentNotifications.map((n) => ({
            type: n.type,
            title: n.title,
            createdAt: n.createdAt,
          })),
        ].slice(0, 5),
      });
    }

    return NextResponse.json({ error: "Unknown role" }, { status: 400 });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
