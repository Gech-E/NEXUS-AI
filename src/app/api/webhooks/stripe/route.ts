import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const sessionId = session.metadata?.sessionId;

      if (sessionId) {
        await prisma.mentorSession.update({
          where: { id: sessionId },
          data: { paymentStatus: "COMPLETED" },
        });

        // Get the mentor session to notify the mentor
        const mentorSession = await prisma.mentorSession.findUnique({
          where: { id: sessionId },
          include: { mentor: true },
        });

        if (mentorSession) {
          await prisma.notification.create({
            data: {
              userId: mentorSession.mentor.userId,
              type: "SESSION",
              title: "Session Booked & Paid",
              message: `Payment received and session booked successfully.`,
              actionUrl: `/dashboard/calendar`,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
