import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list posts with pagination, search, category filter
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest"; // latest, popular

    const where: any = {};
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any =
      sort === "popular"
        ? [{ upvotes: "desc" as const }, { createdAt: "desc" as const }]
        : [{ isPinned: "desc" as const }, { createdAt: "desc" as const }];

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true, role: true } },
          category: { select: { name: true, slug: true, icon: true } },
          _count: { select: { replies: true, votes: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content.substring(0, 200) + (p.content.length > 200 ? "..." : ""),
        isPinned: p.isPinned,
        isLocked: p.isLocked,
        upvotes: p.upvotes,
        viewCount: p.viewCount,
        replyCount: p._count.replies,
        author: p.author,
        category: p.category,
        createdAt: p.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Posts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST — create a new post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, categoryId } = await req.json();
    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 });
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        category: { select: { name: true, slug: true, icon: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post create error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
