"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface FeaturedBeliefHeroProps {
  theme?: "dark" | "light";
}

export default function FeaturedBeliefHero({ theme: propTheme }: FeaturedBeliefHeroProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

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
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all duration-300 relative flex flex-col justify-between hover-lift shadow-xl ${
        isDark
          ? "bg-[#070D09]/95 border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
          : "bg-white/95 border-emerald-500/20 shadow-[0_12px_36px_rgba(14,122,78,0.08),_inset_0_1px_0_rgba(255,255,255,1)]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-white/20">
              TX
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                @TraderX
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="text-[10px]">✓</span> Confirmed
              </span>
            </div>
          </div>
          <span className={`text-xs font-mono font-semibold ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
            Ends in 12 days
          </span>
        </div>

        <div className={`text-xs font-mono mb-4 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
          Detected from X, 2 hours ago • Resolves via Chainlink
        </div>

        <h3
          className={`text-xl sm:text-2xl font-black tracking-tight leading-tight mb-5 ${
            isDark ? "text-white" : "text-[#0B1F16]"
          }`}
        >
          SOL will outperform ETH this month
        </h3>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className={isDark ? "text-[#DCE5DF]" : "text-[#17241D]"}>
                People <span className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>what they say</span>
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
              <span className={isDark ? "text-[#DCE5DF]" : "text-[#17241D]"}>
                Capital <span className={`text-[11px] ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>where money is</span>
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

        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs leading-relaxed mb-5 ${
            isDark
              ? "bg-[#030906]/80 border-emerald-500/20 text-[#DCE5DF]"
              : "bg-emerald-50/70 border-emerald-500/15 text-[#17241D]"
          }`}
        >
          <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0">
            14-pt gap
          </span>
          <span>The crowd is louder than its wallet. That distance is the tradable signal.</span>
        </div>
      </div>

      <div className={`pt-4 border-t ${isDark ? "border-white/10" : "border-emerald-500/15"}`}>
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button
            type="button"
            onClick={() => setSide("agree")}
            className={`p-3 rounded-xl border text-left transition-all ${
              side === "agree"
                ? isDark
                  ? "bg-emerald-500/20 border-emerald-500 text-white shadow-xs"
                  : "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                : isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD] hover:border-white/20"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <div className="text-xs font-bold font-mono uppercase">Agree</div>
            <div className="text-lg font-mono font-extrabold text-emerald-500">1.72×</div>
          </button>

          <button
            type="button"
            onClick={() => setSide("disagree")}
            className={`p-3 rounded-xl border text-left transition-all ${
              side === "disagree"
                ? isDark
                  ? "bg-rose-500/20 border-rose-500 text-white shadow-xs"
                  : "bg-rose-50 border-rose-500 text-rose-900 shadow-xs"
                : isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD] hover:border-white/20"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <div className="text-xs font-bold font-mono uppercase">Disagree</div>
            <div className="text-lg font-mono font-extrabold text-rose-500">2.38×</div>
          </button>
        </div>

        <div
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3 ${
            isDark ? "bg-[#030906] border-white/10" : "bg-white border-zinc-200"
          }`}
        >
          <input
            type="number"
            step="0.1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`bg-transparent outline-none font-mono font-bold text-base w-full ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
            placeholder="1.0"
            aria-label="Stake amount in test ETH"
          />
          <span className={`text-xs font-mono font-bold shrink-0 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
            test ETH
          </span>
        </div>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className={isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}>
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

        <div
          className={`pt-3 border-t flex items-center justify-between text-xs font-mono ${
            isDark ? "border-white/10 text-[#A9B3AD]" : "border-emerald-500/15 text-[#4B5D55]"
          }`}
        >
          <span>≈ <strong className={isDark ? "text-white" : "text-[#0B1F16]"}>$482K</strong> pool</span>
          <span><strong className={isDark ? "text-white" : "text-[#0B1F16]"}>2,842</strong> traders</span>
          <Link
            href="/market/sol-outperform-eth"
            className="text-emerald-500 font-bold hover:underline"
          >
            Trade ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
