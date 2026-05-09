import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role as any,
      },
    });

    // Create role-specific profile
    if (validated.role === "MENTOR") {
      await prisma.mentorProfile.create({
        data: { userId: user.id, expertise: [], industries: [] },
      });
    } else if (validated.role === "INVESTOR") {
      await prisma.investorProfile.create({
        data: { userId: user.id, preferredStages: [], preferredIndustries: [] },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        details: { role: validated.role },
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
