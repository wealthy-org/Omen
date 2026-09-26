"use client";
import Link from "next/link";
import Image from "next/image";

import {
  ETHEREUM_SEPOLIA_EXPLORER_URL,
  ROBINHOOD_TESTNET_EXPLORER_URL,
} from "@/lib/constants";

import { FooterProps } from "@/types";

export type { FooterProps };

const PLATFORM_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "Beliefs", href: "/beliefs" },
  { label: "Predictors", href: "/creators" },
  { label: "Activity", href: "/activity" },
  { label: "Submit a call", href: "/create" },
];

const DEVELOPER_LINKS = [
  { label: "Robinhood testnet explorer", href: ROBINHOOD_TESTNET_EXPLORER_URL },
  { label: "Sepolia explorer", href: ETHEREUM_SEPOLIA_EXPLORER_URL },
  { label: "Source on GitHub", href: "https://github.com/wealthy-org/Omen" },
];

const linkClass =
  "text-sm text-[#4B5D55] hover:text-[#0E7A4E] dark:text-[#A9B3AD] dark:hover:text-[#34D399] transition-colors";

export default function Footer(_props: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-emerald-900/10 bg-white/95 dark:border-white/10 dark:bg-[#030906]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 xl:px-10">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-omen 1.png" alt="Omen Logo" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="text-lg font-bold tracking-tight text-[#0B1F16] dark:text-white">OMEN</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#4B5D55] dark:text-[#A9B3AD]">
            Public price calls, turned into agree or disagree markets and settled onchain. Runs on Robinhood Chain testnet and Ethereum Sepolia with test ETH only.
          </p>
        </div>

        <nav aria-labelledby="footer-platform" className="lg:col-span-3">
          <h3 id="footer-platform" className="mb-4 text-sm font-bold text-[#0B1F16] dark:text-white">
            Platform
          </h3>
          <ul className="space-y-2.5">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-developers" className="lg:col-span-3">
          <h3 id="footer-developers" className="mb-4 text-sm font-bold text-[#0B1F16] dark:text-white">
            Developers
          </h3>
          <ul className="space-y-2.5">
            {DEVELOPER_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-emerald-900/10 dark:border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 text-xs text-[#4B5D55] sm:flex-row sm:justify-between sm:px-6 lg:px-8 xl:px-10 dark:text-[#A9B3AD]">
          <span>© {currentYear} Omen Protocol</span>
          <span>Testnet only. Nothing here is financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
