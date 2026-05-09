"use client";

import { useEffect, useState } from "react";
import {
  Shield, Users, Rocket, BarChart3, Sparkles, TrendingUp,
  CheckCircle2, Loader2, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

interface RiskScoreEntry {
  id: string;
  riskScore: number;
  riskLevel: string;
  factors: Record<string, { score: number; weight: number; detail: string }>;
  lastCalculatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    lastLoginAt: string | null;
    createdAt: string;
  };
}

const RISK_COLORS: Record<string, { color: string; bg: string }> = {
  LOW: { color: "var(--color-success-500)", bg: "rgba(16,185,129,0.1)" },
  MEDIUM: { color: "var(--color-warning-500)", bg: "rgba(245,158,11,0.1)" },
  HIGH: { color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  CRITICAL: { color: "var(--color-danger-500)", bg: "rgba(239,68,68,0.1)" },
};

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Risk section state
  const [riskData, setRiskData] = useState<{ riskScores: RiskScoreEntry[]; stats: any } | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "risk">("overview");

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const fetchRiskScores = async () => {
    setRiskLoading(true);
    try {
      const res = await fetch("/api/analytics/risk-scores");
      const data = await res.json();
      setRiskData(data);
    } catch {
      // silent
    } finally {
      setRiskLoading(false);
    }
  };

  const recalculateScores = async () => {
    setRecalculating(true);
    try {
      await fetch("/api/analytics/risk-scores", { method: "POST" });
      await fetchRiskScores();
    } catch {
      // silent
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (activeTab === "risk" && !riskData) {
      fetchRiskScores();
    }
  }, [activeTab]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)]" /></div>;
  if (stats?.error) return <div className="p-12 text-center text-red-500">{stats.error}</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} /> Admin Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Platform management and advanced analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeTab === "overview" ? "var(--bg-card)" : "transparent",
            color: activeTab === "overview" ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow: activeTab === "overview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab("risk")}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: activeTab === "risk" ? "var(--bg-card)" : "transparent",
            color: activeTab === "risk" ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow: activeTab === "risk" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <AlertTriangle className="w-4 h-4" /> Dropout Risk
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* AI Summary */}
          <Card className="mb-8 border-[var(--color-brand-500)] bg-gradient-to-r from-[var(--color-brand-500)]/5 to-[var(--color-accent-500)]/5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-2 text-[var(--color-brand-500)]">
              <Sparkles className="w-4 h-4" /> AI Platform Summary
            </h2>
            <p className="text-sm leading-relaxed">{stats.aiSummary}</p>
          </Card>

          {/* Platform stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users },
              { label: "Active Startups", value: stats.activeStartups, icon: Rocket },
              { label: "AI Evaluations", value: stats.totalEvaluations, icon: Sparkles },
              { label: "Mentor Sessions", value: stats.totalSessions, icon: TrendingUp },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5" style={{ color: "var(--color-brand-500)" }} />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Activity table */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Recent Platform Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-secondary)" }}>Metric</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-secondary)" }}>Value</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-secondary)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b last:border-0" style={{ borderColor: "var(--border-secondary)" }}>
                    <td className="py-3 px-2 font-medium">Completed Sessions</td>
                    <td className="py-3 px-2">{stats.completedSessions}</td>
                    <td className="py-3 px-2 text-[var(--color-success-500)] flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Healthy</td>
                  </tr>
                  <tr className="border-b last:border-0" style={{ borderColor: "var(--border-secondary)" }}>
                    <td className="py-3 px-2 font-medium">Smart Matches</td>
                    <td className="py-3 px-2">{stats.totalMatches}</td>
                    <td className="py-3 px-2 text-[var(--color-success-500)] flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>Healthy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "risk" && (
        <div className="space-y-6">
          {/* Header + Recalculate */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: "var(--color-warning-500)" }} />
                Founder Dropout Risk Monitor
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                AI-powered risk scoring across milestone completion, engagement, and attendance
              </p>
            </div>
            <Button
              onClick={recalculateScores}
              disabled={recalculating}
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {recalculating ? "Calculating..." : "Recalculate All"}
            </Button>
          </div>

          {riskLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
            </div>
          ) : !riskData || riskData.riskScores.length === 0 ? (
            <Card className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No risk scores calculated</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Click &quot;Recalculate All&quot; to analyze dropout risk for all founders.
              </p>
              <Button onClick={recalculateScores} disabled={recalculating} className="inline-flex items-center gap-2">
                {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Calculate Risk Scores
              </Button>
            </Card>
          ) : (
            <>
              {/* Risk Distribution Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { level: "LOW", label: "Low Risk", count: riskData.stats.distribution.low },
                  { level: "MEDIUM", label: "Medium Risk", count: riskData.stats.distribution.medium },
                  { level: "HIGH", label: "High Risk", count: riskData.stats.distribution.high },
                  { level: "CRITICAL", label: "Critical", count: riskData.stats.distribution.critical },
                ].map(({ level, label, count }) => {
                  const colors = RISK_COLORS[level];
                  return (
                    <Card key={level}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: colors.color }} />
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: colors.color }}>{count}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {riskData.stats.scoredFounders > 0
                          ? `${Math.round((count / riskData.stats.scoredFounders) * 100)}% of founders`
                          : "—"}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Risk Table */}
              <Card>
                <h3 className="font-semibold mb-4">Founders by Risk Score</h3>
                <div className="space-y-2">
                  {riskData.riskScores.map((entry) => {
                    const colors = RISK_COLORS[entry.riskLevel] || RISK_COLORS.LOW;
                    const isExpanded = expandedRiskId === entry.id;

                    return (
                      <div key={entry.id} className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-secondary)" }}>
                        <div
                          className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                          onClick={() => setExpandedRiskId(isExpanded ? null : entry.id)}
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500))` }}>
                            {entry.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{entry.user.name || "Unknown"}</p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{entry.user.email}</p>
                          </div>

                          {/* Risk Score Bar */}
                          <div className="hidden sm:flex items-center gap-3 flex-shrink-0" style={{ width: 160 }}>
                            <div className="flex-1 h-2 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${entry.riskScore}%`, background: colors.color }}
                              />
                            </div>
                            <span className="text-sm font-bold w-8 text-right" style={{ color: colors.color }}>
                              {entry.riskScore}
                            </span>
                          </div>

                          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                            style={{ background: colors.bg, color: colors.color }}>
                            {entry.riskLevel}
                          </span>

                          {isExpanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />}
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 animate-slide-down">
                            <div className="pt-3 border-t space-y-3" style={{ borderColor: "var(--border-secondary)" }}>
                              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                                Last calculated: {new Date(entry.lastCalculatedAt).toLocaleString()}
                              </p>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(entry.factors).map(([key, factor]: [string, any]) => {
                                  const factorColor = factor.score >= 75 ? "var(--color-danger-500)" : factor.score >= 50 ? "#f97316" : factor.score >= 25 ? "var(--color-warning-500)" : "var(--color-success-500)";
                                  const labels: Record<string, string> = {
                                    milestoneCompletion: "Milestone Completion",
                                    chatbotEngagement: "Chatbot Engagement",
                                    overdueMilestones: "Overdue Milestones",
                                    sessionAttendance: "Session Attendance",
                                    loginRecency: "Login Recency",
                                  };
                                  return (
                                    <div key={key} className="rounded-lg p-3" style={{ background: "var(--bg-secondary)" }}>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium">{labels[key] || key}</span>
                                        <span className="text-xs font-bold" style={{ color: factorColor }}>
                                          {factor.score}/100
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 rounded-full mb-2" style={{ background: "var(--bg-tertiary)" }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${factor.score}%`, background: factorColor }} />
                                      </div>
                                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{factor.detail}</p>
                                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Weight: {(factor.weight * 100).toFixed(0)}%</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
