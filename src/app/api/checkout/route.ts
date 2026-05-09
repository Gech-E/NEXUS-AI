import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { initializeChapaTransaction } from "@/lib/chapa";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mentorId, sessionId, provider } = await req.json(); // provider = "STRIPE" | "CHAPA"

    // Verify session and mentor
    const mentorSession = await prisma.mentorSession.findUnique({
      where: { id: sessionId },
      include: { mentor: { include: { user: true } } },
    });

    if (!mentorSession || mentorSession.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const amount = mentorSession.amount || mentorSession.mentor.hourlyRate || 0;
    const currency = mentorSession.currency || "USD";

    if (amount <= 0) {
      return NextResponse.json({ error: "Free session, no payment required" }, { status: 400 });
    }

    const txRef = `tx-${uuidv4()}`;

    // ─── CHAPA CHECKOUT ───
    if (provider === "CHAPA") {
      const checkoutUrl = await initializeChapaTransaction({
        amount: amount,
        currency: "ETB", // Chapa heavily uses ETB, can pass currency if needed
        email: session.user.email as string,
        first_name: session.user.name?.split(" ")[0] || "User",
        last_name: session.user.name?.split(" ")[1] || "",
        tx_ref: txRef,
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/chapa`,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/sessions/${sessionId}?payment=success`,
        customization: {
          title: "Mentor Session",
          description: `Session with ${mentorSession.mentor.user.name}`,
        },
      });

      // Update session with pending payment info
      await prisma.mentorSession.update({
        where: { id: sessionId },
        data: {
          paymentId: txRef,
          paymentProvider: "CHAPA",
          paymentStatus: "PENDING",
        },
      });

      return NextResponse.json({ url: checkoutUrl.checkout_url });
    }

    // ─── STRIPE CHECKOUT ───
    if (provider === "STRIPE") {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Mentor Session with ${mentorSession.mentor.user.name}`,
                description: `Date: ${mentorSession.scheduledAt.toLocaleDateString()}`,
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXTAUTH_URL}/dashboard/sessions/${sessionId}?payment=success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/sessions/${sessionId}?payment=cancelled`,
        metadata: {
          sessionId: sessionId,
          userId: session.user.id,
        },
      });

      await prisma.mentorSession.update({
        where: { id: sessionId },
        data: {
          paymentId: stripeSession.id,
          paymentProvider: "STRIPE",
          paymentStatus: "PENDING",
        },
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout" }, { status: 500 });
  }
}
