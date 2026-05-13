"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Rocket, ArrowRight, MapPin, Briefcase, Globe, Code, Heart,
  Sparkles, CheckCircle2, User, Linkedin,
} from "lucide-react";
import { toast } from "sonner";

const SKILLS = [
  "Product Management", "Software Engineering", "UI/UX Design", "Data Science",
  "Marketing", "Sales", "Finance", "Operations", "Business Development",
  "AI/ML", "Blockchain", "Cloud Infrastructure", "Mobile Development",
];

const INTERESTS = [
  "HealthTech", "FinTech", "EdTech", "AI/ML", "E-Commerce", "SaaS",
  "CleanTech", "Social Impact", "Gaming", "IoT", "Cybersecurity", "AgriTech",
];

const STEPS = [
  { label: "About You", icon: User },
  { label: "Links", icon: Globe },
  { label: "Skills & Interests", icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    bio: "", location: "", linkedin: "", website: "",
    skills: [] as string[], interests: [] as string[],
  });

  const toggleItem = (key: "skills" | "interests", item: string) => {
    const arr = form[key];
    setForm({ ...form, [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] });
  };

  const canProceed = () => {
    if (step === 0) return form.bio.length > 0 && form.location.length > 0;
    if (step === 1) return true; // links are optional
    if (step === 2) return form.skills.length > 0 && form.interests.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Welcome to Nexus AI! 🚀");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Ambient Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07] animate-float"
             style={{ background: "radial-gradient(circle, var(--color-brand-500), transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
             style={{ background: "radial-gradient(circle, var(--color-accent-500), transparent 70%)", animationDelay: "3s", animation: "float 8s ease-in-out infinite" }} />
      </div>

      <div className="w-full max-w-xl relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-5">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-[var(--color-brand-500)]/25 animate-pulse-glow">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Complete Your Profile</h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            Tell us about yourself so we can personalize your Nexus AI experience
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                onClick={() => { if (isDone) setStep(i); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))"
                    : isDone
                      ? "rgba(16,185,129,0.1)"
                      : "var(--bg-secondary)",
                  border: `1px solid ${isActive ? "var(--color-brand-500)" : isDone ? "var(--color-success-500)" : "var(--border-primary)"}`,
                  color: isActive ? "var(--color-brand-400)" : isDone ? "var(--color-success-500)" : "var(--text-muted)",
                  cursor: isDone ? "pointer" : "default",
                }}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8 relative overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          {/* Top glow strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
               style={{ background: "linear-gradient(90deg, transparent, var(--color-brand-500), var(--color-accent-500), transparent)" }} />

          {/* Step 0: About You */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <User className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />
                  Bio <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself, your passions, and what you're working on..."
                  rows={4}
                  className="w-full rounded-xl p-4 text-sm leading-relaxed resize-none transition-all duration-200 outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-brand-500)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  {form.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <MapPin className="w-4 h-4" style={{ color: "var(--color-accent-500)" }} />
                  Location <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-brand-500)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                />
              </div>
            </div>
          )}

          {/* Step 1: Links */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center mb-2">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  These are optional, but help others learn more about you.
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Linkedin className="w-4 h-4" style={{ color: "#0a66c2" }} />
                  LinkedIn
                </label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-brand-500)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Globe className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />
                  Website
                </label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://your-website.com"
                  className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-brand-500)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                />
              </div>
            </div>
          )}

          {/* Step 2: Skills & Interests */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Code className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} />
                  Skills
                  <span className="text-[var(--color-danger-500)]">*</span>
                  <span className="text-xs font-normal ml-auto px-2 py-0.5 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                    {form.skills.length} selected
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => {
                    const active = form.skills.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleItem("skills", s)}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))"
                            : "var(--bg-secondary)",
                          border: `1.5px solid ${active ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                          color: active ? "var(--color-brand-400)" : "var(--text-secondary)",
                          boxShadow: active ? "0 0 12px rgba(99,102,241,0.15)" : "none",
                        }}
                      >
                        {active && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px w-full" style={{ background: "var(--border-primary)" }} />

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Heart className="w-4 h-4" style={{ color: "var(--color-accent-500)" }} />
                  Interests
                  <span className="text-[var(--color-danger-500)]">*</span>
                  <span className="text-xs font-normal ml-auto px-2 py-0.5 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                    {form.interests.length} selected
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => {
                    const active = form.interests.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem("interests", i)}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))"
                            : "var(--bg-secondary)",
                          border: `1.5px solid ${active ? "var(--color-accent-500)" : "var(--border-primary)"}`,
                          color: active ? "var(--color-accent-400)" : "var(--text-secondary)",
                          boxShadow: active ? "0 0 12px rgba(139,92,246,0.15)" : "none",
                        }}
                      >
                        {active && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />}
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--bg-secondary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={loading || !canProceed()}
              className="relative px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--color-brand-500)]/25 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-accent-600))" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === STEPS.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" /> Complete Setup
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-500))",
            }}
          />
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
