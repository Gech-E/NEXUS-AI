"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lightbulb, TrendingUp, Users, Target, BarChart3, MessageSquare,
  ArrowUpRight, Sparkles, Rocket, Clock, CheckCircle2,
  PlusCircle, Zap, Star, Eye, Loader2, Bell, Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { StatCard } from "@/components/dashboard/StatCard/StatCard";
import { QuickAction } from "@/components/dashboard/QuickAction/QuickAction";
import { ActivityItem } from "@/components/dashboard/ActivityItem/ActivityItem";
import { Card } from "@/components/ui/Card/Card";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

const NOTIF_ICONS: Record<string, React.ElementType> = {
  EVALUATION: Sparkles,
  MATCH: Target,
  SESSION: Calendar,
  MILESTONE: CheckCircle2,
  MESSAGE: MessageSquare,
  SYSTEM: Bell,
};

const NOTIF_COLORS: Record<string, string> = {
  EVALUATION: "var(--color-brand-500)",
  MATCH: "var(--color-accent-500)",
  SESSION: "var(--color-success-500)",
  MILESTONE: "var(--color-warning-500)",
  MESSAGE: "var(--color-brand-500)",
  SYSTEM: "var(--text-muted)",
};

function FounderDashboard({ data, loading }: { data: any; loading: boolean }) {
  const stats = data?.stats;
  const activity = data?.recentActivity || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Ideas Submitted" value={stats?.ideasSubmitted ?? 0} icon={Lightbulb} loading={loading} />
        <StatCard title="Avg Nexus Score" value={stats?.avgNexusScore ?? 0} icon={BarChart3} loading={loading} />
        <StatCard title="Active Matches" value={stats?.activeMatches ?? 0} icon={Target} loading={loading} />
        <StatCard title="Milestones Done" value={stats ? `${stats.completedMilestones}/${stats.totalMilestones}` : "0/0"} icon={CheckCircle2} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction href="/dashboard/ideas/new" icon={PlusCircle} label="Submit New Idea" gradient="from-indigo-500 to-purple-500" />
            <QuickAction href="/dashboard/chatbot" icon={MessageSquare} label="Ask AI Mentor" gradient="from-purple-500 to-pink-500" />
            <QuickAction href="/dashboard/matches" icon={Target} label="View Matches" gradient="from-emerald-500 to-teal-500" />
            <QuickAction href="/dashboard/mentors" icon={Users} label="Find a Mentor" gradient="from-amber-500 to-orange-500" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <Card>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No recent activity</p>
            ) : (
              activity.map((a: any, i: number) => (
                <ActivityItem
                  key={i}
                  icon={NOTIF_ICONS[a.type] || Bell}
                  title={a.title || a.message}
                  time={formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  color={NOTIF_COLORS[a.type] || "var(--text-muted)"}
                />
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function MentorDashboard({ data, loading }: { data: any; loading: boolean }) {
  const stats = data?.stats;
  const upcoming = data?.upcomingSessions || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Mentees" value={stats?.activeMentees ?? 0} icon={Users} loading={loading} />
        <StatCard title="Sessions This Month" value={stats?.sessionsThisMonth ?? 0} icon={Clock} loading={loading} />
        <StatCard title="Avg Rating" value={stats?.avgRating?.toFixed(1) ?? "0.0"} icon={Star} loading={loading} />
        <StatCard title="Total Sessions" value={stats?.totalSessions ?? 0} icon={BarChart3} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction href="/dashboard/matches" icon={Target} label="Review Match Requests" gradient="from-indigo-500 to-purple-500" />
            <QuickAction href="/dashboard/chatbot" icon={MessageSquare} label="AI Assistant" gradient="from-purple-500 to-pink-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          <Card>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No upcoming sessions</p>
            ) : (
              upcoming.map((s: any) => (
                <ActivityItem
                  key={s.id}
                  icon={Clock}
                  title={s.title}
                  time={new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  color="var(--color-brand-500)"
                />
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function InvestorDashboard({ data, loading }: { data: any; loading: boolean }) {
  const stats = data?.stats;
  const topStartups = data?.topStartups || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Deal Flow" value={stats?.dealFlow ?? 0} icon={TrendingUp} loading={loading} />
        <StatCard title="Watchlist" value={stats?.watchlist ?? 0} icon={Eye} loading={loading} />
        <StatCard title="Avg Nexus Score" value={stats?.avgNexusScore ?? 0} icon={BarChart3} loading={loading} />
        <StatCard title="Intro Requests" value={stats?.introRequests ?? 0} icon={Zap} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction href="/dashboard/investors" icon={TrendingUp} label="Browse Deal Flow" gradient="from-emerald-500 to-teal-500" />
            <QuickAction href="/dashboard/chatbot" icon={MessageSquare} label="AI Due Diligence" gradient="from-purple-500 to-pink-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Startups</h3>
          <Card>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
              </div>
            ) : topStartups.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No startups available yet</p>
            ) : (
              topStartups.map((s: any) => (
                <ActivityItem
                  key={s.id}
                  icon={Rocket}
                  title={`${s.name} — Nexus Score: ${s.nexusScore || "N/A"}`}
                  time={`${s.stage.replace("_", " ")} · ${s.industry}`}
                  color="var(--color-success-500)"
                />
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function AdminDashboard({ data, loading }: { data: any; loading: boolean }) {
  const stats = data?.stats;
  const activity = data?.recentActivity || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() ?? 0} icon={Users} loading={loading} />
        <StatCard title="Active Startups" value={stats?.activeStartups ?? 0} icon={Rocket} loading={loading} />
        <StatCard title="AI Evaluations" value={stats?.totalEvaluations ?? 0} icon={Sparkles} loading={loading} />
        <StatCard title="Platform Health" value={`${stats?.platformHealth ?? 99.9}%`} icon={Zap} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction href="/dashboard/admin" icon={Users} label="Manage Users" gradient="from-indigo-500 to-purple-500" />
            <QuickAction href="/dashboard/admin" icon={BarChart3} label="Platform Analytics" gradient="from-emerald-500 to-teal-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">System Activity</h3>
          <Card>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No recent system activity</p>
            ) : (
              activity.map((a: any, i: number) => (
                <ActivityItem
                  key={i}
                  icon={NOTIF_ICONS[a.type] || Bell}
                  title={a.title}
                  time={formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  color={NOTIF_COLORS[a.type] || "var(--text-muted)"}
                />
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "FOUNDER";
  const userName = session?.user?.name?.split(" ")[0] || "there";
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setDashData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {userName} 👋</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s what&apos;s happening with your {userRole === "FOUNDER" ? "startup" : userRole === "MENTOR" ? "mentees" : userRole === "INVESTOR" ? "portfolio" : "platform"} today.
        </p>
      </div>

      {userRole === "FOUNDER" && <FounderDashboard data={dashData} loading={loading} />}
      {userRole === "MENTOR" && <MentorDashboard data={dashData} loading={loading} />}
      {userRole === "INVESTOR" && <InvestorDashboard data={dashData} loading={loading} />}
      {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && <AdminDashboard data={dashData} loading={loading} />}
    </div>
  );
}
