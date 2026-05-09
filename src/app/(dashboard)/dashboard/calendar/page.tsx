"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, XCircle, AlertCircle, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { format, isSameDay, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

export default function CalendarPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
        setLoading(false);
      });
  }, []);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth();
  const firstDayOfWeek = startOfWeek(days[0]).getDay();

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} /> Calendar
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage your mentor sessions and availability</p>
        </div>
        {role === "FOUNDER" && (
          <Button href="/dashboard/mentors" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Book Session
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold mb-4">Upcoming Sessions</h2>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : sessions.length === 0 ? (
            <Card className="text-center py-8">
              <CalendarIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No upcoming sessions</p>
            </Card>
          ) : (
            sessions.map((s) => (
              <Card key={s.id} hoverable className="p-4 group transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    s.status === "SCHEDULED" ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)]" :
                    s.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(s.scheduledAt), "MMM d, yyyy 'at' h:mm a")} ({s.duration} min)
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Video className="w-3.5 h-3.5" />
                    {s.meetingUrl ? <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="text-[var(--color-brand-500)] hover:underline">Join Meeting</a> : "TBD"}
                  </div>
                </div>
                {s.paymentStatus === "PENDING" && (
                  <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg mt-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Payment pending
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentDate(addDays(currentDate, -30))} className="px-3 py-1 text-sm">&lt;</Button>
              <Button variant="secondary" onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm">Today</Button>
              <Button variant="secondary" onClick={() => setCurrentDate(addDays(currentDate, 30))} className="px-3 py-1 text-sm">&gt;</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-xs font-semibold py-2" style={{ color: "var(--text-muted)" }}>{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 h-20 rounded-xl" style={{ background: "var(--bg-secondary)", opacity: 0.5 }} />
            ))}
            {days.map(day => {
              const daySessions = sessions.filter(s => isSameDay(new Date(s.scheduledAt), day));
              const today = isToday(day);
              
              return (
                <div key={day.toString()} className={`p-2 h-20 rounded-xl border relative transition-colors ${
                  today ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5" : "border-[var(--border-primary)] hover:border-[var(--text-muted)]"
                }`}>
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${today ? "bg-[var(--color-brand-500)] text-white" : ""}`}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                    {daySessions.map((s, i) => i < 2 && (
                      <div key={s.id} className="text-[9px] truncate px-1.5 py-0.5 rounded" style={{ background: "var(--color-brand-600)", color: "white" }}>
                        {format(new Date(s.scheduledAt), "h:mm a")}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-[9px] text-[var(--text-muted)]">+{daySessions.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
