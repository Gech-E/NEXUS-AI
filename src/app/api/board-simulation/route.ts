import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

const PERSONAS = {
  "Skeptic Investor": "You are a Skeptic Investor. You care about traction, unit economics, and competitive moats. You ask tough, critical questions about why this business will fail.",
  "Growth Expert": "You are a Growth Expert. You care about go-to-market strategy, customer acquisition cost, viral loops, and scalability.",
  "Domain Expert": "You are a Domain Expert. You care about the product, user experience, and technical feasibility."
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Create new simulation
    if (body.action === "start") {
      const { startupId } = body;
      
      const simulation = await prisma.boardSimulation.create({
        data: {
          startupId,
          status: "IN_PROGRESS",
          messages: {
            create: [
              { role: "system", persona: "System", content: "Board meeting started. The floor is yours to pitch your startup." },
              { role: "assistant", persona: "Skeptic Investor", content: "Alright, let's hear it. What exactly does your startup do, and why should we care?" }
            ]
          }
        },
        include: { messages: true }
      });
      return NextResponse.json({ simulation });
    }

    // Handle incoming user message
    if (body.action === "message") {
      const { simulationId, content } = body;

      // Save user message
      await prisma.boardMessage.create({
        data: { simulationId, role: "user", content }
      });

      // Get board simulation and messages
      const simulation = await prisma.boardSimulation.findUnique({
        where: { id: simulationId },
        include: { messages: { orderBy: { createdAt: "asc" } }, startup: true }
      });

      if (!simulation) return NextResponse.json({ error: "Not found" }, { status: 404 });

      // Determine which persona replies (just pick one round-robin or randomly, or have Gemini decide)
      // For MVP, we'll pick the Growth Expert or Domain Expert based on message count
      const userMessageCount = simulation.messages.filter(m => m.role === "user").length;
      const personasList = ["Skeptic Investor", "Growth Expert", "Domain Expert"];
      const nextPersona = personasList[userMessageCount % 3];

      let responseText = "";

      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const context = simulation.messages.map(m => `${m.persona || 'Founder'}: ${m.content}`).join("\n");
          const prompt = `Context: ${context}\n\n${PERSONAS[nextPersona as keyof typeof PERSONAS]}\n\nRespond to the Founder's last message as this persona. Keep it under 3 sentences. Be direct.`;
          
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
        } catch (e) {
          console.error(e);
          responseText = getFallbackResponse(nextPersona);
        }
      } else {
        responseText = getFallbackResponse(nextPersona);
      }

      const newMsg = await prisma.boardMessage.create({
        data: { simulationId, role: "assistant", persona: nextPersona, content: responseText }
      });

      return NextResponse.json({ message: newMsg });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Board Sim error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const simulationId = url.searchParams.get("id");

    if (simulationId) {
      const sim = await prisma.boardSimulation.findUnique({
        where: { id: simulationId },
        include: { messages: { orderBy: { createdAt: "asc" } } }
      });
      return NextResponse.json({ simulation: sim });
    }

    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function getFallbackResponse(persona: string): string {
  if (persona === "Skeptic Investor") return "That sounds overly optimistic. What's your actual customer acquisition cost?";
  if (persona === "Growth Expert") return "How are you planning to scale this beyond your initial network? I don't see a viral loop.";
  return "What's the hardest technical challenge you've faced building this product?";
}
