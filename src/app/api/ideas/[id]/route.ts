import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        evaluations: { orderBy: { createdAt: "desc" } },
        milestones: { orderBy: { createdAt: "desc" } },
        founder: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    if (!startup) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(startup);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
