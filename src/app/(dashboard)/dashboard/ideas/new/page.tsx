"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Rocket, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";

const STAGES = ["IDEA", "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "GROWTH"];
const INDUSTRIES = [
  "HealthTech", "FinTech", "EdTech", "AgriTech", "AI/ML", "E-Commerce",
  "SaaS", "CleanTech", "BioTech", "IoT", "Gaming", "Social Impact",
  "Logistics", "Cybersecurity", "PropTech", "FoodTech", "LegalTech", "Other",
];

export default function SubmitIdeaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", tagline: "", description: "", problem: "", solution: "",
    targetMarket: "", businessModel: "", stage: "IDEA", industry: "",
    techStack: [] as string[], teamSize: 1, fundingSeeking: 0,
  });

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();
      toast.success("Idea submitted! Starting AI evaluation...");
      router.push(`/dashboard/ideas/${data.id}`);
    } catch {
      toast.error("Failed to submit idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
          Submit Your Startup Idea
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Our AI will evaluate your idea and provide a comprehensive Nexus Score with actionable insights.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{
            background: s <= step ? "linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))" : "var(--bg-tertiary)",
          }} />
        ))}
      </div>

      <Card>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Startup Name *</label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., NexGen Health" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Tagline</label>
              <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="One-line description of your startup" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Industry *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button key={ind} type="button" onClick={() => update("industry", ind)}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: form.industry === ind ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" : "var(--bg-secondary)",
                      border: `1px solid ${form.industry === ind ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                      color: form.industry === ind ? "var(--color-brand-500)" : "var(--text-secondary)",
                    }}
                  >{ind}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Stage *</label>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map((s) => (
                  <button key={s} type="button" onClick={() => update("stage", s)}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: form.stage === s ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" : "var(--bg-secondary)",
                      border: `1px solid ${form.stage === s ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                      color: form.stage === s ? "var(--color-brand-500)" : "var(--text-secondary)",
                    }}
                  >{s.replace("_", " ")}</button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!form.name || !form.industry}
                className="flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Problem & Solution */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-semibold">Problem & Solution</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Problem Statement *</label>
              <textarea value={form.problem} onChange={(e) => update("problem", e.target.value)}
                className="input-field min-h-[100px]" placeholder="What problem are you solving? Who experiences it?" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Your Solution *</label>
              <textarea value={form.solution} onChange={(e) => update("solution", e.target.value)}
                className="input-field min-h-[100px]" placeholder="How does your product solve this problem?" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description *</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                className="input-field min-h-[80px]" placeholder="Brief overview of your startup" />
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!form.problem || !form.solution || !form.description}
                className="flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Market & Model */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-semibold">Market & Business Model</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Target Market *</label>
              <textarea value={form.targetMarket} onChange={(e) => update("targetMarket", e.target.value)}
                className="input-field min-h-[80px]" placeholder="Who are your target customers? Market size?" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Business Model *</label>
              <textarea value={form.businessModel} onChange={(e) => update("businessModel", e.target.value)}
                className="input-field min-h-[80px]" placeholder="How will you make money? Revenue streams?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Team Size</label>
                <Input type="number" value={form.teamSize} onChange={(e) => update("teamSize", parseInt(e.target.value) || 1)} min={1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Funding Seeking ($)</label>
                <Input type="number" value={form.fundingSeeking} onChange={(e) => update("fundingSeeking", parseInt(e.target.value) || 0)} min={0} />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !form.targetMarket || !form.businessModel}
                className="flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4" /> Submit & Evaluate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
