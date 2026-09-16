"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
}

export default function TrendingMarketsTeaser({ theme: propTheme }: TrendingMarketsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
            Live Binary Betting
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
            Trending Prediction Markets
          </h2>
        </div>
        <Link
          href="/predictions"
          className={`text-sm font-semibold flex items-center gap-1 group ${
            isDark ? "text-[#34D399] hover:text-[#6EE7B7]" : "text-[#0E7A4E] hover:text-[#047857]"
          }`}
        >
          <span>View All 24 Markets</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 ${
            isDark
              ? "bg-[#0A0F0C] border border-emerald-500/20 hover:border-emerald-400/40 shadow-xl"
              : "bg-white/95 border border-emerald-500/15 hover:border-emerald-400/40 light-card-shine hover:shadow-[0_12px_40px_rgba(14,122,78,0.1),_inset_0_1px_0_#ffffff]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                  isDark
                    ? "bg-emerald-950/80 border-emerald-500/30 text-[#34D399]"
                    : "bg-emerald-100 border-emerald-300 text-[#0E7A4E]"
                }`}
              >
                Featured • Crypto
              </span>
              <span className="text-xs font-mono text-warning-amber flex items-center gap-1 font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ends in 14d 8h
              </span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Will Ethereum trade above $4,500 before the end of Q4 2026?
            </h3>

            <div className="space-y-3 mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center justify-between text-sm font-mono font-bold">
                <span className="text-yes-green">YES 68% (1.47x Return)</span>
                <span className="text-no-red">NO 32% (3.12x Return)</span>
              </div>

              <div className={`h-3 w-full rounded-full overflow-hidden flex ${isDark ? "bg-white/10" : "bg-emerald-950/10"}`}>
                <div className="h-full bg-yes-green transition-all" style={{ width: "68%" }} />
                <div className="h-full bg-no-red transition-all" style={{ width: "32%" }} />
              </div>

              <div className={`flex items-center justify-between text-xs font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                <span>Total Pool: <strong>48.20 ETH</strong></span>
                <span>Yes: 32.78 ETH / No: 15.42 ETH</span>
              </div>
            </div>
          </div>

          <div className={`pt-4 border-t grid grid-cols-2 gap-3 ${isDark ? "border-white/10" : "border-emerald-500/10"}`}>
            <Link
              href="/predictions"
              className="py-3 px-4 rounded-xl bg-yes-green text-slate-950 hover:bg-emerald-400 text-sm font-mono font-bold text-center transition-all shadow-sm active:scale-[0.98]"
            >
              Bet YES (68%)
            </Link>
            <Link
              href="/predictions"
              className="py-3 px-4 rounded-xl bg-no-red text-white hover:bg-rose-600 text-sm font-mono font-bold text-center transition-all shadow-sm active:scale-[0.98]"
            >
              Bet NO (32%)
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          <div
            className={`rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 ${
              isDark
                ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30 shadow-md"
                : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_8px_30px_rgba(14,122,78,0.08),_inset_0_1px_0_#ffffff]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-medium ${
                    isDark ? "bg-white/5 border-white/10 text-white/80" : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
                  }`}
                >
                  Layer 2
                </span>
                <span className="text-xs font-mono text-warning-amber">Ends in 6d 12h</span>
              </div>
              <h4 className={`text-base font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                Will Arbitrum Daily Active Users exceed 1.5 Million in October?
              </h4>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-yes-green font-bold">YES 54%</span>
                <span className="text-no-red font-bold">NO 46%</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden flex mb-2 ${isDark ? "bg-white/10" : "bg-emerald-950/10"}`}>
                <div className="h-full bg-yes-green" style={{ width: "54%" }} />
                <div className="h-full bg-no-red" style={{ width: "46%" }} />
              </div>
              <div className={`text-[11px] font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Pool: 35.50 ETH (19.17 / 16.33)
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-emerald-500/10 grid grid-cols-2 gap-2">
              <Link href="/predictions" className="py-1.5 rounded-lg bg-yes-green/10 hover:bg-yes-green/20 text-yes-green text-xs font-mono font-bold text-center border border-yes-green/30">Bet YES</Link>
              <Link href="/predictions" className="py-1.5 rounded-lg bg-no-red/10 hover:bg-no-red/20 text-no-red text-xs font-mono font-bold text-center border border-no-red/30">Bet NO</Link>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 ${
              isDark
                ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30 shadow-md"
                : "bg-white/95 border border-emerald-500/10 hover:border-emerald-400/30 light-card-shine hover:shadow-[0_8px_30px_rgba(14,122,78,0.08),_inset_0_1px_0_#ffffff]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-medium ${
                    isDark ? "bg-white/5 border-white/10 text-white/80" : "bg-emerald-50/80 border-emerald-500/15 text-[#0E7A4E]"
                  }`}
                >
                  Macro
                </span>
                <span className="text-xs font-mono text-warning-amber">Ends in 28d 4h</span>
              </div>
              <h4 className={`text-base font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                Will total Crypto Market Cap surpass $3.5 Trillion this year?
              </h4>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-yes-green font-bold">YES 79%</span>
                <span className="text-no-red font-bold">NO 21%</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden flex mb-2 ${isDark ? "bg-white/10" : "bg-emerald-950/10"}`}>
                <div className="h-full bg-yes-green" style={{ width: "79%" }} />
                <div className="h-full bg-no-red" style={{ width: "21%" }} />
              </div>
              <div className={`text-[11px] font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                Pool: 64.80 ETH (51.19 / 13.61)
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-emerald-500/10 grid grid-cols-2 gap-2">
              <Link href="/predictions" className="py-1.5 rounded-lg bg-yes-green/10 hover:bg-yes-green/20 text-yes-green text-xs font-mono font-bold text-center border border-yes-green/30">Bet YES</Link>
              <Link href="/predictions" className="py-1.5 rounded-lg bg-no-red/10 hover:bg-no-red/20 text-no-red text-xs font-mono font-bold text-center border border-no-red/30">Bet NO</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
