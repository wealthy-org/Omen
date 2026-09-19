"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "../ThemeProvider";

export interface InfraItem {
  name: string;
  icon: string;
}

export const INFRA_STACK: InfraItem[] = [
  { name: "Ethereum Sepolia", icon: "/icons/eth.webp" },
  { name: "Robinhood Chain", icon: "/icons/robinhood.webp" },
  { name: "Arbitrum", icon: "/icons/arb.webp" },
  { name: "Chainlink", icon: "/icons/chainlink.webp" },
  { name: "Viem", icon: "/icons/viem.webp" },
  { name: "Wagmi", icon: "/icons/wagmi.webp" },
  { name: "OpenRouter", icon: "/icons/openrouter.webp" },
  { name: "Supabase", icon: "/icons/supabase.webp" },
  { name: "Foundry", icon: "/icons/foundry.webp" },
  { name: "Farcaster", icon: "/icons/farcaster.webp" },
];

export interface InfraMarqueeProps {
  theme?: "dark" | "light";
}

export default function InfraMarquee({ theme: propTheme }: InfraMarqueeProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const marqueeItems = [...INFRA_STACK, ...INFRA_STACK, ...INFRA_STACK];

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

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex items-center gap-8 sm:gap-12 py-2">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-100 opacity-85 cursor-default"
            >
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 shrink-0 flex items-center justify-center">
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold tracking-tight ${
                  isDark ? "text-zinc-200" : "text-zinc-800"
                }`}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
