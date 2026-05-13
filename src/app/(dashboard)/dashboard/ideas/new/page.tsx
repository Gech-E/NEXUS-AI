"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Rocket, ArrowRight, ArrowLeft, Sparkles, Target, 
  Lightbulb, Briefcase, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

const STAGES = [
  { id: "IDEA", label: "Idea", desc: "Just a concept" },
  { id: "PRE_SEED", label: "Pre-Seed", desc: "Building MVP" },
  { id: "SEED", label: "Seed", desc: "Early traction" },
  { id: "SERIES_A", label: "Series A", desc: "Scaling revenue" },
  { id: "SERIES_B", label: "Series B", desc: "Market expansion" },
  { id: "GROWTH", label: "Growth", desc: "Late stage" },
];

const INDUSTRIES = [
  "HealthTech", "FinTech", "EdTech", "AgriTech", "AI/ML", "E-Commerce",
  "SaaS", "CleanTech", "BioTech", "IoT", "Gaming", "Social Impact",
  "Logistics", "Cybersecurity", "PropTech", "FoodTech", "LegalTech", "Other",
];

const STEPS = [
  { id: 1, title: "The Basics", icon: Lightbulb },
  { id: 2, title: "Problem & Solution", icon: Target },
  { id: 3, title: "Market & Model", icon: Briefcase },
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

  const renderInput = (label: string, value: string, key: string, placeholder: string, type = "text") => (
    <div className="group relative">
      <label className="block text-sm font-medium mb-2 text-white/70 group-focus-within:text-indigo-400 transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => update(key, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
      />
    </div>
  );

  const renderTextarea = (label: string, value: string, key: string, placeholder: string, minHeight = "min-h-[120px]") => (
    <div className="group relative">
      <label className="block text-sm font-medium mb-2 text-white/70 group-focus-within:text-indigo-400 transition-colors">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-y ${minHeight}`}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto relative min-h-[calc(100vh-80px)] pb-20">
      {/* Ambient Background Orbs */}
      <div className="fixed top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 pt-8 animate-fade-in">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
            Submit Your Startup Idea
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Our AI will evaluate your concept and provide a comprehensive Nexus Score with actionable insights to help you build better.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto px-4">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -z-10 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 -translate-y-1/2 transition-all duration-500 ease-out" 
            style={{ width: \`${((step - 1) / (STEPS.length - 1)) * 100}%\` }}
          />
          
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            
            return (
              <div key={s.id} className="flex flex-col items-center relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-out shadow-lg
                    ${isActive ? "bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/30 scale-110" : 
                      isCompleted ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : 
                      "bg-slate-900 border-white/10 text-white/30"}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className={`absolute -bottom-8 whitespace-nowrap text-xs font-medium transition-colors duration-300
                  ${isActive ? "text-indigo-400" : isCompleted ? "text-white/70" : "text-white/30"}`}
                >
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative group rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-1 overflow-hidden shadow-2xl">
            {/* Animated top border gradient */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="bg-slate-950/50 rounded-xl p-6 md:p-10">
              
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                    <Lightbulb className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-semibold text-white">The Basics</h2>
                  </div>

                  <div className="space-y-6">
                    {renderInput("Startup Name *", form.name, "name", "e.g., NexGen Health")}
                    {renderInput("Tagline", form.tagline, "tagline", "One-line description (e.g., 'AI-powered diagnostics for rural clinics')")}

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white/70">Industry *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {INDUSTRIES.map((ind) => {
                          const isSelected = form.industry === ind;
                          return (
                            <button 
                              key={ind} 
                              type="button" 
                              onClick={() => update("industry", ind)}
                              className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden flex items-center justify-between group
                                ${isSelected 
                                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                } border`}
                            >
                              <span className="relative z-10">{ind}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 relative z-10 animate-in zoom-in" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <label className="block text-sm font-medium text-white/70">Current Stage *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {STAGES.map((s) => {
                          const isSelected = form.stage === s.id;
                          return (
                            <button 
                              key={s.id} 
                              type="button" 
                              onClick={() => update("stage", s.id)}
                              className={`flex flex-col items-start px-4 py-3 rounded-xl transition-all duration-300 border text-left
                                ${isSelected 
                                  ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                            >
                              <span className={`font-semibold text-sm mb-1 ${isSelected ? "text-purple-300" : "text-white/80"}`}>
                                {s.label}
                              </span>
                              <span className={`text-xs ${isSelected ? "text-purple-400/70" : "text-white/40"}`}>
                                {s.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/10">
                    <button 
                      onClick={() => setStep(2)} 
                      disabled={!form.name || !form.industry}
                      className="group flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all"
                    >
                      Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Problem & Solution */}
              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                    <Target className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Problem & Solution</h2>
                  </div>

                  <div className="space-y-6">
                    {renderTextarea(
                      "Problem Statement *", 
                      form.problem, 
                      "problem", 
                      "Describe the core problem you are solving. Who experiences this pain, and how severe is it?"
                    )}
                    
                    {renderTextarea(
                      "Your Solution *", 
                      form.solution, 
                      "solution", 
                      "How does your product or service solve this problem? What makes your approach uniquely effective?"
                    )}

                    {renderTextarea(
                      "Brief Overview *", 
                      form.description, 
                      "description", 
                      "Provide a high-level summary of your startup that could be used as an elevator pitch.",
                      "min-h-[100px]"
                    )}
                  </div>

                  <div className="flex justify-between pt-6 border-t border-white/10">
                    <button 
                      onClick={() => setStep(1)} 
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={() => setStep(3)} 
                      disabled={!form.problem || !form.solution || !form.description}
                      className="group flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all"
                    >
                      Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Market & Model */}
              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Market & Business Model</h2>
                  </div>

                  <div className="space-y-6">
                    {renderTextarea(
                      "Target Market *", 
                      form.targetMarket, 
                      "targetMarket", 
                      "Who are your ideal customers? Please provide estimated market size (TAM, SAM, SOM) if known.",
                      "min-h-[100px]"
                    )}

                    {renderTextarea(
                      "Business Model *", 
                      form.businessModel, 
                      "businessModel", 
                      "How will you generate revenue? (e.g., B2B SaaS subscription, marketplace commission, hardware sales)",
                      "min-h-[100px]"
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInput("Team Size", form.teamSize.toString(), "teamSize", "1", "number")}
                      {renderInput("Funding Seeking ($)", form.fundingSeeking.toString(), "fundingSeeking", "0", "number")}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-white/10">
                    <button 
                      onClick={() => setStep(2)} 
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading || !form.targetMarket || !form.businessModel}
                      className="relative group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all overflow-hidden shadow-lg shadow-indigo-500/25"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                      
                      <div className="relative z-10 flex items-center gap-2">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> Evaluate Idea
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
