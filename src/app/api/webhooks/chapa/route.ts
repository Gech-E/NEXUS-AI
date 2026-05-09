import { NextRequest, NextResponse } from "next/server";
import { verifyChapaTransaction } from "@/lib/chapa";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Chapa sends the tx_ref in the body or URL depending on setup.
    // For webhooks, they send an event body with the tx_ref.
    // Ensure you configure Chapa dashboard webhook to point to this URL.

    const body = await req.json();
    const txRef = body.tx_ref;

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // Verify with Chapa API
    const verification = await verifyChapaTransaction(txRef);

    if (verification.status === "success") {
      // Find the session and update payment status
      await prisma.mentorSession.updateMany({
        where: { paymentId: txRef },
        data: { paymentStatus: "COMPLETED" },
      });

      // Optionally, create a notification
      const session = await prisma.mentorSession.findUnique({
        where: { paymentId: txRef },
        include: { mentor: { include: { user: true } } },
      });

      if (session) {
        await prisma.notification.create({
          data: {
            userId: session.mentor.userId,
            type: "SESSION",
            title: "Payment Received",
            message: `Payment received for the upcoming session "${session.title}".`,
          },
        });
      }

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "failed" });
  } catch (error: any) {
    console.error("Chapa webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
