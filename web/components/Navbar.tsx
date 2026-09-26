"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import ConnectWalletButton from "./ConnectWalletButton";
import NetworkSwitcherModal from "./NetworkSwitcherModal";
import NavTicker from "./NavTicker";

const NAV_ITEMS = [
  { label: "Markets", href: "/markets" },
  { label: "Beliefs", href: "/beliefs" },
  { label: "Creators", href: "/creators" },
  { label: "Activity", href: "/activity" },
  { label: "My Bets", href: "/my-bets" },
];

const isNavActive = (pathname: string | null, href: string) =>
  pathname === href || Boolean(pathname?.startsWith(`${href}/`)) || (href === "/markets" && Boolean(pathname?.startsWith("/market/")));

import { NavbarProps } from "@/types";

export type { NavbarProps };

export default function Navbar({ onToggleTheme, isWrongNetwork = false }: NavbarProps) {
  const pathname = usePathname();
  const contextTheme = useTheme();
  const handleToggle = onToggleTheme || contextTheme.toggleTheme;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWrongNetworkState, setIsWrongNetworkState] = useState(isWrongNetwork);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(isWrongNetwork);

  const [prevIsWrongNetwork, setPrevIsWrongNetwork] = useState(isWrongNetwork);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  if (isWrongNetwork !== prevIsWrongNetwork) {
    setPrevIsWrongNetwork(isWrongNetwork);
    setIsWrongNetworkState(isWrongNetwork);
    if (isWrongNetwork) {
      setIsNetworkModalOpen(true);
    }
  }

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

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`w-full relative border-b transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-[#0A0F0C]/95 backdrop-blur-xl border-emerald-500/15 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.05)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            : "bg-white/80 dark:bg-[#0A0F0C]/85 backdrop-blur-md border-emerald-500/10 dark:border-white/10"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 h-[60px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo-omen 1.png"
                  alt="Omen Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  priority
                />
              </div>
              <span className="text-[20px] sm:text-[22px] font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
                OMEN
              </span>
            </Link>
            <span className="hidden sm:inline-flex text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-500/10 text-[#0E7A4E] dark:text-emerald-400 border-emerald-500/15 dark:border-emerald-500/20">
              TESTNET
            </span>
          </div>

          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = isNavActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md font-mono text-[12px] uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-[#0E7A4E] dark:text-emerald-400 font-bold"
                      : "text-[#4B5D55] dark:text-[#A9B3AD] font-medium hover:text-[#0B1F16] dark:hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && <span aria-hidden="true" className="mr-1">▸</span>}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form action="/markets" method="get" role="search" className="hidden xl:flex items-center flex-1 max-w-[260px]">
            <label className="relative w-full">
              <span className="sr-only">Search markets</span>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                name="q"
                placeholder="Search markets..."
                className="w-full h-9 pl-9 pr-12 rounded-lg border text-sm bg-white dark:bg-white/5 border-emerald-500/15 dark:border-white/10 text-[#0B1F16] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border text-[10px] font-mono text-zinc-500 border-zinc-200 dark:border-white/10">⌘K</kbd>
            </label>
          </form>

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer bg-white/90 dark:bg-white/5 border-emerald-500/10 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD] hover:text-[#0B1F16] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 shadow-xs dark:shadow-none"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <svg className="w-4 h-4 text-emerald-700 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg className="w-4 h-4 text-emerald-400 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="dark:hidden font-mono">Light</span>
              <span className="hidden dark:inline-block font-mono">Dark</span>
            </button>

            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary-blue hover:bg-primary-blue-hover text-white shadow-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Submit Belief</span>
            </Link>

            {isWrongNetworkState && (
              <button
                type="button"
                onClick={() => setIsNetworkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-no-red-soft dark:bg-no-red/10 text-no-red border border-no-red/20 shadow-xs hover:opacity-90 transition-all cursor-pointer"
                aria-label="Wrong network warning"
              >
                <span className="w-2 h-2 rounded-full bg-no-red animate-ping" />
                <span>Wrong Network</span>
              </button>
            )}

            <ConnectWalletButton />
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 rounded-xl border flex items-center justify-center cursor-pointer bg-white/90 dark:bg-white/5 border-emerald-500/10 dark:border-white/10 text-emerald-800 dark:text-emerald-400"
              aria-label="Toggle theme"
            >
              <svg className="w-4 h-4 text-emerald-700 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg className="w-4 h-4 text-emerald-400 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#0B1F16] dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10"
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
            className="lg:hidden border-t px-4 sm:px-6 pt-4 pb-6 space-y-3 border-emerald-500/10 dark:border-white/10 bg-white dark:bg-[#0A0F0C]"
            data-testid="mobile-menu"
          >
            <form action="/markets" method="get" role="search">
              <input
                type="search"
                name="q"
                placeholder="Search markets..."
                aria-label="Search markets"
                className="w-full h-11 px-4 rounded-xl border text-base bg-white dark:bg-white/5 border-emerald-500/15 dark:border-white/10 text-[#0B1F16] dark:text-white placeholder:text-zinc-400"
              />
            </form>
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = isNavActive(pathname, item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`h-12 flex items-center px-4 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-white/15 text-[#0B1F16] dark:text-white font-semibold"
                        : "text-[#17241D] dark:text-[#DCE5DF] hover:text-emerald-900 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-white/5"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-12 flex items-center justify-center gap-2 px-4 rounded-xl text-base font-bold bg-primary-blue text-white shadow-xs mt-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Submit Belief</span>
              </Link>
            </nav>

            <div className="pt-3 border-t border-emerald-500/10 dark:border-white/10 flex flex-col gap-2">
              {isWrongNetworkState && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNetworkModalOpen(true);
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-mono font-bold bg-no-red-soft dark:bg-no-red/10 text-no-red border border-no-red/20"
                >
                  <span className="w-2 h-2 rounded-full bg-no-red" />
                  <span>Wrong Network (Switch Network)</span>
                </button>
              )}
              <ConnectWalletButton className="w-full justify-center" />
            </div>
          </div>
        )}
      </div>

      <NavTicker />

      <NetworkSwitcherModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onSwitchNetwork={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          setIsWrongNetworkState(false);
          setIsNetworkModalOpen(false);
        }}
      />
    </header>
  );
}
