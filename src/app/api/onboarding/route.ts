import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bio, location, skills, interests, linkedin, website } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { bio, location, skills, interests, linkedin, website, onboarded: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
