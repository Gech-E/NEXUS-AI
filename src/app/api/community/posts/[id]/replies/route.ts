import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — add reply to a post
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

    const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.isLocked) {
      return NextResponse.json({ error: "Post is locked" }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        content,
        postId: params.id,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Reply POST error:", error);
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
  }
}
