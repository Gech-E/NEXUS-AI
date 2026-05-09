"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, ArrowRight, Sparkles, Clock, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

interface Startup {
  id: string;
  name: string;
  tagline?: string;
  industry: string;
  stage: string;
  createdAt: string;
  evaluations: Array<{ status: string; nexusScore?: number }>;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas).finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status?: string) => {
    if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success-500)" }} />;
    if (status === "PROCESSING") return <Clock className="w-4 h-4 animate-spin" style={{ color: "var(--color-warning-500)" }} />;
    if (status === "FAILED") return <AlertCircle className="w-4 h-4" style={{ color: "var(--color-danger-500)" }} />;
    return <Clock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />;
  };

  const getScoreBg = (score?: number) => {
    if (!score) return "var(--bg-tertiary)";
    if (score >= 80) return "rgba(16,185,129,0.15)";
    if (score >= 60) return "rgba(245,158,11,0.15)";
    return "rgba(239,68,68,0.15)";
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "var(--text-muted)";
    if (score >= 80) return "var(--color-success-500)";
    if (score >= 60) return "var(--color-warning-500)";
    return "var(--color-danger-500)";
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Ideas</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Track and manage your startup ideas</p>
        </div>
        <Button href="/dashboard/ideas/new" className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Idea
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-28 w-full" />))}
        </div>
      ) : ideas.length === 0 ? (
        <Card className="text-center py-16">
          <Lightbulb className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No ideas yet</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Submit your first startup idea to get AI-powered evaluation.</p>
          <Button href="/dashboard/ideas/new" className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Submit Your First Idea
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => {
            const eval_ = idea.evaluations?.[0];
            return (
              <Link key={idea.id} href={`/dashboard/ideas/${idea.id}`} className="block group">
                <Card hoverable className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}>
                    <Lightbulb className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-[var(--color-brand-500)] transition-colors">{idea.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {idea.industry} · {idea.stage.replace("_", " ")} · {new Date(idea.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {eval_ && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(eval_.status)}
                        {eval_.nexusScore != null && (
                          <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: getScoreBg(eval_.nexusScore), color: getScoreColor(eval_.nexusScore) }}>
                            {eval_.nexusScore}
                          </span>
                        )}
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
