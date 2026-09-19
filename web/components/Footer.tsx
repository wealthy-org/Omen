"use client";
import Link from "next/link";
import Image from "next/image";

const PLATFORM_LINKS = [
  { label: "Trending Markets", href: "/#markets" },
  { label: "Protocol Lifecycle", href: "/#how-it-works" },
  { label: "Creators Directory", href: "/#creators" },
  { label: "Live Activity", href: "/#activity" },
  { label: "Protocol FAQ", href: "/#faq" },
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

import { FooterProps } from "@/types";

export type { FooterProps };

export default function Footer(_props: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t mt-auto transition-colors duration-300 bg-white/95 dark:bg-[#030906] border-emerald-500/10 dark:border-white/10 shadow-[0_-4px_24px_rgba(14,122,78,0.03)] dark:shadow-none">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo-omen 1.png"
                  alt="Omen Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#0B1F16] dark:text-white">
                OMEN
              </span>
            </div>

            <p className="text-sm leading-relaxed max-w-sm text-[#4B5D55] dark:text-[#A9B3AD]">
              Social Belief Market Protocol turning opinions into tradable on-chain markets across Ethereum Sepolia & Robinhood Chain Testnet.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-500/15 dark:border-emerald-500/20 text-[#0E7A4E] dark:text-white/80">
              <span className="w-2 h-2 rounded-full bg-yes-green animate-pulse" />
              <span className="text-xs font-mono font-medium">
                Dual-Testnet Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-4 text-[#0B1F16] dark:text-white">
                Platform
              </h3>
              <ul className="space-y-2.5">
                {PLATFORM_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors text-[#4B5D55] hover:text-[#0E7A4E] dark:text-[#A9B3AD] dark:hover:text-[#34D399]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-4 text-[#0B1F16] dark:text-white">
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
                        className="text-sm transition-colors inline-flex items-center gap-1 group text-[#4B5D55] hover:text-[#0E7A4E] dark:text-[#A9B3AD] dark:hover:text-[#34D399]"
                      >
                        {link.label}
                        <svg
                          className="w-3.5 h-3.5 transition-colors text-[#4B5D55]/60 group-hover:text-[#0E7A4E] dark:text-[#A9B3AD]/60 dark:group-hover:text-[#34D399]"
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
                        className="text-sm transition-colors text-[#4B5D55] hover:text-[#0E7A4E] dark:text-[#A9B3AD] dark:hover:text-[#34D399]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-4 text-[#0B1F16] dark:text-white">
              Community
            </h3>
            <ul className="space-y-2.5">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors inline-flex items-center gap-1 group text-[#4B5D55] hover:text-[#0E7A4E] dark:text-[#A9B3AD] dark:hover:text-[#34D399]"
                  >
                    {link.label}
                    <svg
                      className="w-3.5 h-3.5 transition-colors text-[#4B5D55]/60 group-hover:text-[#0E7A4E] dark:text-[#A9B3AD]/60 dark:group-hover:text-[#34D399]"
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

        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-emerald-500/10 text-[#4B5D55] dark:border-white/10 dark:text-[#A9B3AD]">
          <p>© {currentYear} Omen Protocol. All rights reserved.</p>
          <p className="font-mono text-center sm:text-right">
            Demonstration and testnet platform only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
