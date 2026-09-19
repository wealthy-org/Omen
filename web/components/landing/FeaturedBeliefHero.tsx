"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface FeaturedBeliefHeroProps {
  theme?: "dark" | "light";
}

export default function FeaturedBeliefHero({}: FeaturedBeliefHeroProps) {
  const [side, setSide] = useState<"agree" | "disagree">("agree");
  const [amount, setAmount] = useState<string>("1.0");

  const totalPool = 150;
  const agreePool = 87;
  const disagreePool = 63;

  const numericAmount = Math.max(0, parseFloat(amount) || 0);
  const selectedPool = side === "agree" ? agreePool : disagreePool;
  const calculatedPayout =
    numericAmount > 0
      ? (numericAmount / (selectedPool + numericAmount)) * (totalPool + numericAmount)
      : 0;

  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all duration-300 relative flex flex-col justify-between hover-lift shadow-xl bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/20 shadow-[0_12px_36px_rgba(14,122,78,0.08),_inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-white/20 shrink-0">
              <span>TX</span>
              <img
                src="https://unavatar.io/twitter/TraderX"
                alt="TraderX"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#0B1F16] dark:text-white">
                @TraderX
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="text-[10px]">✓</span> Confirmed
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#4B5D55] dark:text-[#A9B3AD]">
            Ends in 12 days
          </span>
        </div>

        <div className="text-xs font-mono mb-4 text-[#4B5D55] dark:text-[#A9B3AD]">
          Detected from X, 2 hours ago • Resolves via Chainlink
        </div>

        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-5 text-[#0B1F16] dark:text-white">
          SOL will outperform ETH this month
        </h3>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#17241D] dark:text-[#DCE5DF]">
                People <span className="text-[11px] text-[#4B5D55] dark:text-[#A9B3AD]">what they say</span>
              </span>
              <span className="font-mono font-bold text-emerald-500">72% agree</span>
            </div>
            <div className="h-2.5 w-full bg-rose-500/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: "72%" }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#17241D] dark:text-[#DCE5DF]">
                Capital <span className="text-[11px] text-[#4B5D55] dark:text-[#A9B3AD]">where money is</span>
              </span>
              <span className="font-mono font-bold text-emerald-500">58% agree</span>
            </div>
            <div className="h-2.5 w-full bg-rose-500/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: "58%" }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl border text-xs leading-relaxed mb-5 bg-emerald-50/70 dark:bg-[#030906]/80 border-emerald-500/15 dark:border-emerald-500/20 text-[#17241D] dark:text-[#DCE5DF]">
          <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0">
            14-pt gap
          </span>
          <span>The crowd is louder than its wallet. That distance is the tradable signal.</span>
        </div>
      </div>

      <div className="pt-4 border-t border-emerald-500/15 dark:border-white/10">
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button
            type="button"
            onClick={() => setSide("agree")}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer active:scale-[0.98] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              side === "agree"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-[#070D09]"
                : "bg-emerald-600/85 hover:bg-emerald-600 text-white shadow-xs"
            }`}
          >
            <span className="font-sans font-bold text-xs">Agree</span>
            <span className="px-1.5 py-0.5 rounded bg-black/25 text-emerald-100 font-mono text-xs font-bold">
              1.72×
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSide("disagree")}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer active:scale-[0.98] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              side === "disagree"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400 ring-offset-2 ring-offset-white dark:ring-offset-[#070D09]"
                : "bg-rose-600/85 hover:bg-rose-600 text-white shadow-xs"
            }`}
          >
            <span className="font-sans font-bold text-xs">Disagree</span>
            <span className="px-1.5 py-0.5 rounded bg-black/25 text-rose-100 font-mono text-xs font-bold">
              2.38×
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3 bg-white dark:bg-[#030906] border-zinc-200 dark:border-white/10">
          <input
            type="number"
            step="0.1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent outline-none font-mono font-bold text-base w-full text-[#0B1F16] dark:text-white"
            placeholder="1.0"
            aria-label="Stake amount in test ETH"
          />
          <span className="text-xs font-mono font-bold shrink-0 text-[#4B5D55] dark:text-[#A9B3AD]">
            test ETH
          </span>
        </div>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-[#4B5D55] dark:text-[#A9B3AD]">
            If <strong className="uppercase font-mono">{side}</strong> wins, you receive:
          </span>
          <span
            className={`font-mono font-black text-base ${
              side === "agree" ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            ≈ {calculatedPayout.toFixed(2)} ETH
          </span>
        </div>

        <div className="pt-3 border-t flex items-center justify-between text-xs font-mono border-emerald-500/15 dark:border-white/10 text-[#4B5D55] dark:text-[#A9B3AD]">
          <span>≈ <strong className="text-[#0B1F16] dark:text-white">$482K</strong> pool</span>
          <span><strong className="text-[#0B1F16] dark:text-white">2,842</strong> traders</span>
          <Link
            href="/market/sol-outperform-eth"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-emerald-500 dark:hover:text-black text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Trade</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
