import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const startup = await prisma.startup.findUnique({
      where: { id },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const evaluation = startup.evaluations[0];
    if (evaluation) {
      await prisma.ideaEvaluation.update({ where: { id: evaluation.id }, data: { status: "PROCESSING" } });
    }

    const startTime = Date.now();
    let aiResult;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Evaluate this startup. Return ONLY valid JSON (no markdown).
Name: ${startup.name}, Industry: ${startup.industry}, Stage: ${startup.stage}
Problem: ${startup.problem}
Solution: ${startup.solution}
Target Market: ${startup.targetMarket}
Business Model: ${startup.businessModel}

JSON structure: {"nexusScore":<0-100>,"marketScore":<0-100>,"uniquenessScore":<0-100>,"executionScore":<0-100>,"viabilityScore":<0-100>,"teamFitScore":<0-100>,"confidence":<0-1>,"swotAnalysis":{"strengths":[],"weaknesses":[],"opportunities":[],"threats":[]},"competitorAnalysis":{"competitors":[{"name":"","description":"","differentiator":""}]},"tamSamSom":{"tam":"","sam":"","som":"","tamValue":0,"samValue":0,"somValue":0},"recommendations":[],"riskAssessment":[{"risk":"","severity":"low|medium|high","mitigation":""}],"summary":""}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        aiResult = JSON.parse(text);
      } catch (e) {
        console.error("AI error:", e);
        aiResult = fallback(startup);
      }
    } else {
      aiResult = fallback(startup);
    }

    const processingTime = (Date.now() - startTime) / 1000;
    const data = {
      status: "COMPLETED" as const, nexusScore: aiResult.nexusScore, marketScore: aiResult.marketScore,
      uniquenessScore: aiResult.uniquenessScore, executionScore: aiResult.executionScore,
      viabilityScore: aiResult.viabilityScore, teamFitScore: aiResult.teamFitScore,
      swotAnalysis: aiResult.swotAnalysis, competitorAnalysis: aiResult.competitorAnalysis,
      tamSamSom: aiResult.tamSamSom, recommendations: aiResult.recommendations,
      riskAssessment: aiResult.riskAssessment, fullReport: aiResult,
      confidence: aiResult.confidence, aiModel: genAI ? "gemini-1.5-flash" : "heuristic", processingTime,
    };

    const saved = evaluation
      ? await prisma.ideaEvaluation.update({ where: { id: evaluation.id }, data })
      : await prisma.ideaEvaluation.create({ data: { ...data, startupId: id } });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function fallback(s: any) {
  const ms = Math.min(85, 40 + (s.targetMarket?.length || 0) / 5);
  const us = Math.min(80, 35 + (s.solution?.length || 0) / 8);
  const es = Math.min(75, 30 + (s.teamSize || 1) * 8);
  const vs = Math.min(80, 40 + (s.problem?.length || 0) / 6);
  const ts = Math.min(70, 30 + (s.teamSize || 1) * 10);
  return {
    nexusScore: Math.round(ms * 0.25 + us * 0.2 + es * 0.2 + vs * 0.2 + ts * 0.15),
    marketScore: ms, uniquenessScore: us, executionScore: es, viabilityScore: vs, teamFitScore: ts,
    confidence: 0.6,
    swotAnalysis: { strengths: ["Clear problem"], weaknesses: ["Early stage"], opportunities: ["Growing market"], threats: ["Competition"] },
    competitorAnalysis: { competitors: [{ name: "Market Leader", description: "Existing player", differentiator: "Your unique approach" }] },
    tamSamSom: { tam: "Global", sam: "Regional", som: "Local", tamValue: 10e9, samValue: 1e9, somValue: 50e6 },
    recommendations: ["Validate with 50+ customers", "Build MVP in 8 weeks", "Seek domain mentors"],
    riskAssessment: [{ risk: "Market adoption", severity: "medium", mitigation: "Start niche" }],
    summary: `${s.name} targets ${s.industry}. Add GOOGLE_AI_API_KEY for full AI analysis.`,
  };
}
