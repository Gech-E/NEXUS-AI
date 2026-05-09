"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem("nexus-theme") || "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (saved === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(saved);
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer />
        {children}
        {mounted && (
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              },
            }}
          />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
