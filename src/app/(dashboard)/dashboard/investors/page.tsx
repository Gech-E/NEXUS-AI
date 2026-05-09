"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Eye, Rocket, Search, Filter, Loader2,
  Sparkles, X, Shield, AlertTriangle, CheckCircle2,
  BarChart3, Users as UsersIcon, Globe, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";

interface Deal {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  stage: string;
  nexusScore: number;
  fundingSeeking: number;
  teamSize: number;
  founder: string;
}

interface DDReport {
  id: string;
  overallScore: number;
  riskLevel: string;
  strengths: string[];
  risks: string[];
  financialAnalysis: { revenueAssessment: string; burnRate: string; fundingEfficiency: string } | null;
  teamAssessment: { founderFit: string; teamCompleteness: string; executionCapability: string } | null;
  marketAnalysis: { marketSize: string; competitivePosition: string; growthPotential: string } | null;
  recommendation: string;
  aiModel: string | null;
  generatedAt: string;
}

const RISK_BADGE: Record<string, { color: string; bg: string }> = {
  LOW: { color: "var(--color-success-500)", bg: "rgba(16,185,129,0.1)" },
  MEDIUM: { color: "var(--color-warning-500)", bg: "rgba(245,158,11,0.1)" },
  HIGH: { color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  CRITICAL: { color: "var(--color-danger-500)", bg: "rgba(239,68,68,0.1)" },
};

export default function InvestorsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ddModal, setDdModal] = useState<{ startupId: string; name: string } | null>(null);
  const [ddReport, setDdReport] = useState<DDReport | null>(null);
  const [ddLoading, setDdLoading] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = (query?: string) => {
    setLoading(true);
    const url = query ? `/api/investors/feed?search=${encodeURIComponent(query)}` : "/api/investors/feed";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDeals(data);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    fetchDeals(search);
  };

  const openDDReport = async (startupId: string, name: string) => {
    setDdModal({ startupId, name });
    setDdReport(null);
    setDdLoading(true);

    try {
      // First try to get existing report
      const getRes = await fetch(`/api/due-diligence/${startupId}`);
      const getData = await getRes.json();

      if (getData.report) {
        setDdReport(getData.report);
        setDdLoading(false);
        return;
      }

      // Generate new report
      const postRes = await fetch(`/api/due-diligence/${startupId}`, { method: "POST" });
      const postData = await postRes.json();

      if (postData.report) {
        setDdReport(postData.report);
      } else {
        toast.error("Failed to generate DD report");
      }
    } catch {
      toast.error("Failed to generate DD report");
    } finally {
      setDdLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI-Curated Deal Flow</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Startups matched to your investment thesis</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "var(--text-muted)" }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 relative"
            placeholder="Search startups..."
          />
        </div>
        <Button variant="secondary" onClick={handleSearch} className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
        </div>
      ) : deals.length === 0 ? (
        <Card className="text-center py-16">
          <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No startups found</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {search ? "Try a different search term." : "No public startups are available at the moment."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <Card key={deal.id} hoverable className="group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-[var(--color-brand-500)] transition-colors">{deal.name}</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{deal.tagline}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{deal.industry}</span>
                    <span>·</span>
                    <span>{deal.stage.replace("_", " ")}</span>
                    <span>·</span>
                    <span>{deal.teamSize} members</span>
                    <span>·</span>
                    <span>Founded by {deal.founder}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold gradient-text">{deal.nexusScore || "—"}</div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nexus Score</p>
                  {deal.fundingSeeking > 0 && (
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-success-500)" }}>${(deal.fundingSeeking / 1000).toFixed(0)}K</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--border-secondary)" }}>
                <Button className="flex-1 text-sm py-2">Request Intro</Button>
                <Button
                  variant="secondary"
                  className="text-sm py-2 px-4 flex items-center gap-1.5"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); openDDReport(deal.id, deal.name); }}
                >
                  <Sparkles className="w-4 h-4" /> AI Due Diligence
                </Button>
                <Button variant="secondary" className="text-sm py-2 px-4 flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Watchlist
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DD Report Modal */}
      {ddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDdModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border animate-scale-in"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: "var(--color-brand-500)" }} />
                  AI Due Diligence Report
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{ddModal.name}</p>
              </div>
              <button onClick={() => setDdModal(null)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              {ddLoading ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Generating AI due diligence report...</p>
                </div>
              ) : ddReport ? (
                <div className="space-y-6">
                  {/* Score + Risk */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold gradient-text">{ddReport.overallScore}</div>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Overall Score</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full h-3 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${ddReport.overallScore}%`,
                            background: ddReport.overallScore >= 70 ? "var(--color-success-500)" : ddReport.overallScore >= 40 ? "var(--color-warning-500)" : "var(--color-danger-500)",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="text-sm px-3 py-1.5 rounded-full font-semibold"
                      style={{ ...RISK_BADGE[ddReport.riskLevel] || RISK_BADGE.MEDIUM }}
                    >
                      {ddReport.riskLevel} RISK
                    </span>
                  </div>

                  {/* Strengths & Risks */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.05)" }}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-success-500)" }}>
                        <CheckCircle2 className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {(ddReport.strengths as string[]).map((s, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--color-success-500)" }}>•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)" }}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-danger-500)" }}>
                        <AlertTriangle className="w-4 h-4" /> Risks
                      </h4>
                      <ul className="space-y-2">
                        {(ddReport.risks as string[]).map((r, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--color-danger-500)" }}>•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Analysis Sections */}
                  {ddReport.financialAnalysis && (
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" style={{ color: "var(--color-brand-500)" }} /> Financial Analysis
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {Object.entries(ddReport.financialAnalysis).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs font-medium mb-1 capitalize" style={{ color: "var(--text-muted)" }}>
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{val as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ddReport.teamAssessment && (
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" style={{ color: "var(--color-accent-500)" }} /> Team Assessment
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {Object.entries(ddReport.teamAssessment).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs font-medium mb-1 capitalize" style={{ color: "var(--text-muted)" }}>
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{val as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ddReport.marketAnalysis && (
                    <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" style={{ color: "var(--color-success-500)" }} /> Market Analysis
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {Object.entries(ddReport.marketAnalysis).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-xs font-medium mb-1 capitalize" style={{ color: "var(--text-muted)" }}>
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{val as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="rounded-xl p-4 border" style={{ borderColor: "var(--color-brand-500)", background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))" }}>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-brand-500)" }}>
                      <FileText className="w-4 h-4" /> Investment Recommendation
                    </h4>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                      {ddReport.recommendation}
                    </p>
                  </div>

                  <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    Generated {new Date(ddReport.generatedAt).toLocaleDateString()} · AI Model: {ddReport.aiModel || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>Failed to load report</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
