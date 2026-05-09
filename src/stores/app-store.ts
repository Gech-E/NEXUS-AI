import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "FOUNDER" | "MENTOR" | "INVESTOR" | "ADMIN" | "SUPER_ADMIN";
}

interface AppState {
  user: User | null;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  sidebarOpen: true,
  theme: "system",
  setUser: (user) => set({ user }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(isDark ? "dark" : "light");
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem("nexus-theme", theme);
    }
  },
}));
