import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // Get the founder's startups
    const startups = await prisma.startup.findMany({
      where: { founderId: userId },
      select: { id: true },
    });
    const startupIds = startups.map((s) => s.id);

    const milestones = await prisma.milestone.findMany({
      where: { startupId: { in: startupIds } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Milestones API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, dueDate, startupId } = await req.json();

    if (!title || !startupId) {
      return NextResponse.json(
        { error: "Title and startup are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const startup = await prisma.startup.findFirst({
      where: { id: startupId, founderId: session.user.id },
    });
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        startupId,
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Milestone creation error:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { milestoneId, status, progress } = await req.json();

    if (!milestoneId) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership through startup
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { startup: { select: { founderId: true } } },
    });

    if (!milestone || milestone.startup.founderId !== session.user.id) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(status ? { status } : {}),
        ...(progress !== undefined ? { progress } : {}),
        ...(status === "COMPLETED" ? { completedAt: new Date(), progress: 100 } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Milestone update error:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}
