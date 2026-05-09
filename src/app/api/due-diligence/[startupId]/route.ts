import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// GET — retrieve existing DD report
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ startupId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!investorProfile) {
      return NextResponse.json({ error: "Investor profile not found" }, { status: 403 });
    }

    const report = await prisma.dueDiligenceReport.findFirst({
      where: {
        startupId: params.startupId,
        investorId: investorProfile.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("DD report GET error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

// POST — generate AI due diligence report
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ startupId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!investorProfile) {
      return NextResponse.json({ error: "Investor profile not found" }, { status: 403 });
    }

    // Gather all startup data
    const startup = await prisma.startup.findUnique({
      where: { id: params.startupId },
      include: {
        founder: { select: { name: true, bio: true, skills: true, linkedin: true } },
        evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
        milestones: true,
        matches: { where: { status: "ACCEPTED" } },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // Compute metrics
    const evaluation = startup.evaluations[0];
    const totalMilestones = startup.milestones.length;
    const completedMilestones = startup.milestones.filter(m => m.status === "COMPLETED").length;
    const milestoneRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const acceptedMatches = startup.matches.length;

    const startupContext = {
      name: startup.name,
      tagline: startup.tagline || "",
      description: startup.description,
      problem: startup.problem,
      solution: startup.solution,
      targetMarket: startup.targetMarket,
      businessModel: startup.businessModel,
      stage: startup.stage,
      industry: startup.industry,
      teamSize: startup.teamSize,
      revenue: startup.revenue || 0,
      fundingRaised: startup.fundingRaised || 0,
      fundingSeeking: startup.fundingSeeking || 0,
      founderName: startup.founder.name || "Unknown",
      founderSkills: startup.founder.skills.join(", "),
      nexusScore: evaluation?.nexusScore || 0,
      marketScore: evaluation?.marketScore || 0,
      uniquenessScore: evaluation?.uniquenessScore || 0,
      executionScore: evaluation?.executionScore || 0,
      viabilityScore: evaluation?.viabilityScore || 0,
      milestoneRate,
      completedMilestones,
      totalMilestones,
      acceptedMatches,
    };

    let overallScore: number;
    let riskLevel: string;
    let strengths: string[];
    let risks: string[];
    let financialAnalysis: any;
    let teamAssessment: any;
    let marketAnalysis: any;
    let recommendation: string;
    let aiModel = "fallback";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a due diligence analyst for a venture capital platform. Generate a comprehensive DD report for the following startup.

Startup Data:
- Name: ${startupContext.name}
- Tagline: ${startupContext.tagline}
- Industry: ${startupContext.industry}
- Stage: ${startupContext.stage}
- Problem: ${startupContext.problem}
- Solution: ${startupContext.solution}
- Target Market: ${startupContext.targetMarket}
- Business Model: ${startupContext.businessModel}
- Team Size: ${startupContext.teamSize}
- Founder: ${startupContext.founderName} (skills: ${startupContext.founderSkills})
- Revenue: $${startupContext.revenue}
- Funding Raised: $${startupContext.fundingRaised}
- Seeking: $${startupContext.fundingSeeking}
- Nexus AI Score: ${startupContext.nexusScore}/100
- Market Score: ${startupContext.marketScore}/100
- Uniqueness Score: ${startupContext.uniquenessScore}/100
- Execution Score: ${startupContext.executionScore}/100
- Milestone Completion: ${startupContext.milestoneRate}% (${startupContext.completedMilestones}/${startupContext.totalMilestones})
- Active Mentor Matches: ${startupContext.acceptedMatches}

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "overallScore": 0-100,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "financialAnalysis": {
    "revenueAssessment": "text",
    "burnRate": "text",
    "fundingEfficiency": "text"
  },
  "teamAssessment": {
    "founderFit": "text",
    "teamCompleteness": "text",
    "executionCapability": "text"
  },
  "marketAnalysis": {
    "marketSize": "text",
    "competitivePosition": "text",
    "growthPotential": "text"
  },
  "recommendation": "A comprehensive 2-3 paragraph investment recommendation."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        overallScore = parsed.overallScore;
        riskLevel = parsed.riskLevel;
        strengths = parsed.strengths;
        risks = parsed.risks;
        financialAnalysis = parsed.financialAnalysis;
        teamAssessment = parsed.teamAssessment;
        marketAnalysis = parsed.marketAnalysis;
        recommendation = parsed.recommendation;
        aiModel = "gemini-1.5-flash";
      } catch (e) {
        console.error("AI DD error:", e);
        const fb = generateFallbackDD(startupContext);
        overallScore = fb.overallScore;
        riskLevel = fb.riskLevel;
        strengths = fb.strengths;
        risks = fb.risks;
        financialAnalysis = fb.financialAnalysis;
        teamAssessment = fb.teamAssessment;
        marketAnalysis = fb.marketAnalysis;
        recommendation = fb.recommendation;
      }
    } else {
      const fb = generateFallbackDD(startupContext);
      overallScore = fb.overallScore;
      riskLevel = fb.riskLevel;
      strengths = fb.strengths;
      risks = fb.risks;
      financialAnalysis = fb.financialAnalysis;
      teamAssessment = fb.teamAssessment;
      marketAnalysis = fb.marketAnalysis;
      recommendation = fb.recommendation;
    }

    const report = await prisma.dueDiligenceReport.create({
      data: {
        startupId: params.startupId,
        investorId: investorProfile.id,
        overallScore,
        riskLevel,
        strengths,
        risks,
        financialAnalysis,
        teamAssessment,
        marketAnalysis,
        recommendation,
        aiModel,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("DD report POST error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function generateFallbackDD(ctx: any) {
  const score = ctx.nexusScore || 50;
  const level = score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : score >= 25 ? "HIGH" : "CRITICAL";

  return {
    overallScore: score,
    riskLevel: level,
    strengths: [
      `Strong problem-solution fit in the ${ctx.industry} industry`,
      `Team of ${ctx.teamSize} with relevant founder skills: ${ctx.founderSkills || "diverse skillset"}`,
      `${ctx.milestoneRate}% milestone completion rate demonstrates execution capability`,
    ],
    risks: [
      ctx.revenue === 0 ? "Pre-revenue — no proven monetization" : "Revenue still in early stages",
      ctx.teamSize < 3 ? "Small team may face execution risk at scale" : "Team scaling needs planning",
      "Competitive market landscape requires differentiation strategy",
    ],
    financialAnalysis: {
      revenueAssessment: ctx.revenue > 0 ? `Current revenue: $${ctx.revenue}` : "Pre-revenue stage",
      burnRate: "Unable to assess without detailed financials",
      fundingEfficiency: ctx.fundingRaised > 0 ? `Raised $${ctx.fundingRaised}, seeking $${ctx.fundingSeeking}` : "No prior funding",
    },
    teamAssessment: {
      founderFit: `${ctx.founderName} brings ${ctx.founderSkills || "relevant"} experience`,
      teamCompleteness: `Current team size of ${ctx.teamSize}`,
      executionCapability: `${ctx.milestoneRate}% milestone completion rate`,
    },
    marketAnalysis: {
      marketSize: `Operating in ${ctx.industry} — ${ctx.targetMarket}`,
      competitivePosition: `Uniqueness score: ${ctx.uniquenessScore}/100`,
      growthPotential: `Market opportunity score: ${ctx.marketScore}/100`,
    },
    recommendation: `${ctx.name} is a ${ctx.stage.replace("_", " ").toLowerCase()}-stage startup in the ${ctx.industry} sector with a Nexus AI score of ${ctx.nexusScore}/100. The team has demonstrated ${ctx.milestoneRate}% milestone completion, indicating ${ctx.milestoneRate >= 50 ? "solid" : "developing"} execution capabilities.\n\nBased on the available data, this startup ${score >= 60 ? "shows promising potential and warrants further due diligence discussions with the founding team" : "requires additional validation before investment consideration"}. We recommend ${score >= 60 ? "scheduling a direct conversation with the founder to discuss growth plans and financial projections" : "monitoring progress on key milestones before proceeding with deeper engagement"}.`,
  };
}
