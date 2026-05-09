import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — single post with replies
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

    // Increment view count
    await prisma.forumPost.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    const post = await prisma.forumPost.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        category: { select: { name: true, slug: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, image: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        votes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      hasVoted: post.votes.length > 0,
      votes: undefined,
    });
  } catch (error) {
    console.error("Post GET error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// DELETE — delete post (author or admin)
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = (session.user as any).role;
    if (post.authorId !== session.user.id && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.forumPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
