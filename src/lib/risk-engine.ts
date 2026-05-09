import { prisma } from "@/lib/prisma";

interface RiskFactors {
  milestoneCompletion: { score: number; weight: number; detail: string };
  chatbotEngagement: { score: number; weight: number; detail: string };
  overdueMilestones: { score: number; weight: number; detail: string };
  sessionAttendance: { score: number; weight: number; detail: string };
  loginRecency: { score: number; weight: number; detail: string };
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactors;
}

/**
 * Calculate dropout risk for a founder.
 * Returns a score 0–100 where higher = more at risk.
 */
export async function calculateDropoutRisk(userId: string): Promise<RiskResult> {
  const now = new Date();

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLoginAt: true, createdAt: true },
  });

  // Get startups and milestones
  const startups = await prisma.startup.findMany({
    where: { founderId: userId },
    include: { milestones: true },
  });

  const allMilestones = startups.flatMap(s => s.milestones);
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.status === "COMPLETED").length;
  const overdueMilestones = allMilestones.filter(m => m.status === "OVERDUE").length;

  // Get chatbot interactions
  const lastChat = await prisma.chatMessage.findFirst({
    where: { userId, role: "user" },
    orderBy: { createdAt: "desc" },
  });

  // Get session attendance (through matched mentors)
  const mentorProfiles = await prisma.mentorProfile.findMany({
    where: {
      matches: {
        some: {
          startup: { founderId: userId },
          status: "ACCEPTED",
        },
      },
    },
    select: { id: true },
  });

  const mentorIds = mentorProfiles.map(p => p.id);
  const sessions = mentorIds.length > 0
    ? await prisma.mentorSession.findMany({
        where: { mentorId: { in: mentorIds } },
        select: { status: true },
      })
    : [];

  const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;
  const noShowSessions = sessions.filter(s => s.status === "NO_SHOW").length;
  const totalSessions = sessions.length;

  // ─── Factor 1: Milestone Completion (30% weight) ───
  let milestoneScore: number;
  let milestoneDetail: string;
  if (totalMilestones === 0) {
    milestoneScore = 60; // No milestones = moderate risk
    milestoneDetail = "No milestones created yet";
  } else {
    const completionRate = completedMilestones / totalMilestones;
    milestoneScore = Math.round((1 - completionRate) * 100);
    milestoneDetail = `${completedMilestones}/${totalMilestones} milestones completed (${Math.round(completionRate * 100)}%)`;
  }

  // ─── Factor 2: Chatbot Engagement (25% weight) ───
  let chatScore: number;
  let chatDetail: string;
  if (!lastChat) {
    chatScore = 80; // Never used chatbot
    chatDetail = "No chatbot interactions recorded";
  } else {
    const daysSinceChat = Math.floor((now.getTime() - lastChat.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceChat <= 3) {
      chatScore = 10;
      chatDetail = `Last interaction ${daysSinceChat} day(s) ago`;
    } else if (daysSinceChat <= 7) {
      chatScore = 30;
      chatDetail = `Last interaction ${daysSinceChat} days ago`;
    } else if (daysSinceChat <= 14) {
      chatScore = 55;
      chatDetail = `Last interaction ${daysSinceChat} days ago`;
    } else if (daysSinceChat <= 30) {
      chatScore = 75;
      chatDetail = `Last interaction ${daysSinceChat} days ago — declining engagement`;
    } else {
      chatScore = 95;
      chatDetail = `Last interaction ${daysSinceChat} days ago — disengaged`;
    }
  }

  // ─── Factor 3: Overdue Milestones (20% weight) ───
  let overdueScore: number;
  let overdueDetail: string;
  if (totalMilestones === 0) {
    overdueScore = 40;
    overdueDetail = "No milestones to evaluate";
  } else if (overdueMilestones === 0) {
    overdueScore = 0;
    overdueDetail = "No overdue milestones";
  } else if (overdueMilestones <= 2) {
    overdueScore = 50;
    overdueDetail = `${overdueMilestones} overdue milestone(s)`;
  } else {
    overdueScore = Math.min(100, overdueMilestones * 25);
    overdueDetail = `${overdueMilestones} overdue milestones — critical`;
  }

  // ─── Factor 4: Session Attendance (15% weight) ───
  let sessionScore: number;
  let sessionDetail: string;
  if (totalSessions === 0) {
    sessionScore = 50;
    sessionDetail = "No mentor sessions scheduled";
  } else {
    const attendanceRate = completedSessions / totalSessions;
    const noShowRate = noShowSessions / totalSessions;
    sessionScore = Math.round(noShowRate * 100 + (1 - attendanceRate) * 20);
    sessionScore = Math.min(100, sessionScore);
    sessionDetail = `${completedSessions}/${totalSessions} sessions attended, ${noShowSessions} no-shows`;
  }

  // ─── Factor 5: Login Recency (10% weight) ───
  let loginScore: number;
  let loginDetail: string;
  const lastLogin = user?.lastLoginAt || user?.createdAt;
  if (!lastLogin) {
    loginScore = 90;
    loginDetail = "No login data available";
  } else {
    const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLogin <= 2) {
      loginScore = 5;
      loginDetail = `Last login ${daysSinceLogin} day(s) ago`;
    } else if (daysSinceLogin <= 7) {
      loginScore = 25;
      loginDetail = `Last login ${daysSinceLogin} days ago`;
    } else if (daysSinceLogin <= 14) {
      loginScore = 55;
      loginDetail = `Last login ${daysSinceLogin} days ago`;
    } else if (daysSinceLogin <= 30) {
      loginScore = 80;
      loginDetail = `Last login ${daysSinceLogin} days ago — inactive`;
    } else {
      loginScore = 100;
      loginDetail = `Last login ${daysSinceLogin} days ago — likely churned`;
    }
  }

  // ─── Composite Score ───
  const factors: RiskFactors = {
    milestoneCompletion: { score: milestoneScore, weight: 0.30, detail: milestoneDetail },
    chatbotEngagement: { score: chatScore, weight: 0.25, detail: chatDetail },
    overdueMilestones: { score: overdueScore, weight: 0.20, detail: overdueDetail },
    sessionAttendance: { score: sessionScore, weight: 0.15, detail: sessionDetail },
    loginRecency: { score: loginScore, weight: 0.10, detail: loginDetail },
  };

  const riskScore = Math.round(
    milestoneScore * 0.30 +
    chatScore * 0.25 +
    overdueScore * 0.20 +
    sessionScore * 0.15 +
    loginScore * 0.10
  );

  const riskLevel: RiskLevel =
    riskScore >= 75 ? "CRITICAL" :
    riskScore >= 50 ? "HIGH" :
    riskScore >= 25 ? "MEDIUM" : "LOW";

  return { riskScore, riskLevel, factors };
}
