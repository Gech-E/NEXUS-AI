import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  startupSchema,
  onboardingSchema,
  chatMessageSchema,
  mentorProfileSchema,
} from "@/lib/validators";

// ─── Login Schema ────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "founder@nexus.ai",
      password: "securePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "securePass123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects short password (< 8 chars)", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "validPassword1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ─── Register Schema ─────────────────────────────────────────────

describe("registerSchema", () => {
  it("accepts valid founder registration", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@startup.io",
      password: "strongPass99",
      role: "FOUNDER",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid mentor registration", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "jane@mentor.com",
      password: "mentorPass1!",
      role: "MENTOR",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid investor registration", () => {
    const result = registerSchema.safeParse({
      name: "Bob Capital",
      email: "bob@vc.fund",
      password: "invest2026!",
      role: "INVESTOR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      password: "password123",
      role: "HACKER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "a@test.com",
      password: "password123",
      role: "FOUNDER",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({
      email: "user@test.com",
      password: "password123",
      role: "FOUNDER",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Startup Schema ─────────────────────────────────────────────

describe("startupSchema", () => {
  const validStartup = {
    name: "NexGen Health",
    tagline: "AI-powered diagnostics",
    description: "A comprehensive platform for healthcare diagnostics using machine learning",
    problem: "Rural clinics lack access to specialist diagnostic capabilities",
    solution: "AI-powered diagnostic tool that runs on low-cost hardware",
    targetMarket: "Rural healthcare clinics in developing countries",
    businessModel: "SaaS subscription model with per-diagnosis pricing",
    stage: "IDEA" as const,
    industry: "HealthTech",
    techStack: ["React", "Python", "TensorFlow"],
    teamSize: 3,
    fundingSeeking: 500000,
  };

  it("accepts a valid startup submission", () => {
    const result = startupSchema.safeParse(validStartup);
    expect(result.success).toBe(true);
  });

  it("accepts without optional fields (tagline, techStack, fundingSeeking)", () => {
    const { tagline, fundingSeeking, ...required } = validStartup;
    const result = startupSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("rejects missing required name", () => {
    const { name, ...rest } = validStartup;
    const result = startupSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 20 chars", () => {
    const result = startupSchema.safeParse({
      ...validStartup,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stage enum value", () => {
    const result = startupSchema.safeParse({
      ...validStartup,
      stage: "UNICORN",
    });
    expect(result.success).toBe(false);
  });

  it("validates all valid stage values", () => {
    const stages = ["IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "GROWTH"];
    for (const stage of stages) {
      const result = startupSchema.safeParse({ ...validStartup, stage });
      expect(result.success).toBe(true);
    }
  });

  it("defaults teamSize to 1 when not provided", () => {
    const { teamSize, ...rest } = validStartup;
    const result = startupSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamSize).toBe(1);
    }
  });

  it("rejects teamSize less than 1", () => {
    const result = startupSchema.safeParse({
      ...validStartup,
      teamSize: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ─── Onboarding Schema ──────────────────────────────────────────

describe("onboardingSchema", () => {
  const validOnboarding = {
    bio: "Experienced founder building in HealthTech space",
    location: "Addis Ababa, Ethiopia",
    skills: ["Product Management", "AI/ML"],
    interests: ["HealthTech", "FinTech"],
    linkedin: "https://linkedin.com/in/testuser",
    website: "https://mysite.com",
  };

  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse(validOnboarding);
    expect(result.success).toBe(true);
  });

  it("accepts without optional links", () => {
    const result = onboardingSchema.safeParse({
      bio: "I am a serial entrepreneur with 10+ years experience",
      location: "Nairobi, Kenya",
      skills: ["Sales"],
      interests: ["SaaS"],
      linkedin: "",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects bio shorter than 10 characters", () => {
    const result = onboardingSchema.safeParse({
      ...validOnboarding,
      bio: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty skills array", () => {
    const result = onboardingSchema.safeParse({
      ...validOnboarding,
      skills: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty interests array", () => {
    const result = onboardingSchema.safeParse({
      ...validOnboarding,
      interests: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid linkedin URL", () => {
    const result = onboardingSchema.safeParse({
      ...validOnboarding,
      linkedin: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

// ─── Chat Message Schema ─────────────────────────────────────────

describe("chatMessageSchema", () => {
  it("accepts valid chat message", () => {
    const result = chatMessageSchema.safeParse({
      message: "How do I validate my startup idea?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects message shorter than 2 characters", () => {
    const result = chatMessageSchema.safeParse({ message: "H" });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 2000 characters", () => {
    const result = chatMessageSchema.safeParse({
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message at exactly 2000 characters", () => {
    const result = chatMessageSchema.safeParse({
      message: "x".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("accepts message at exactly 2 characters", () => {
    const result = chatMessageSchema.safeParse({ message: "Hi" });
    expect(result.success).toBe(true);
  });
});

// ─── Mentor Profile Schema ───────────────────────────────────────

describe("mentorProfileSchema", () => {
  const validProfile = {
    headline: "Experienced startup advisor",
    expertise: ["Product Strategy", "Growth"],
    industries: ["SaaS", "FinTech"],
    yearsExperience: 10,
    company: "TechCo",
    title: "VP Engineering",
    hourlyRate: 150,
    maxMentees: 5,
  };

  it("accepts valid mentor profile", () => {
    const result = mentorProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("rejects empty expertise array", () => {
    const result = mentorProfileSchema.safeParse({
      ...validProfile,
      expertise: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects maxMentees above 20", () => {
    const result = mentorProfileSchema.safeParse({
      ...validProfile,
      maxMentees: 25,
    });
    expect(result.success).toBe(false);
  });

  it("defaults maxMentees to 5", () => {
    const { maxMentees, ...rest } = validProfile;
    const result = mentorProfileSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxMentees).toBe(5);
    }
  });

  it("rejects yearsExperience less than 1", () => {
    const result = mentorProfileSchema.safeParse({
      ...validProfile,
      yearsExperience: 0,
    });
    expect(result.success).toBe(false);
  });
});
