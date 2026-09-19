"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import ConnectWalletButton from "./ConnectWalletButton";
import NetworkSwitcherModal from "./NetworkSwitcherModal";

const NAV_ITEMS = [
  { label: "Markets", href: "/#markets" },
  { label: "Creators", href: "/#creators" },
  { label: "Activity", href: "/#activity" },
];

export interface NavbarProps {
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  isWrongNetwork?: boolean;
}

export default function Navbar({ onToggleTheme, isWrongNetwork = false }: NavbarProps) {
  const pathname = usePathname();
  const contextTheme = useTheme();
  const handleToggle = onToggleTheme || contextTheme.toggleTheme;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWrongNetworkState, setIsWrongNetworkState] = useState(isWrongNetwork);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(isWrongNetwork);

  const [prevIsWrongNetwork, setPrevIsWrongNetwork] = useState(isWrongNetwork);

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
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div
        className={`max-w-[1400px] w-full mx-auto rounded-[20px] transition-all duration-300 relative ${
          isScrolled
            ? "bg-white/90 dark:bg-[#0A0F0C]/95 backdrop-blur-xl border border-emerald-500/10 dark:border-white/10 shadow-[0_8px_30px_rgba(14,122,78,0.06),_inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
            : "bg-white/60 dark:bg-[#0A0F0C]/80 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.04),_inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div className="absolute top-0 inset-x-8 h-[1px] pointer-events-none light-emerald-seam dark:dark-emerald-seam" />

        <div className="flex items-center justify-between h-[64px] px-6 sm:px-8">
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
            className="hidden md:flex items-center gap-8 lg:gap-10"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && (pathname?.startsWith(item.href) || pathname === item.href.replace("/#", "/")));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[16px] transition-colors ${
                    isActive
                      ? "text-[#0B1F16] dark:text-white font-bold"
                      : "text-[#17241D] dark:text-[#DCE5DF] font-medium hover:text-emerald-800 dark:hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3.5">
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

          <div className="flex md:hidden items-center gap-2">
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
            className="md:hidden border-t px-6 pt-4 pb-6 space-y-3 rounded-b-[20px] border-emerald-500/10 dark:border-white/10 bg-white dark:bg-[#0A0F0C]"
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && (pathname?.startsWith(item.href) || pathname === item.href.replace("/#", "/")));

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
