"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Gift, Copy, CheckCircle2, Share2, Users, Loader2, Award,
  Clock, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

interface ReferralStats {
  totalReferred: number;
  completed: number;
  pending: number;
}

interface ReferralHistory {
  id: string;
  code: string;
  status: string;
  referred: {
    name: string | null;
    email: string;
    joinedAt: string;
    onboarded: boolean;
  } | null;
  createdAt: string;
  completedAt: string | null;
}

export default function ReferralsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ totalReferred: 0, completed: 0, pending: 0 });
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      if (data.referralCode) setReferralCode(data.referralCode);
      if (data.stats) setStats(data.stats);
      if (data.referrals) setHistory(data.referrals);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      const data = await res.json();
      if (data.referralCode) {
        setReferralCode(data.referralCode);
        toast.success("Referral code generated!");
      }
    } catch {
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for non-HTTPS contexts (e.g. localhost)
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success("Referral link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : "";

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} /> Refer & Earn
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Invite founders and mentors to Nexus AI. Earn premium features and credits when they join and onboard.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Main Invite Card */}
        <Card className="lg:col-span-2 border-[var(--color-brand-500)] bg-gradient-to-br from-[var(--color-brand-500)]/5 to-[var(--color-accent-500)]/5 p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg shadow-[var(--color-brand-500)]/20">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Share the Magic of Nexus AI</h2>
          <p className="text-sm mb-8 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Give your network an edge. For every user that signs up and completes onboarding using your link, you'll both receive exclusive platform perks.
          </p>

          {!referralCode ? (
            <Button onClick={generateCode} disabled={generating} className="px-8 py-3 text-base flex items-center gap-2">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
              Generate My Link
            </Button>
          ) : (
            <div className="w-full max-w-md space-y-3">
              <label className="text-sm font-semibold text-left block w-full" style={{ color: "var(--text-secondary)" }}>
                Your Unique Invite Link
              </label>
              <div className="flex items-center">
                <div className="flex-1 px-4 py-3 rounded-l-xl border border-r-0 bg-[var(--bg-card)] font-mono text-sm truncate select-all" style={{ borderColor: "var(--color-brand-500)" }}>
                  {referralLink}
                </div>
                <Button onClick={copyLink} className="rounded-l-none py-3 px-6 h-[46px] flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copy
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", color: "var(--color-brand-500)" }}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Total Invited</p>
              <p className="text-2xl font-bold">{stats.totalReferred}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success-500)" }}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Completed Onboarding</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", color: "var(--color-warning-500)" }}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Rewards Earned</p>
              <p className="text-2xl font-bold">{stats.completed * 50} <span className="text-sm font-normal text-muted">credits</span></p>
            </div>
          </Card>
        </div>
      </div>

      {/* History */}
      <h3 className="text-lg font-bold mb-4">Referral History</h3>
      {history.length === 0 ? (
        <Card className="text-center py-12">
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No referrals yet. Share your link to start earning!
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-secondary)", color: "var(--text-muted)" }}>
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-secondary)" }}>
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {item.referred ? (
                        <div>
                          <div>{item.referred.name || "Anonymous User"}</div>
                          <div className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{item.referred.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Pending Signup ({item.code})</span>
                      )}
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "COMPLETED" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success-500)" }}>
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit" style={{ background: "rgba(245,158,11,0.1)", color: "var(--color-warning-500)" }}>
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: item.status === "COMPLETED" ? "var(--color-success-500)" : "var(--text-muted)" }}>
                      {item.status === "COMPLETED" ? "+50 Credits" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
