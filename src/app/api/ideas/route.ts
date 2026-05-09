import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startupSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startups = await prisma.startup.findMany({
      where: { founderId: session.user.id },
      include: {
        evaluations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = startupSchema.parse(body);

    const startup = await prisma.startup.create({
      data: {
        ...validated,
        founderId: session.user.id,
      },
    });

    // Create a pending evaluation
    await prisma.ideaEvaluation.create({
      data: {
        startupId: startup.id,
        status: "PENDING",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "IDEA_SUBMITTED",
        entity: "Startup",
        entityId: startup.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(startup, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error creating startup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
