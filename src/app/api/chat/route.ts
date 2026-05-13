import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

function getSystemPrompt(role?: string, name?: string | null) {
  const base = `You are Nexus AI, an intelligent assistant on the Nexus Incubation Platform. You are assisting a user named ${name || 'User'} who has the role of ${role || 'User'}.`;
  
  if (role === "FOUNDER") {
    return `${base} As an expert startup advisor, you help founders with:
- Business model development and validation
- MVP planning and product strategy
- Pitch deck preparation and fundraising
- Market analysis and competitive positioning
- Team building and culture
- Legal and compliance guidance
- Growth strategies and scaling

Be concise, actionable, and encouraging. Use bullet points when helpful.
If asked about something outside startup topics, politely redirect.`;
  } else if (role === "MENTOR") {
    return `${base} As an assistant to a mentor, you help them:
- Prepare for mentorship sessions
- Provide constructive feedback to startups
- Structure their advice and guidance
- Keep track of best practices for coaching founders

Be concise, supportive, and provide structured insights.`;
  } else if (role === "INVESTOR") {
    return `${base} As an assistant to an investor, you help them:
- Evaluate startup pitches and business models
- Assess market opportunities and risks (TAM/SAM/SOM, SWOT)
- Perform due diligence and analyze traction
- Identify promising investment opportunities

Be analytical, objective, and focus on metrics and viability.`;
  } else if (role === "ADMIN") {
    return `${base} As an assistant to a platform administrator, you help them:
- Understand platform analytics and metrics
- Manage user interactions and engagement
- Optimize platform performance and features

Be professional, data-oriented, and helpful.`;
  }
  
  return `${base} How can I help you today?`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message || message.trim().length < 2) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { userId: session.user.id, role: "user", content: message },
    });

    let response: string;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Get recent context
        const history = await prisma.chatMessage.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        const contextMessages = history
          .reverse()
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

        const systemPrompt = getSystemPrompt((session.user as any)?.role, session.user?.name);
        const prompt = `${systemPrompt}\n\nConversation history:\n${contextMessages}\n\nUser: ${message}\n\nAssistant:`;
        const result = await model.generateContent(prompt);
        response = result.response.text();
      } catch (e) {
        console.error("AI chat error:", e);
        response = getFallbackResponse(message);
      }
    } else {
      response = getFallbackResponse(message);
    }

    // Save assistant message
    await prisma.chatMessage.create({
      data: { userId: session.user.id, role: "assistant", content: response },
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("business model")) {
    return "Great question! A strong business model should answer:\n\n• **Who** are your customers?\n• **What value** do you deliver?\n• **How** do you make money?\n\nI recommend using the Business Model Canvas. It covers 9 key blocks: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, and cost structure.\n\nWould you like me to walk you through any of these?";
  }
  if (lower.includes("pitch") || lower.includes("deck")) {
    return "A winning pitch deck should have 10-12 slides:\n\n1. **Problem** — What pain point exists?\n2. **Solution** — How you solve it\n3. **Market Size** — TAM/SAM/SOM\n4. **Product** — Demo or screenshots\n5. **Traction** — Key metrics\n6. **Business Model** — Revenue strategy\n7. **Competition** — Your advantages\n8. **Team** — Why you'll win\n9. **Financials** — Projections\n10. **Ask** — What you need\n\nWant help with any specific slide?";
  }
  if (lower.includes("mvp") || lower.includes("product")) {
    return "For your MVP, focus on the **core value proposition** only:\n\n• Identify the #1 problem you're solving\n• Build the minimum features to test that solution\n• Set a timeline of 6-8 weeks\n• Use no-code tools where possible\n• Get it in front of 10 real users fast\n\nRemember: The goal of an MVP is **learning**, not perfection. What's your startup idea?";
  }
  return "I'm your Nexus AI assistant! I can help you navigate the platform and provide tailored advice based on your role (Founder, Mentor, Investor, or Admin).\n\nTo give you the best advice, could you tell me more about your specific needs?\n\nAdd your GOOGLE_AI_API_KEY to .env for full AI-powered responses!";
}
