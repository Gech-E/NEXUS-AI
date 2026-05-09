import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const mentorSession = await prisma.mentorSession.findUnique({
      where: { id: params.id },
      include: {
        mentor: {
          include: { user: { select: { id: true, name: true, image: true } } }
        }
      }
    });

    if (!mentorSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ session: mentorSession });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
