import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      // Get all recent contacts/conversations
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        },
        include: { sender: { select: { id: true, name: true, image: true, role: true } }, receiver: { select: { id: true, name: true, image: true, role: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(messages);
    }

    // Get messages with specific contact
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: contactId },
          { senderId: contactId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { receiverId: session.user.id, senderId: contactId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch messages error", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, content, attachments } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        attachments: attachments || null,
      },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE",
        title: `New message from ${session.user.name}`,
        message: content.length > 50 ? content.substring(0, 50) + "..." : content,
        actionUrl: `/dashboard/messages?contactId=${session.user.id}`,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Send message error", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
