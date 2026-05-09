"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, Briefcase, TrendingUp } from "lucide-react";

type Role = "FOUNDER" | "MENTOR" | "INVESTOR";

const ROLES: { value: Role; label: string; icon: React.ElementType; description: string }[] = [
  { value: "FOUNDER", label: "Founder", icon: Rocket, description: "I'm building a startup" },
  { value: "MENTOR", label: "Mentor", icon: Briefcase, description: "I want to mentor founders" },
  { value: "INVESTOR", label: "Investor", icon: TrendingUp, description: "I'm looking to invest" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FOUNDER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }} />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-25 animate-float" style={{ background: "var(--color-brand-500)" }} />
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full blur-3xl opacity-15 animate-float" style={{ background: "var(--color-accent-500)", animationDelay: "2s" }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Nexus AI</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Join the Ecosystem</h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Connect with founders, mentors, and investors powered by intelligent AI.
          </p>
          <div className="space-y-4">
            {["AI-Powered Idea Evaluation", "Smart Matchmaking", "24/7 AI Mentor"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nexus AI</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--color-brand-500)" }}>Sign in</Link>
          </p>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium mb-6 transition-all duration-200 hover:opacity-90"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm text-red-500" style={{ background: "rgba(239,68,68,0.1)" }}>
                {error}
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="p-3 rounded-lg text-center transition-all duration-200"
                    style={{
                      background: role === r.value ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" : "var(--bg-secondary)",
                      border: `1px solid ${role === r.value ? "var(--color-brand-500)" : "var(--border-primary)"}`,
                      color: role === r.value ? "var(--color-brand-500)" : "var(--text-secondary)",
                    }}
                  >
                    <r.icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="John Doe" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="Min. 8 characters" required minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
