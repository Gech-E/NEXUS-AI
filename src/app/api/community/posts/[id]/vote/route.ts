import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — toggle upvote on a post
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

    const postId = params.id;

    // Check if already voted
    const existingVote = await prisma.forumVote.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
    });

    if (existingVote) {
      // Remove vote
      await prisma.forumVote.delete({ where: { id: existingVote.id } });
      await prisma.forumPost.update({
        where: { id: postId },
        data: { upvotes: { decrement: 1 } },
      });
      return NextResponse.json({ voted: false });
    } else {
      // Add vote
      await prisma.forumVote.create({
        data: { userId: session.user.id, postId },
      });
      await prisma.forumPost.update({
        where: { id: postId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
