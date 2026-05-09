import { UserRole, StartupStage } from "@prisma/client";

export type { UserRole, StartupStage };

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  location?: string;
  skills: string[];
  interests: string[];
  isActive: boolean;
  isVerified: boolean;
  onboarded: boolean;
  createdAt: string;
}

export interface StartupData {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  businessModel: string;
  stage: StartupStage;
  industry: string;
  techStack: string[];
  teamSize: number;
  revenue?: number;
  fundingRaised?: number;
  fundingSeeking?: number;
  pitchDeckUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isPublic: boolean;
  createdAt: string;
  founder?: UserProfile;
  evaluations?: IdeaEvaluationData[];
  milestones?: MilestoneData[];
}

export interface IdeaEvaluationData {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  nexusScore?: number;
  marketScore?: number;
  uniquenessScore?: number;
  executionScore?: number;
  viabilityScore?: number;
  teamFitScore?: number;
  swotAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorAnalysis?: {
    competitors: Array<{
      name: string;
      description: string;
      differentiator: string;
    }>;
  };
  tamSamSom?: {
    tam: string;
    sam: string;
    som: string;
    tamValue: number;
    samValue: number;
    somValue: number;
  };
  recommendations?: string[];
  riskAssessment?: Array<{
    risk: string;
    severity: "low" | "medium" | "high";
    mitigation: string;
  }>;
  fullReport?: Record<string, unknown>;
  confidence?: number;
  createdAt: string;
}

export interface MentorProfileData {
  id: string;
  headline?: string;
  expertise: string[];
  industries: string[];
  yearsExperience?: number;
  company?: string;
  title?: string;
  hourlyRate?: number;
  currency: string;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isAvailable: boolean;
  isVerified: boolean;
  user: UserProfile;
}

export interface InvestorProfileData {
  id: string;
  firm?: string;
  title?: string;
  investmentThesis?: string;
  checkSizeMin?: number;
  checkSizeMax?: number;
  preferredStages: StartupStage[];
  preferredIndustries: string[];
  totalInvestments: number;
  isAccredited: boolean;
  isVerified: boolean;
  user: UserProfile;
}

export interface MilestoneData {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  progress: number;
  completedAt?: string;
  aiInsights?: string;
  createdAt: string;
}

export interface MatchData {
  id: string;
  type: "mentor-founder" | "investor-startup" | "cofounder";
  compatibilityScore?: number;
  aiExplanation?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  startup?: StartupData;
  mentor?: MentorProfileData;
  createdAt: string;
}

export interface DashboardStats {
  totalStartups: number;
  totalEvaluations: number;
  avgNexusScore: number;
  activeMentors: number;
  totalMatches: number;
  totalMilestones: number;
  completedMilestones: number;
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
