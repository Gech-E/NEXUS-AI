"use client";

import { useEffect, useState } from "react";
import { Milestone as MilestoneIcon, CheckCircle2, Clock, AlertCircle, PlusCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";

interface MilestoneData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  dueDate: string | null;
  completedAt: string | null;
  startupId: string;
}

const statusColors: Record<string, string> = {
  COMPLETED: "var(--color-success-500)",
  IN_PROGRESS: "var(--color-brand-500)",
  NOT_STARTED: "var(--text-muted)",
  OVERDUE: "var(--color-danger-500)",
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/milestones")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMilestones(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = milestones.filter((m) => m.status === "COMPLETED").length;
  const total = milestones.length;
  const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleStatusUpdate = async (milestoneId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/milestones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          status: newStatus,
          progress: newStatus === "COMPLETED" ? 100 : newStatus === "IN_PROGRESS" ? 50 : 0,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMilestones((prev) =>
          prev.map((m) => (m.id === milestoneId ? { ...m, ...updated } : m))
        );
      }
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Milestones</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Track your startup progress</p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <Card className="text-center py-16">
          <MilestoneIcon className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No milestones yet</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Submit a startup idea first, then add milestones to track your progress.
          </p>
        </Card>
      ) : (
        <>
          {/* Progress overview */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold gradient-text">{overallProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div className="h-full rounded-full gradient-bg transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {completed} of {total} milestone{total !== 1 ? "s" : ""} completed
            </p>
          </Card>

          <div className="space-y-4">
            {milestones.map((m, i) => (
              <Card key={m.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: m.status === "COMPLETED" ? "rgba(16,185,129,0.1)" : m.status === "IN_PROGRESS" ? "rgba(99,102,241,0.1)" : "var(--bg-tertiary)",
                    color: statusColors[m.status] || statusColors.NOT_STARTED,
                  }}>
                    {m.status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5" /> : m.status === "IN_PROGRESS" ? <Clock className="w-5 h-5" /> : <MilestoneIcon className="w-5 h-5" />}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-8 mt-2" style={{ background: "var(--border-primary)" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{m.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: `${statusColors[m.status] || statusColors.NOT_STARTED}15`,
                        color: statusColors[m.status] || statusColors.NOT_STARTED,
                      }}>{m.status.replace("_", " ")}</span>
                      {m.status !== "COMPLETED" && (
                        <select
                          value={m.status}
                          onChange={(e) => handleStatusUpdate(m.id, e.target.value)}
                          className="text-xs px-1 py-0.5 rounded border bg-transparent cursor-pointer"
                          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {m.description && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{m.description}</p>
                  )}
                  {m.status === "IN_PROGRESS" && (
                     <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                        <span>Progress</span><span>{m.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                        <div className="h-full rounded-full gradient-bg transition-all" style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {m.dueDate && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
