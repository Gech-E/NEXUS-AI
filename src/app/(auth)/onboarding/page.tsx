"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Rocket, ArrowRight, MapPin, Briefcase, Globe, Code, Heart } from "lucide-react";
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

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: "", location: "", linkedin: "", website: "",
    skills: [] as string[], interests: [] as string[],
  });

  const toggleItem = (key: "skills" | "interests", item: string) => {
    const arr = form[key];
    setForm({ ...form, [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] });
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tell us about yourself so we can personalize your experience</p>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Bio *</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-field min-h-[80px]" placeholder="Tell us about yourself and what you're working on..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              <MapPin className="w-4 h-4 inline mr-1" /> Location *
            </label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field" placeholder="City, Country" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>LinkedIn</label>
              <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="input-field" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Website</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="input-field" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              <Code className="w-4 h-4 inline mr-1" /> Skills * (select at least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <button key={s} onClick={() => toggleItem("skills", s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.skills.includes(s) ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" : "var(--bg-secondary)",
                    border: `1px solid ${form.skills.includes(s) ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                    color: form.skills.includes(s) ? "var(--color-brand-500)" : "var(--text-secondary)",
                  }}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              <Heart className="w-4 h-4 inline mr-1" /> Interests * (select at least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleItem("interests", i)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.interests.includes(i) ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" : "var(--bg-secondary)",
                    border: `1px solid ${form.interests.includes(i) ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                    color: form.interests.includes(i) ? "var(--color-brand-500)" : "var(--text-secondary)",
                  }}>{i}</button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit}
            disabled={loading || !form.bio || !form.location || form.skills.length === 0 || form.interests.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
