"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
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
          <h1 className="text-3xl font-bold mb-3 text-white">Welcome Back</h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Sign in to continue building
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
              placeholder="••••••••" 
              required 
              minLength={8}
            />
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
              <>Sign In</>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: "#22c55e" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
