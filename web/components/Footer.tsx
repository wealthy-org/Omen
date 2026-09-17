"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

const PLATFORM_LINKS = [
  { label: "Markets Feed", href: "/markets" },
  { label: "Beliefs Catalog", href: "/beliefs" },
  { label: "Creators Directory", href: "/creators" },
  { label: "Activity Feed", href: "/activity" },
  { label: "Submit Belief", href: "/create" },
];

const DEVELOPER_LINKS = [
  { label: "Sepolia Explorer", href: "https://sepolia.etherscan.io", external: true },
  { label: "Robinhood Explorer", href: "https://explorer.testnet.chain.robinhood.com", external: true },
  { label: "GitHub Repository", href: "https://github.com/wealthy-org/Omen", external: true },
  { label: "Documentation", href: "#", external: false },
];

const COMMUNITY_LINKS = [
  { label: "X (Twitter)", href: "https://x.com", external: true },
  { label: "Discord", href: "https://discord.com", external: true },
  { label: "Telegram", href: "https://telegram.org", external: true },
];

export interface FooterProps {
  theme?: "dark" | "light";
}

export default function Footer({ theme: propTheme }: FooterProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t mt-auto transition-colors duration-300 ${
        isDark ? "bg-[#030906] border-white/10" : "bg-white/95 border-emerald-500/10 shadow-[0_-4px_24px_rgba(14,122,78,0.03)]"
      }`}
    >
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Omen Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                OMEN
              </span>
            </div>

            <p className={`text-sm leading-relaxed max-w-sm ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Social Belief Market Protocol turning opinions into tradable on-chain markets across Ethereum Sepolia & Robinhood Chain Testnet.
            </p>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-500/20 text-white/80"
                  : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yes-green animate-pulse" />
              <span className="text-xs font-mono font-medium">
                Dual-Testnet Active
              </span>
            </div>
          </div>

          <div>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Platform
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDark ? "text-[#A9B3AD] hover:text-[#34D399]" : "text-[#4B5D55] hover:text-[#0E7A4E]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Developers
            </h3>
            <ul className="space-y-2.5">
              {DEVELOPER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm transition-colors inline-flex items-center gap-1 group ${
                        isDark ? "text-[#A9B3AD] hover:text-[#34D399]" : "text-[#4B5D55] hover:text-[#0E7A4E]"
                      }`}
                    >
                      {link.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-[#A9B3AD]/60 group-hover:text-[#34D399]" : "text-[#4B5D55]/60 group-hover:text-[#0E7A4E]"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors ${
                        isDark ? "text-[#A9B3AD] hover:text-[#34D399]" : "text-[#4B5D55] hover:text-[#0E7A4E]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Community
            </h3>
            <ul className="space-y-2.5">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm transition-colors inline-flex items-center gap-1 group ${
                      isDark ? "text-[#A9B3AD] hover:text-[#34D399]" : "text-[#4B5D55] hover:text-[#0E7A4E]"
                    }`}
                  >
                    {link.label}
                    <svg
                      className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-[#A9B3AD]/60 group-hover:text-[#34D399]" : "text-[#4B5D55]/60 group-hover:text-[#0E7A4E]"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/10 text-[#4B5D55]"
          }`}
        >
          <p>© {currentYear} Omen Protocol. All rights reserved.</p>
          <p className="font-mono text-center sm:text-right">
            Demonstration and testnet platform only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

