import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["FOUNDER", "MENTOR", "INVESTOR"]),
});

export const startupSchema = z.object({
  name: z.string().min(2, "Startup name is required"),
  tagline: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  problem: z.string().min(20, "Problem statement is required"),
  solution: z.string().min(20, "Solution description is required"),
  targetMarket: z.string().min(10, "Target market is required"),
  businessModel: z.string().min(10, "Business model is required"),
  stage: z.enum(["IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "GROWTH"]),
  industry: z.string().min(2, "Industry is required"),
  techStack: z.array(z.string()).optional().default([]),
  teamSize: z.number().min(1).default(1),
  fundingSeeking: z.number().optional(),
});

export const onboardingSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  linkedin: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const mentorProfileSchema = z.object({
  headline: z.string().min(5, "Headline is required"),
  expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
  industries: z.array(z.string()).min(1, "Select at least one industry"),
  yearsExperience: z.number().min(1),
  company: z.string().optional(),
  title: z.string().optional(),
  hourlyRate: z.number().optional(),
  maxMentees: z.number().min(1).max(20).default(5),
});

export const chatMessageSchema = z.object({
  message: z.string().min(2, "Message must be at least 2 characters").max(2000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StartupInput = z.infer<typeof startupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
