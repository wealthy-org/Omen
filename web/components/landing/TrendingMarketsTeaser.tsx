"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
}

export default function TrendingMarketsTeaser({ theme: propTheme }: TrendingMarketsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const MARKETS = [
    {
      id: 1,
      category: "Crypto",
      title: "Will Ethereum trade above $4,500 before the end of Q4 2026?",
      deadline: "Ends in 14d 8h",
      totalPool: "48.20 ETH",
      yesOdds: 68,
      noOdds: 32,
      yesPool: "32.78 ETH",
      noPool: "15.42 ETH",
    },
    {
      id: 2,
      category: "Layer 2",
      title: "Will Arbitrum Daily Active Users exceed 1.5 Million in October?",
      deadline: "Ends in 6d 12h",
      totalPool: "35.50 ETH",
      yesOdds: 54,
      noOdds: 46,
      yesPool: "19.17 ETH",
      noPool: "16.33 ETH",
    },
    {
      id: 3,
      category: "Macro",
      title: "Will total Crypto Market Cap surpass $3.5 Trillion this year?",
      deadline: "Ends in 28d 4h",
      totalPool: "64.80 ETH",
      yesOdds: 79,
      noOdds: 21,
      yesPool: "51.19 ETH",
      noPool: "13.61 ETH",
    },
  ];

  return (
    <section className="w-full my-12">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MARKETS.map((market) => (
          <div
            key={market.id}
            className={`rounded-2xl p-6 shadow-md transition-all flex flex-col justify-between group ${
              isDark
                ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30"
                : "bg-white border border-emerald-900/10 hover:border-emerald-600/30 shadow-[0_4px_20px_rgba(14,122,78,0.06)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-xs font-mono px-2.5 py-0.5 rounded-full border font-medium ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white/80"
                      : "bg-emerald-50 border-emerald-200 text-[#0E7A4E]"
                  }`}
                >
                  {market.category}
                </span>
                <span className="text-xs font-mono text-warning-amber flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {market.deadline}
                </span>
              </div>

              <h3 className={`text-base font-bold tracking-tight leading-snug line-clamp-2 mb-4 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
                {market.title}
              </h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs font-mono font-medium">
                  <span className="text-yes-green">YES {market.yesOdds}%</span>
                  <span className="text-no-red">NO {market.noOdds}%</span>
                </div>

                <div className={`h-2 w-full rounded-full overflow-hidden flex ${isDark ? "bg-white/10" : "bg-emerald-950/10"}`}>
                  <div
                    className="h-full bg-yes-green transition-all"
                    style={{ width: `${market.yesOdds}%` }}
                  />
                  <div
                    className="h-full bg-no-red transition-all"
                    style={{ width: `${market.noOdds}%` }}
                  />
                </div>

                <div className={`flex items-center justify-between text-[11px] font-mono ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
                  <span>Pool: {market.totalPool}</span>
                  <span>{market.yesPool} / {market.noPool}</span>
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t grid grid-cols-2 gap-2 ${isDark ? "border-white/5" : "border-emerald-900/10"}`}>
              <Link
                href="/predictions"
                className="py-2 px-3 rounded-lg bg-yes-green/10 hover:bg-yes-green/20 border border-yes-green/30 text-yes-green text-xs font-mono font-bold text-center transition-colors"
              >
                Bet YES
              </Link>
              <Link
                href="/predictions"
                className="py-2 px-3 rounded-lg bg-no-red/10 hover:bg-no-red/20 border border-no-red/30 text-no-red text-xs font-mono font-bold text-center transition-colors"
              >
                Bet NO
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
