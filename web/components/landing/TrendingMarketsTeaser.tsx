"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";
import BeliefMarketCard, { BeliefMarket } from "../BeliefMarketCard";

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
}

export type TabCategory = "all" | "crypto" | "ai" | "macro";

const DEFAULT_MARKETS: BeliefMarket[] = [
  {
    id: "market-1",
    statement: "Will ETH reach $5,000 before end of Q4 2026?",
    author: "VitalikFan",
    authorHandle: "@vitalikfan",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 45.5,
    disagreePool: 15.2,
    agreeParticipants: 58,
    disagreeParticipants: 22,
    closeTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: "Crypto",
  },
  {
    id: "market-2",
    statement: "AI agent transaction volume will surpass 20% on L2s.",
    author: "CryptoOracle",
    authorHandle: "@cryptooracle",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 20.0,
    disagreePool: 30.0,
    agreeParticipants: 35,
    disagreeParticipants: 65,
    closeTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "AI",
  },
];

export default function TrendingMarketsTeaser({ theme: propTheme }: TrendingMarketsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const [activeTab, setActiveTab] = useState<TabCategory>("all");
  const [markets, setMarkets] = useState<BeliefMarket[]>(DEFAULT_MARKETS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrendingMarkets() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.markets && Array.isArray(data.markets)) {
            const mapped: BeliefMarket[] = data.markets.map((m: any, idx: number) => ({
              id: m.id || `market-${idx + 1}`,
              statement: m.statement || m.title || "Belief Market",
              author: m.author || m.creator || "Anonymous",
              authorHandle: m.authorHandle || m.creator_handle || undefined,
              isConfirmed: Boolean(m.isConfirmed ?? m.creator_confirmed ?? false),
              status: m.status || "OPEN",
              agreePool: Number(m.agreePool ?? m.agree_pool ?? m.yes_pool ?? 0),
              disagreePool: Number(m.disagreePool ?? m.disagree_pool ?? m.no_pool ?? 0),
              agreeParticipants: Number(m.agreeParticipants ?? m.agree_participants ?? 10),
              disagreeParticipants: Number(m.disagreeParticipants ?? m.disagree_participants ?? 5),
              closeTime: m.closeTime || m.deadline || new Date(Date.now() + 86400000 * 3).toISOString(),
              category: m.category || "Crypto",
            }));
            setMarkets(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrendingMarkets();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMarkets =
    activeTab === "all"
      ? markets
      : markets.filter((m) => (m.category || "").toLowerCase() === activeTab);

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
              Live Conviction Markets
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
            Trending Belief Markets
          </h2>
        </div>
        <Link
          href="/markets"
          className={`text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border ${
            isDark
              ? "bg-white/5 border-emerald-500/20 text-[#34D399] hover:bg-emerald-500/10 hover:border-emerald-400/40"
              : "bg-white border-emerald-500/20 text-[#0E7A4E] hover:bg-emerald-50 shadow-xs"
          }`}
        >
          <span>View All Markets</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "crypto", "ai", "macro"] as TabCategory[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMarkets.map((market) => (
            <BeliefMarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </section>
  );
}
