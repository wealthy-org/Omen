"use client";

import { useTheme } from "../ThemeProvider";

export interface StatsOverviewProps {
  theme?: "dark" | "light";
}

export default function StatsOverview({ theme: propTheme }: StatsOverviewProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const STATS = [
    {
      label: "Total Value Locked",
      value: "148.50 ETH",
      subtext: "+24.6% this week",
      trend: "up",
      badge: "Onchain Pools",
    },
    {
      label: "Active Prediction Pools",
      value: "24 Markets",
      subtext: "Crypto & Tech binary markets",
      trend: "neutral",
      badge: "Real-time Odds",
    },
    {
      label: "Points Distributed",
      value: "1,420,000 PTS",
      subtext: "Season 1 Airdrop Pool",
      trend: "up",
      badge: "Gamified Farming",
    },
    {
      label: "Active Bettors & Quests",
      value: "4,120 Wallets",
      subtext: "Arbitrum Sepolia verified",
      trend: "up",
      badge: "Community",
    },
  ];

  return (
    <section className="w-full my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl p-6 shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
              isDark
                ? "bg-[#0A0F0C] border border-emerald-500/15 hover:border-emerald-400/30"
                : "bg-white border border-emerald-900/10 hover:border-emerald-600/30 shadow-[0_4px_20px_rgba(14,122,78,0.05)]"
            }`}
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-colors pointer-events-none ${
                isDark ? "bg-emerald-500/5 group-hover:bg-emerald-500/15" : "bg-emerald-500/10 group-hover:bg-emerald-500/20"
              }`}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-xs font-mono font-medium uppercase tracking-wider ${
                    isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
                  }`}
                >
                  {stat.label}
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark
                      ? "bg-emerald-950/60 border-emerald-500/20 text-[#34D399]"
                      : "bg-emerald-50 border-emerald-200 text-[#0E7A4E]"
                  }`}
                >
                  {stat.badge}
                </span>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-colors ${
                  isDark
                    ? "text-white group-hover:text-[#34D399]"
                    : "text-[#0B1F16] group-hover:text-[#0E7A4E]"
                }`}
              >
                {stat.value}
              </div>
            </div>

            <div
              className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDark ? "border-white/5 text-[#A9B3AD]" : "border-emerald-900/5 text-[#4B5D55]"
              }`}
            >
              <span>{stat.subtext}</span>
              {stat.trend === "up" && (
                <span className={`font-mono font-semibold flex items-center gap-0.5 ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Live
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
