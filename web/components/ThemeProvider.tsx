"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "system" | "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function getCookieTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(/(?:^|; )omen-theme=([^;]*)/);
  if (match) {
    const val = decodeURIComponent(match[1]) as Theme;
    if (val === "dark" || val === "light" || val === "system") {
      return val;
    }
  }
  return "system";
}

export function ThemeProvider({
  initialTheme = "system",
  children,
}: {
  initialTheme?: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let saved: Theme = initialTheme;
    try {
      const local = localStorage.getItem("omen-theme") as Theme;
      if (local === "dark" || local === "light" || local === "system") {
        saved = local;
      } else {
        saved = getCookieTheme();
      }
    } catch {
      saved = getCookieTheme();
    }
    setThemeState(saved);
  }, [initialTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolved = () => {
      let resolved: "dark" | "light";
      if (theme === "system") {
        resolved = mediaQuery.matches ? "dark" : "light";
      } else {
        resolved = theme;
      }
      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (resolved === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
      }
    };

    updateResolved();

    const listener = () => {
      if (theme === "system") {
        updateResolved();
      }
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof document !== "undefined") {
      document.cookie = `omen-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem("omen-theme", newTheme);
      } catch {}
      window.dispatchEvent(new Event("omen-theme-change"));
    }
  };

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <div
        className="min-h-screen bg-[#F3FAF6] dark:bg-[#030906] text-[#0B1F16] dark:text-white"
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return {
    ...ctx,
    theme: ctx.resolvedTheme,
    rawTheme: ctx.theme,
  };
}
