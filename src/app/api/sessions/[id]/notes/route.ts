import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// GET — retrieve existing session notes
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.sessionNote.findUnique({
      where: { sessionId: params.id },
    });

    if (!note) {
      return NextResponse.json({ note: null });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Session notes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST — generate AI session notes
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the mentor session with mentor details
    const mentorSession = await prisma.mentorSession.findUnique({
      where: { id: params.id },
      include: {
        mentor: {
          include: { user: { select: { name: true } } },
        },
        sessionNote: true,
      },
    });

    if (!mentorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (mentorSession.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Notes can only be generated for completed sessions" },
        { status: 400 }
      );
    }

    // If notes already exist, return them
    if (mentorSession.sessionNote) {
      return NextResponse.json({ note: mentorSession.sessionNote });
    }

    // Build context for AI
    const context = {
      sessionTitle: mentorSession.title,
      description: mentorSession.description || "No description provided",
      mentorName: mentorSession.mentor.user.name || "Mentor",
      mentorExpertise: mentorSession.mentor.expertise.join(", "),
      duration: mentorSession.duration,
      notes: mentorSession.notes || "No manual notes recorded",
      feedback: mentorSession.feedback || "No feedback provided",
    };

    let summary: string;
    let actionItems: string[];
    let keyTopics: string[];
    let aiModel = "fallback";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an AI assistant for a startup incubation platform. Generate a structured session summary for a mentor-founder meeting.

Session Details:
- Title: ${context.sessionTitle}
- Description: ${context.description}
- Mentor: ${context.mentorName} (expertise: ${context.mentorExpertise})
- Duration: ${context.duration} minutes
- Session Notes: ${context.notes}
- Feedback: ${context.feedback}

Please respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "summary": "A comprehensive 2-3 paragraph summary of the session covering key discussion points, advice given, and decisions made.",
  "actionItems": ["Action item 1", "Action item 2", "Action item 3", "Action item 4", "Action item 5"],
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"]
}

Make the summary professional and insightful. Generate 3-5 actionable next steps and 3-5 key topics discussed.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Clean any markdown formatting
        const cleanJson = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsed = JSON.parse(cleanJson);
        summary = parsed.summary;
        actionItems = parsed.actionItems;
        keyTopics = parsed.keyTopics;
        aiModel = "gemini-1.5-flash";
      } catch (e) {
        console.error("AI generation error:", e);
        // Fallback
        summary = generateFallbackSummary(context);
        actionItems = generateFallbackActions(context);
        keyTopics = generateFallbackTopics(context);
      }
    } else {
      summary = generateFallbackSummary(context);
      actionItems = generateFallbackActions(context);
      keyTopics = generateFallbackTopics(context);
    }

    // Save to database
    const note = await prisma.sessionNote.create({
      data: {
        sessionId: params.id,
        summary,
        actionItems,
        keyTopics,
        aiModel,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Session notes POST error:", error);
    return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
  }
}

function generateFallbackSummary(context: any): string {
  return `Session "${context.sessionTitle}" was conducted with mentor ${context.mentorName}, who has expertise in ${context.mentorExpertise}. The ${context.duration}-minute session covered topics outlined in the meeting agenda.\n\n${context.description !== "No description provided" ? `The session focused on: ${context.description}.` : ""} ${context.notes !== "No manual notes recorded" ? `Key notes from the session: ${context.notes}.` : "The session provided valuable guidance on the founder's current challenges."}\n\nThis mentorship session provided actionable insights that the founder can implement to advance their startup journey.`;
}

function generateFallbackActions(context: any): string[] {
  const actions = [
    `Review and implement key advice from ${context.mentorName}`,
    "Update milestone progress based on session discussion",
    "Schedule follow-up session to track progress",
    "Document learnings and share with co-founders",
  ];
  if (context.mentorExpertise.includes("fundraising") || context.mentorExpertise.includes("investor")) {
    actions.push("Prepare updated pitch deck incorporating mentor feedback");
  } else {
    actions.push("Research competitors discussed during the session");
  }
  return actions;
}

function generateFallbackTopics(context: any): string[] {
  const topics = ["Startup Strategy", "Mentorship Guidance"];
  if (context.mentorExpertise) {
    const expertiseArr = context.mentorExpertise.split(", ").slice(0, 2);
    topics.push(...expertiseArr);
  }
  topics.push("Next Steps Planning");
  return topics.slice(0, 5);
}
