"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Video, Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
  Sparkles, ChevronDown, ChevronUp, ListChecks, Tags, FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  videoRoomId: string | null;
  notes: string | null;
  rating: number | null;
  mentor: {
    id: string;
    user: { name: string | null; image: string | null };
  };
}

interface SessionNoteData {
  id: string;
  summary: string;
  actionItems: string[];
  keyTopics: string[];
  aiModel: string | null;
  generatedAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  SCHEDULED: { color: "var(--color-brand-500)", bg: "rgba(99,102,241,0.1)", icon: Clock, label: "Scheduled" },
  IN_PROGRESS: { color: "var(--color-warning-500)", bg: "rgba(245,158,11,0.1)", icon: Video, label: "In Progress" },
  COMPLETED: { color: "var(--color-success-500)", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2, label: "Completed" },
  CANCELLED: { color: "var(--text-muted)", bg: "var(--bg-tertiary)", icon: XCircle, label: "Cancelled" },
  NO_SHOW: { color: "var(--color-danger-500)", bg: "rgba(239,68,68,0.1)", icon: AlertCircle, label: "No Show" },
};

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, SessionNoteData | null>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [loadingNotesId, setLoadingNotesId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sessionId);

    // Load notes if not already loaded
    if (notesMap[sessionId] === undefined) {
      setLoadingNotesId(sessionId);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/notes`);
        const data = await res.json();
        setNotesMap((prev) => ({ ...prev, [sessionId]: data.note }));
      } catch {
        setNotesMap((prev) => ({ ...prev, [sessionId]: null }));
      } finally {
        setLoadingNotesId(null);
      }
    }
  };

  const generateNotes = async (sessionId: string) => {
    setGeneratingId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/notes`, { method: "POST" });
      const data = await res.json();
      if (data.note) {
        setNotesMap((prev) => ({ ...prev, [sessionId]: data.note }));
      }
    } catch {
      // silent
    } finally {
      setGeneratingId(null);
    }
  };

  const upcoming = sessions.filter(s => s.status === "SCHEDULED" || s.status === "IN_PROGRESS");
  const past = sessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "NO_SHOW");

  if (loading) {
    return (
      <div className="flex justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your mentor sessions and AI-generated notes
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-16">
          <Video className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2">No sessions yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Book a session with a mentor to get started.
          </p>
          <Link href="/dashboard/mentors">
            <Button>Find a Mentor</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Upcoming Sessions */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: "var(--color-brand-500)" }} />
                Upcoming Sessions
              </h2>
              <div className="space-y-3">
                {upcoming.map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig.SCHEDULED;
                  return (
                    <Card key={s.id} hoverable className="group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <cfg.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{s.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            <span>with {s.mentor.user.name || "Mentor"}</span>
                            <span>·</span>
                            <span>{new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            <span>·</span>
                            <span>{s.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {s.status === "SCHEDULED" && (
                            <Link href={`/dashboard/sessions/${s.id}/video`}>
                              <Button className="text-sm py-2 px-4 flex items-center gap-1.5">
                                <Video className="w-4 h-4" /> Join
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: "var(--color-success-500)" }} />
                Past Sessions
              </h2>
              <div className="space-y-3">
                {past.map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig.COMPLETED;
                  const isExpanded = expandedId === s.id;
                  const note = notesMap[s.id];
                  const isLoadingNotes = loadingNotesId === s.id;
                  const isGenerating = generatingId === s.id;

                  return (
                    <Card key={s.id} className="overflow-hidden">
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => toggleExpand(s.id)}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <cfg.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{s.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            <span>with {s.mentor.user.name || "Mentor"}</span>
                            <span>·</span>
                            <span>{new Date(s.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span>·</span>
                            <span>{s.duration} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {note && (
                            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(99,102,241,0.1)", color: "var(--color-brand-500)" }}>
                              <Sparkles className="w-3 h-3" /> AI Notes
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t animate-slide-down" style={{ borderColor: "var(--border-secondary)" }}>
                          {isLoadingNotes ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-brand-500)" }} />
                            </div>
                          ) : note ? (
                            <div className="space-y-4">
                              {/* AI Summary */}
                              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-sm">AI Session Summary</h4>
                                  <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                                    {new Date(note.generatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                  {note.summary}
                                </p>
                              </div>

                              {/* Key Topics */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Tags className="w-4 h-4" style={{ color: "var(--color-accent-500)" }} /> Key Topics
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {(note.keyTopics as string[]).map((topic, i) => (
                                    <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                                      style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Action Items */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <ListChecks className="w-4 h-4" style={{ color: "var(--color-success-500)" }} /> Action Items
                                </h4>
                                <div className="space-y-2">
                                  {(note.actionItems as string[]).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm rounded-lg px-3 py-2.5"
                                      style={{ background: "var(--bg-secondary)" }}>
                                      <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                                        style={{ borderColor: "var(--color-success-500)" }} />
                                      <span style={{ color: "var(--text-secondary)" }}>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : s.status === "COMPLETED" ? (
                            <div className="text-center py-6">
                              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                                No AI notes generated for this session yet.
                              </p>
                              <Button
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); generateNotes(s.id); }}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2"
                              >
                                {isGenerating ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                  <><Sparkles className="w-4 h-4" /> Generate AI Notes</>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                              Notes are only available for completed sessions.
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
