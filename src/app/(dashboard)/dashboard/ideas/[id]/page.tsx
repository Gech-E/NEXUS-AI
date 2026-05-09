"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Users, Shield, Target, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

export default function IdeaDetailPage() {
  const params = useParams();
  const [startup, setStartup] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetch(`/api/ideas/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setStartup(data);
        setEvaluation(data.evaluations?.[0]);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/ideas/${params.id}/evaluate`, { method: "POST" });
      const data = await res.json();
      setEvaluation(data);
      toast.success("AI evaluation completed!");
    } catch { toast.error("Evaluation failed"); }
    finally { setEvaluating(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} /></div>;
  if (!startup) return <Card className="text-center py-16"><p>Startup not found</p></Card>;

  const scores = [
    { label: "Market", value: evaluation?.marketScore, icon: TrendingUp, color: "#6366f1" },
    { label: "Uniqueness", value: evaluation?.uniquenessScore, icon: Sparkles, color: "#8b5cf6" },
    { label: "Execution", value: evaluation?.executionScore, icon: Target, color: "#10b981" },
    { label: "Viability", value: evaluation?.viabilityScore, icon: BarChart3, color: "#f59e0b" },
    { label: "Team Fit", value: evaluation?.teamFitScore, icon: Users, color: "#ec4899" },
  ];

  const swot = evaluation?.swotAnalysis as any;
  const tam = evaluation?.tamSamSom as any;
  const risks = evaluation?.riskAssessment as any[];
  const recs = evaluation?.recommendations as string[];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{startup.name}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{startup.tagline || `${startup.industry} · ${startup.stage}`}</p>
        </div>
        <div className="flex gap-2">
          {evaluation?.status === "COMPLETED" && (
            <Button variant="secondary" href={`/dashboard/ideas/${params.id}/export`} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          )}
          {(!evaluation || evaluation.status !== "COMPLETED") && (
            <Button onClick={runEvaluation} disabled={evaluating} className="flex items-center gap-2">
              {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {evaluating ? "Evaluating..." : "Run AI Evaluation"}
            </Button>
          )}
        </div>
      </div>

      {evaluation?.status === "COMPLETED" ? (
        <>
          {/* Nexus Score */}
          <Card className="mb-6 text-center py-8">
            <p className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Nexus Score</p>
            <div className="text-6xl font-bold gradient-text mb-2">{evaluation.nexusScore}</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              out of 100 · Confidence: {Math.round((evaluation.confidence || 0) * 100)}%
            </p>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {scores.map((s) => (
              <Card key={s.label} className="text-center py-4">
                <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value || 0}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* SWOT */}
          {swot && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { title: "Strengths", items: swot.strengths, color: "var(--color-success-500)" },
                { title: "Weaknesses", items: swot.weaknesses, color: "var(--color-danger-500)" },
                { title: "Opportunities", items: swot.opportunities, color: "var(--color-brand-500)" },
                { title: "Threats", items: swot.threats, color: "var(--color-warning-500)" },
              ].map((s) => (
                <Card key={s.title}>
                  <h3 className="font-semibold mb-3" style={{ color: s.color }}>{s.title}</h3>
                  <ul className="space-y-2">
                    {s.items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: s.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}

          {/* TAM/SAM/SOM */}
          {tam && (
            <Card className="mb-6">
              <h3 className="font-semibold mb-4">Market Sizing (TAM/SAM/SOM)</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "TAM", desc: tam.tam, val: tam.tamValue },
                  { label: "SAM", desc: tam.sam, val: tam.samValue },
                  { label: "SOM", desc: tam.som, val: tam.somValue },
                ].map((m) => (
                  <div key={m.label} className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    <div className="text-xs font-bold mb-1" style={{ color: "var(--color-brand-500)" }}>{m.label}</div>
                    <div className="text-lg font-bold">${(m.val / 1e9).toFixed(1)}B</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {recs && (
            <Card className="mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} /> Recommendations
              </h3>
              <ol className="space-y-3">
                {recs.map((r: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Risk Assessment */}
          {risks && (
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: "var(--color-warning-500)" }} /> Risk Assessment
              </h3>
              <div className="space-y-3">
                {risks.map((r: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: r.severity === "high" ? "var(--color-danger-500)" : r.severity === "medium" ? "var(--color-warning-500)" : "var(--color-success-500)" }} />
                    <div>
                      <p className="text-sm font-medium">{r.risk}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Mitigation: {r.mitigation}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-auto flex-shrink-0" style={{
                      background: r.severity === "high" ? "rgba(239,68,68,0.1)" : r.severity === "medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                      color: r.severity === "high" ? "var(--color-danger-500)" : r.severity === "medium" ? "var(--color-warning-500)" : "var(--color-success-500)",
                    }}>{r.severity}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="text-center py-16">
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">AI Evaluation Pending</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Click &quot;Run AI Evaluation&quot; to get your Nexus Score and insights.</p>
        </Card>
      )}
    </div>
  );
}
