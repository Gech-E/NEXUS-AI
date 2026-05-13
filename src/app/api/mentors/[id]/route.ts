import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            location: true,
            bio: true,
          },
        },
        reviews: true,
      },
    });

    if (!mentorProfile) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const mentor = {
      id: mentorProfile.id,
      userId: mentorProfile.userId,
      name: mentorProfile.user.name || "Mentor",
      headline: mentorProfile.headline || "",
      bio: mentorProfile.user.bio || "",
      expertise: mentorProfile.expertise,
      industries: mentorProfile.industries,
      company: mentorProfile.company || "",
      title: mentorProfile.title || "",
      rating: mentorProfile.rating,
      totalSessions: mentorProfile.totalSessions,
      totalReviews: mentorProfile.totalReviews,
      yearsExperience: mentorProfile.yearsExperience || 0,
      isVerified: mentorProfile.isVerified,
      location: mentorProfile.user.location || "",
      image: mentorProfile.user.image,
      hourlyRate: mentorProfile.hourlyRate,
      currency: mentorProfile.currency,
      availability: mentorProfile.availability,
      reviews: mentorProfile.reviews,
    };

    return NextResponse.json(mentor);
  } catch (error) {
    console.error("Mentor details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor details" },
      { status: 500 }
    );
  }
}
