"use client";

import { useEffect, useState } from "react";
import { Target, Users, TrendingUp, CheckCircle2, X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

interface MatchData {
  id: string;
  type: string;
  status: string;
  compatibilityScore: number | null;
  aiExplanation: string | null;
  name: string;
  subtitle: string;
  createdAt: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMatches(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (matchId: string, action: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, action }),
      });
      if (res.ok) {
        setMatches((prev) =>
          prev.map((m) => (m.id === matchId ? { ...m, status: action } : m))
        );
        toast.success(action === "ACCEPTED" ? "Match accepted!" : "Match declined");
      } else {
        toast.error("Failed to update match");
      }
    } catch {
      toast.error("Error updating match");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} /> Smart Matches
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>AI-powered connections based on compatibility analysis</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
        </div>
      ) : matches.length === 0 ? (
        <Card className="text-center py-16">
          <Target className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No matches yet</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Submit a startup idea and complete your profile to get AI-powered matches with mentors and investors.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  match.type === "mentor-founder" ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-gradient-to-br from-emerald-500 to-teal-500"
                }`}>
                  {match.type === "mentor-founder" ? <Users className="w-6 h-6 text-white" /> : <TrendingUp className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{match.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                      {match.type === "mentor-founder" ? "Mentor" : match.type === "investor-startup" ? "Investor" : "Co-founder"}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{match.subtitle}</p>
                  {match.aiExplanation && (
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-brand-500)" }} />
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{match.aiExplanation}</p>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold gradient-text">{match.compatibilityScore ? `${Math.round(match.compatibilityScore * 100)}%` : "—"}</div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>match</p>
                </div>
              </div>
              {match.status === "PENDING" && (
                <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--border-secondary)" }}>
                  <Button onClick={() => handleAction(match.id, "ACCEPTED")} className="flex-1 text-sm py-2 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Accept
                  </Button>
                  <Button variant="secondary" onClick={() => handleAction(match.id, "REJECTED")} className="text-sm py-2 px-4 flex items-center gap-2">
                    <X className="w-4 h-4" /> Decline
                  </Button>
                </div>
              )}
              {match.status === "ACCEPTED" && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border-secondary)" }}>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-success-500)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                  <button className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--color-brand-500)" }}>
                    View Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {match.status === "REJECTED" && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-secondary)" }}>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <X className="w-3.5 h-3.5" /> Declined
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
