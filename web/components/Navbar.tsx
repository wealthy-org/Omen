"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { label: "Predictions", href: "/predictions" },
  { label: "Quests", href: "/quests" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "My Bets", href: "/my-bets" },
];

export interface NavbarProps {
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export default function Navbar({ theme: propTheme, onToggleTheme }: NavbarProps) {
  const pathname = usePathname();
  const contextTheme = useTheme();
  const activeTheme = propTheme || contextTheme.theme || "dark";
  const handleToggle = onToggleTheme || contextTheme.toggleTheme;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isDark = activeTheme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8">
      <div
        className={`max-w-7xl mx-auto rounded-[20px] transition-all duration-300 relative ${
          isDark
            ? isScrolled
              ? "bg-[#0A0F0C]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
              : "bg-[#0A0F0C]/80 backdrop-blur-md border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : isScrolled
              ? "bg-white/90 backdrop-blur-xl border border-emerald-900/10 shadow-[0_8px_30px_rgba(14,122,78,0.08)]"
              : "bg-transparent backdrop-blur-xs border border-transparent"
        }`}
      >
        {isDark && (
          <div
            className="absolute top-0 inset-x-8 h-[1px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 25%, #10B981 50%, rgba(16,185,129,0.3) 75%, transparent 100%)",
            }}
          />
        )}

        <div className="flex items-center justify-between h-[64px] px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                  isDark
                    ? "bg-emerald-500/20 text-[#34D399] border border-emerald-500/30"
                    : "bg-[#10221A] text-white"
                }`}
              >
                Ω
              </div>
              <span
                className={`text-[20px] sm:text-[22px] font-extrabold tracking-tight ${
                  isDark ? "text-white" : "text-[#0B1F16]"
                }`}
              >
                OMEN
              </span>
            </Link>
            <span
              className={`hidden sm:inline-flex text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-emerald-100 text-emerald-900 border-emerald-200"
              }`}
            >
              TESTNET
            </span>
          </div>

          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[16px] transition-colors ${
                    isActive
                      ? isDark
                        ? "text-white font-bold"
                        : "text-[#0B1F16] font-bold"
                      : isDark
                        ? "text-[#DCE5DF] font-medium hover:text-white"
                        : "text-[#17241D] font-medium hover:text-emerald-800"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggle}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
                isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD] hover:text-white hover:bg-white/10"
                  : "bg-white/80 border-emerald-900/10 text-[#4B5D55] hover:text-[#0B1F16] hover:bg-white"
              }`}
              title={isDark ? "Switch to Light Emerald" : "Switch to Dark Emerald"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={`text-[15px] font-bold px-5 py-2.5 rounded-[14px] transition-all active:scale-[0.98] ${
                isDark
                  ? "bg-white text-[#030906] hover:bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.2)]"
                  : "bg-[#10221A] text-white hover:bg-[#183428]"
              }`}
            >
              Connect Wallet
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className={`p-2 rounded-xl border flex items-center justify-center ${
                isDark ? "bg-white/5 border-white/10 text-emerald-400" : "bg-white border-emerald-900/10 text-emerald-800"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center ${
                isDark ? "text-white/90 hover:bg-white/10" : "text-[#0B1F16] hover:bg-black/5"
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className={`md:hidden border-t px-6 pt-4 pb-6 space-y-3 rounded-b-[20px] ${
              isDark ? "border-white/10 bg-[#0A0F0C]" : "border-emerald-900/10 bg-white"
            }`}
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`h-12 flex items-center px-4 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? isDark
                          ? "bg-white/15 text-white font-semibold"
                          : "bg-emerald-50 text-[#0B1F16] font-semibold"
                        : isDark
                          ? "text-[#DCE5DF] hover:text-white hover:bg-white/5"
                          : "text-[#17241D] hover:text-emerald-900 hover:bg-emerald-50/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className={`pt-3 border-t flex flex-col gap-2 ${isDark ? "border-white/10" : "border-emerald-900/10"}`}>
              <button
                type="button"
                className={`w-full h-12 text-base font-bold rounded-[14px] transition-all flex items-center justify-center ${
                  isDark ? "bg-white text-[#030906] hover:bg-white/90" : "bg-[#10221A] text-white hover:bg-[#183428]"
                }`}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
