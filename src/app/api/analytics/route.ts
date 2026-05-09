import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Gather Platform Stats
    const totalUsers = await prisma.user.count();
    const activeStartups = await prisma.startup.count();
    const totalEvaluations = await prisma.ideaEvaluation.count();
    const totalSessions = await prisma.mentorSession.count();
    const completedSessions = await prisma.mentorSession.count({ where: { status: "COMPLETED" } });
    const totalMatches = await prisma.match.count();

    const stats = {
      totalUsers,
      activeStartups,
      totalEvaluations,
      totalSessions,
      completedSessions,
      totalMatches,
      generatedAt: new Date().toISOString(),
    };

    let aiSummary = "AI Summary not available. Please configure GOOGLE_AI_API_KEY.";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a data analyst for Nexus AI, a startup incubation platform.
Based on the following platform statistics, write a short, professional, 1-paragraph executive summary highlighting the platform's current traction and health.

Data:
${JSON.stringify(stats, null, 2)}
`;
        const result = await model.generateContent(prompt);
        aiSummary = result.response.text();
      } catch (e) {
        console.error("AI Analytics error", e);
      }
    }

    return NextResponse.json({
      ...stats,
      aiSummary,
    });
  } catch (error) {
    console.error("Analytics error", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
