import Link from "next/link";
import {
  Rocket,
  Brain,
  Users,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
  Globe,
  CheckCircle2,
  Star,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nexus AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Features</a>
            <a href="#how-it-works" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>How it Works</a>
            <a href="#testimonials" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Testimonials</a>
            <a href="#pricing" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm">Log in</Link>
            <Link href="/register" className="btn-primary text-sm flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-brand-500), transparent 70%)" }} />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl animate-float" style={{ background: "radial-gradient(circle, var(--color-accent-500), transparent 70%)" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in" style={{ background: "var(--bg-tertiary)", color: "var(--color-brand-500)", border: "1px solid var(--border-primary)" }}>
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
            <ChevronRight className="w-3 h-3" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Build the Future with{" "}
            <span className="gradient-text">AI-Native</span>{" "}
            Incubation
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ color: "var(--text-secondary)", animationDelay: "0.1s" }}>
            Nexus AI connects founders, mentors, and investors through intelligent
            matchmaking, AI-powered idea validation, and real-time startup intelligence.
            Think Y Combinator meets AI Copilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Start Your Journey
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-3 flex items-center gap-2">
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {[
              { value: "10K+", label: "Startups Evaluated" },
              { value: "500+", label: "Expert Mentors" },
              { value: "85%", label: "Match Success Rate" },
              { value: "$2B+", label: "Funding Facilitated" },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Scale Your Startup</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Our AI-powered platform provides end-to-end support from idea validation
              to investor matching.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Idea Evaluation",
                description: "Get your startup idea evaluated by AI with a comprehensive Nexus Score, SWOT analysis, and market sizing.",
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                icon: MessageSquare,
                title: "AI Mentor Chatbot",
                description: "24/7 AI-powered startup mentor trained on YC resources, lean startup methodology, and fundraising best practices.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Smart Matchmaking",
                description: "AI-powered matching connects you with the perfect mentors, co-founders, and investors based on compatibility.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: TrendingUp,
                title: "Progress Intelligence",
                description: "Track milestones, get AI-generated insights, and benchmark your startup against cohort peers.",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Target,
                title: "Investor Portal",
                description: "AI-curated deal flow, startup discovery, investment thesis matching, and due diligence tools.",
                gradient: "from-rose-500 to-red-500",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Real-time analytics with AI-generated reports, cohort benchmarking, and predictive insights.",
                gradient: "from-cyan-500 to-blue-500",
              },
            ].map((feature) => (
              <div key={feature.title} className="card group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="gradient-text">Nexus AI</span> Works
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              From idea to investment in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Submit Your Idea", description: "Describe your startup idea, target market, and business model.", icon: Rocket },
              { step: "02", title: "AI Evaluation", description: "Get instant AI analysis with Nexus Score, SWOT, and competitor insights.", icon: Brain },
              { step: "03", title: "Get Matched", description: "AI matches you with compatible mentors, co-founders, and investors.", icon: Users },
              { step: "04", title: "Scale Up", description: "Track milestones, get mentorship, and connect with investors.", icon: TrendingUp },
            ].map((item, i) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center mb-4 animate-pulse-glow">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: "var(--color-brand-500)" }}>STEP {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed" style={{ borderColor: "var(--border-primary)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLE CARDS ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">Every Stakeholder</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Founders",
                icon: Rocket,
                benefits: [
                  "AI-powered idea validation & Nexus Score",
                  "Smart mentor & co-founder matching",
                  "Milestone tracking with AI insights",
                  "Investor discovery & intro requests",
                  "24/7 AI mentor chatbot",
                ],
                cta: "Start Building",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                role: "Mentors",
                icon: Star,
                benefits: [
                  "Discover promising startups",
                  "Automated scheduling & bookings",
                  "AI-generated session summaries",
                  "Build your mentor reputation",
                  "Earn through the marketplace",
                ],
                cta: "Start Mentoring",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                role: "Investors",
                icon: TrendingUp,
                benefits: [
                  "AI-curated deal flow pipeline",
                  "Investment thesis matching",
                  "Startup intelligence & analytics",
                  "Watchlists & portfolio tracking",
                  "Due diligence export tools",
                ],
                cta: "Start Investing",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((card) => (
              <div key={card.role} className="gradient-border p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">For {card.role}</h3>
                <ul className="space-y-3 mb-6">
                  {card.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-success-500)" }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-primary w-full text-center text-sm py-2.5 block">
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: "var(--bg-tertiary)", color: "var(--color-success-500)" }}>
            <Shield className="w-4 h-4" />
            Enterprise-Grade Security
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Data is <span className="gradient-text">Protected</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {[
              { icon: Shield, label: "JWT Auth & RBAC" },
              { icon: Zap, label: "AI Safety Filtering" },
              { icon: Globe, label: "GDPR Compliant" },
              { icon: CheckCircle2, label: "SOC 2 Ready" },
            ].map((item) => (
              <div key={item.label} className="card text-center py-6">
                <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--color-brand-500)" }} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center gradient-border p-12" style={{ background: "var(--bg-card)" }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build the Next Unicorn?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
            Join thousands of founders using AI to validate, build, and scale their startups.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">Nexus AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2026 Nexus AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
