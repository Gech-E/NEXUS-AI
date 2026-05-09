import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PptxGenJS from "pptxgenjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { startupId } = await req.json();
    if (!startupId) return NextResponse.json({ error: "Missing startupId" }, { status: 400 });

    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    if (!startup) return NextResponse.json({ error: "Startup not found" }, { status: 404 });

    const pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";
    pres.author = "Nexus AI";
    pres.company = "Nexus AI";

    // 1. Title Slide
    let slide = pres.addSlide();
    slide.background = { color: "111827" }; // Dark theme
    slide.addText(startup.name, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 44, color: "FFFFFF", bold: true, align: "center" });
    slide.addText(startup.tagline || startup.industry, { x: 1, y: 3.5, w: 8, h: 1, fontSize: 24, color: "A0AEC0", align: "center" });

    // 2. Problem Slide
    slide = pres.addSlide();
    slide.addText("The Problem", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 32, color: "2563EB", bold: true });
    slide.addText(startup.problem, { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333" });

    // 3. Solution Slide
    slide = pres.addSlide();
    slide.addText("Our Solution", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 32, color: "10B981", bold: true });
    slide.addText(startup.solution, { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333" });

    // 4. Target Market Slide
    slide = pres.addSlide();
    slide.addText("Target Market", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 32, color: "8B5CF6", bold: true });
    slide.addText(startup.targetMarket, { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333" });

    // 5. Business Model Slide
    slide = pres.addSlide();
    slide.addText("Business Model", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 32, color: "F59E0B", bold: true });
    slide.addText(startup.businessModel, { x: 0.5, y: 1.5, w: 9, h: 3, fontSize: 20, color: "333333" });

    // 6. Evaluation Data (if any)
    const evalData = startup.evaluations[0];
    if (evalData && evalData.nexusScore) {
      slide = pres.addSlide();
      slide.addText("Nexus AI Evaluation", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 32, color: "EC4899", bold: true });
      slide.addText(`Nexus Score: ${evalData.nexusScore}/100`, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 24, color: "333333", bold: true });
      slide.addText(`Market Score: ${evalData.marketScore}/100`, { x: 0.5, y: 2.5, w: 9, h: 0.5, fontSize: 18, color: "666666" });
      slide.addText(`Execution Score: ${evalData.executionScore}/100`, { x: 0.5, y: 3.0, w: 9, h: 0.5, fontSize: 18, color: "666666" });
    }

    const buffer = await pres.write({ outputType: "nodebuffer" });

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${startup.name.replace(/\s+/g, '_')}_PitchDeck.pptx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    });
  } catch (error) {
    console.error("Pitch deck error:", error);
    return NextResponse.json({ error: "Failed to generate pitch deck" }, { status: 500 });
  }
}
