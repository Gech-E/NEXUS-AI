"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "FOUNDER" | "MENTOR" | "INVESTOR";

const ROLES: { value: Role; label: string }[] = [
  { value: "FOUNDER", label: "Founder" },
  { value: "MENTOR", label: "Mentor" },
  { value: "INVESTOR", label: "Investor" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FOUNDER");
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 text-white">Create Account</h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Join the innovation ecosystem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg text-sm text-red-500 bg-red-500/10 border border-red-500/20 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Full Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-3.5 rounded-lg text-sm bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors" 
              placeholder="John Doe" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3.5 rounded-lg text-sm bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors" 
              placeholder="you@example.com" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-lg text-sm bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors" 
              placeholder="Minimum 8 characters" 
              required 
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              I am a
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-3.5 rounded-lg text-sm bg-[#0f172a] border border-[#1e293b] text-white appearance-none focus:outline-none focus:border-[#38bdf8] transition-colors cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-4 flex items-center justify-center"
            style={{ background: "linear-gradient(to right, #38bdf8, #22c55e)" }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>🚀 Create Account</>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: "#22c55e" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
