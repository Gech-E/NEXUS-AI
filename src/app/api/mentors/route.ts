import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const mentorProfiles = await prisma.mentorProfile.findMany({
      where: {
        isAvailable: true,
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { expertise: { hasSome: [search] } },
                { headline: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    const mentors = mentorProfiles.map((mp) => ({
      id: mp.id,
      userId: mp.userId,
      name: mp.user.name || "Mentor",
      headline: mp.headline || "",
      expertise: mp.expertise,
      industries: mp.industries,
      company: mp.company || "",
      rating: mp.rating,
      totalSessions: mp.totalSessions,
      yearsExperience: mp.yearsExperience || 0,
      isVerified: mp.isVerified,
      location: mp.user.location || "",
      image: mp.user.image,
      hourlyRate: mp.hourlyRate,
      currency: mp.currency,
    }));

    return NextResponse.json(mentors);
  } catch (error) {
    console.error("Mentors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}
