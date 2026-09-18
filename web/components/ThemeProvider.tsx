"use client";

import React, { createContext, useContext, useSyncExternalStore, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("omen-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("omen-theme-change", callback);
  };
}

function getSnapshot(): Theme {
  const saved = localStorage.getItem("omen-theme");
  return saved === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleSetTheme = (newTheme: Theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omen-theme", newTheme);
      window.dispatchEvent(new Event("omen-theme-change"));
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    handleSetTheme(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme }}>
      <div
        className={theme === "dark" ? "bg-[#030906] text-white min-h-screen" : "bg-[#F3FAF6] text-[#0B1F16] min-h-screen"}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
