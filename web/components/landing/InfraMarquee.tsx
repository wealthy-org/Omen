"use client";

import React from "react";
import { useTheme } from "../ThemeProvider";

export interface InfraItem {
  name: string;
  category: string;
  badge: string;
}

export const INFRA_STACK: InfraItem[] = [
  { name: "Ethereum Sepolia", category: "Settlement Layer", badge: "L1 Testnet" },
  { name: "Robinhood Chain", category: "Execution Layer", badge: "AppChain 46630" },
  { name: "Arbitrum Nitro", category: "Rollup Engine", badge: "EVM Nitro" },
  { name: "Chainlink", category: "Data Feeds", badge: "AggregatorV3" },
  { name: "Viem & Wagmi", category: "Web3 State", badge: "Type-Safe" },
  { name: "OpenRouter AI", category: "Belief Extractor", badge: "LLM Pipeline" },
  { name: "Supabase", category: "Database & RLS", badge: "Postgres 16" },
  { name: "Foundry", category: "Smart Contracts", badge: "Forge & Cast" },
  { name: "Farcaster", category: "Social Signal", badge: "Warpcast / X" },
  { name: "EIP-712", category: "Author Signatures", badge: "Typed Conviction" },
];

export interface InfraMarqueeProps {
  theme?: "dark" | "light";
}

export default function InfraMarquee({ theme: propTheme }: InfraMarqueeProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const marqueeItems = [...INFRA_STACK, ...INFRA_STACK];

  return (
    <div className="w-full py-4 sm:py-6 overflow-hidden relative select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-[#34D399]" : "bg-[#22C55E]"}`} />
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-widest ${
              isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
          >
            Protocol Infrastructure & Ecosystem Stack
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden sm:inline-block ${
            isDark ? "bg-white/5 border-white/10 text-[#A9B3AD]" : "bg-emerald-50 border-emerald-500/15 text-[#0E7A4E]"
          }`}
        >
          Continuous Verification
        </span>
      </div>

      <div
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="animate-marquee flex items-center gap-3 sm:gap-4 py-1">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all shrink-0 hover:scale-[1.02] cursor-default ${
                isDark
                  ? "bg-[#0A0F0C]/90 border-white/10 hover:border-emerald-500/40 text-white shadow-xs"
                  : "bg-white/95 border-emerald-500/15 hover:border-emerald-500/35 text-[#0B1F16] shadow-xs"
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold tracking-tight">{item.name}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  {item.category}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                  isDark
                    ? "bg-emerald-500/10 text-[#34D399] border-emerald-500/20"
                    : "bg-emerald-100/70 text-[#0E7A4E] border-emerald-300/40"
                }`}
              >
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
