import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// GET — get current user's referral stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: { select: { name: true, email: true, createdAt: true, onboarded: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReferred = referrals.length;
    const completed = referrals.filter(r => r.status === "COMPLETED").length;
    const pending = referrals.filter(r => r.status === "PENDING" && r.referredId).length;

    return NextResponse.json({
      referralCode: user?.referralCode,
      stats: { totalReferred, completed, pending },
      referrals: referrals.map(r => ({
        id: r.id,
        code: r.code,
        status: r.status,
        referred: r.referred ? {
          name: r.referred.name,
          email: r.referred.email,
          joinedAt: r.referred.createdAt,
          onboarded: r.referred.onboarded,
        } : null,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (error) {
    console.error("Referrals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

// POST — generate referral code for user
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, name: true },
    });

    if (user?.referralCode) {
      return NextResponse.json({ referralCode: user.referralCode });
    }

    // Generate a unique code
    const namePrefix = (user?.name || "nexus")
      .replace(/\s+/g, "")
      .substring(0, 6)
      .toUpperCase();
    const code = `${namePrefix}-${uuidv4().substring(0, 6).toUpperCase()}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: code },
    });

    return NextResponse.json({ referralCode: code });
  } catch (error) {
    console.error("Referral code POST error:", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
