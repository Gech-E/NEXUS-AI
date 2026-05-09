"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Rocket, LayoutDashboard, Lightbulb, MessageSquare, Users, TrendingUp,
  Target, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  Moon, Sun, Search, Shield, Milestone, PlusCircle, Menu, X, Calendar, Presentation,
  Video, Hash, Gift, Globe,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/ideas", labelKey: "ideas", icon: Lightbulb, roles: ["FOUNDER"] },
  { href: "/dashboard/ideas/new", labelKey: "submitIdea", icon: PlusCircle, roles: ["FOUNDER"] },
  { href: "/dashboard/chatbot", labelKey: "aiMentor", icon: MessageSquare },
  { href: "/dashboard/board-simulation", labelKey: "boardSimulation", icon: Users, roles: ["FOUNDER"] },
  { href: "/dashboard/pitch-deck", labelKey: "pitchDeck", icon: Presentation, roles: ["FOUNDER"] },
  { href: "/dashboard/mentors", labelKey: "mentors", icon: Users },
  { href: "/dashboard/calendar", labelKey: "calendar", icon: Calendar },
  { href: "/dashboard/sessions", labelKey: "sessions", icon: Video, roles: ["FOUNDER", "MENTOR"] },
  { href: "/dashboard/messages", labelKey: "messages", icon: MessageSquare },
  { href: "/dashboard/community", labelKey: "community", icon: Hash },
  { href: "/dashboard/notifications", labelKey: "notifications", icon: Bell },
  { href: "/dashboard/matches", labelKey: "matches", icon: Target },
  { href: "/dashboard/referrals", labelKey: "referrals", icon: Gift },
  { href: "/dashboard/milestones", labelKey: "milestones", icon: Milestone, roles: ["FOUNDER"] },
  { href: "/dashboard/investors", labelKey: "dealFlow", icon: TrendingUp, roles: ["INVESTOR"] },
  { href: "/dashboard/admin", labelKey: "adminPanel", icon: Shield, roles: ["ADMIN", "SUPER_ADMIN"] },
];

const LOCALES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "am", name: "አማርኛ" },
  { code: "ti", name: "ትግርኛ" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Navigation");
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userRole = (session?.user as any)?.role || "FOUNDER";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const changeLocale = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 border-r ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: sidebarOpen ? 260 : 72,
          background: "var(--bg-sidebar)",
          borderColor: "var(--border-primary)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b" style={{ borderColor: "var(--border-primary)" }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="text-lg font-bold gradient-text">Nexus AI</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block" style={{ color: "var(--text-muted)" }}>
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden" style={{ color: "var(--text-muted)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                title={!sidebarOpen ? t(item.labelKey as any) : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey as any)}</span>}
                {sidebarOpen && item.badge && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full gradient-bg text-white">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-1 relative" style={{ borderColor: "var(--border-primary)" }}>
          
          {/* Language Menu */}
          <div className="relative">
            <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="sidebar-link w-full">
              <Globe className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Language</span>}
            </button>
            {langMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg border p-1 shadow-lg z-50 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                {LOCALES.map(loc => (
                  <button
                    key={loc.code}
                    onClick={() => changeLocale(loc.code)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="sidebar-link w-full">
            {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {sidebarOpen && <span>{theme === "dark" ? t("lightMode") : t("darkMode")}</span>}
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="sidebar-link w-full text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>{t("signOut")}</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between glass-card" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden" style={{ color: "var(--text-muted)" }}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search..." className="input-field pl-10 py-2 text-sm" style={{ width: 280 }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--color-danger-500)" }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-medium">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              {session?.user?.name && (
                <div className="hidden md:block">
                  <div className="text-sm font-medium">{session.user.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{userRole}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
