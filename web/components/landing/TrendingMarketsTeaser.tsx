"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../ThemeProvider";
import BeliefMarketCard, { BeliefMarket } from "../BeliefMarketCard";

export interface TrendingMarketsTeaserProps {
  theme?: "dark" | "light";
}

export type TabCategory = "all" | "eth" | "btc" | "arb" | "macro";

export interface CategoryTabItem {
  id: TabCategory;
  label: string;
  icon: string;
}

export const CATEGORY_TABS: CategoryTabItem[] = [
  { id: "all", label: "All", icon: "/icons/hot.webp" },
  { id: "eth", label: "ETH", icon: "/icons/eth.webp" },
  { id: "btc", label: "BTC", icon: "/icons/btc.webp" },
  { id: "arb", label: "ARB", icon: "/icons/arb.webp" },
  { id: "macro", label: "Macro", icon: "/icons/macro.webp" },
];

export const CURATED_SEED_MARKETS: BeliefMarket[] = [
  {
    id: "market-sol-eth",
    statement: "SOL will outperform ETH this month",
    author: "TraderX",
    authorHandle: "@TraderX",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 87.5,
    disagreePool: 34.0,
    agreeParticipants: 2046,
    disagreeParticipants: 796,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    category: "ETH",
    volume: 482000,
  },
  {
    id: "market-eth-5000",
    statement: "ETH closes above $5,000 before year end",
    author: "MacroDad",
    authorHandle: "@macrodad",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 41.2,
    disagreePool: 59.8,
    agreeParticipants: 840,
    disagreeParticipants: 1200,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 85).toISOString(),
    category: "ETH",
    volume: 310000,
  },
  {
    id: "market-btc-ath",
    statement: "BTC prints a new all-time high in Q4",
    author: "OnchainWitch",
    authorHandle: "@onchainwitch",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 63.0,
    disagreePool: 37.0,
    agreeParticipants: 610,
    disagreeParticipants: 350,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 68).toISOString(),
    category: "BTC",
    volume: 195000,
  },
  {
    id: "market-btc-reserve",
    statement: "US Bitcoin Strategic Reserve legislation passes this session",
    author: "SatoshiDisciple",
    authorHandle: "@satoshidisciple",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 52.4,
    disagreePool: 47.6,
    agreeParticipants: 1120,
    disagreeParticipants: 980,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
    category: "BTC",
    volume: 240000,
  },
  {
    id: "market-arb-tvl",
    statement: "Arbitrum TVL doubles following Stylus ecosystem deployment",
    author: "RollupMaxi",
    authorHandle: "@rollupmaxi",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 78.0,
    disagreePool: 22.0,
    agreeParticipants: 740,
    disagreeParticipants: 210,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    category: "ARB",
    volume: 156000,
  },
  {
    id: "market-arb-orbit",
    statement: "Arbitrum Orbit ecosystem reaches 100 live chains by Q4",
    author: "OffchainDev",
    authorHandle: "@offchaindev",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 45.0,
    disagreePool: 55.0,
    agreeParticipants: 430,
    disagreeParticipants: 510,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
    category: "ARB",
    volume: 112000,
  },
  {
    id: "market-fed-rates",
    statement: "The Federal Reserve cuts interest rates at the next FOMC meeting",
    author: "QuantFern",
    authorHandle: "@quantfern",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 60.5,
    disagreePool: 40.0,
    agreeParticipants: 1530,
    disagreeParticipants: 1010,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
    category: "Macro",
    volume: 221000,
  },
  {
    id: "market-global-inflation",
    statement: "Core US CPI year-over-year prints below 2.5% in next release",
    author: "AlphaMacro",
    authorHandle: "@alphamacro",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 68.0,
    disagreePool: 32.0,
    agreeParticipants: 920,
    disagreeParticipants: 440,
    closeTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    category: "Macro",
    volume: 184000,
  },
];

export default function TrendingMarketsTeaser({ theme: propTheme }: TrendingMarketsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";
  const [activeTab, setActiveTab] = useState<TabCategory>("all");
  const [markets, setMarkets] = useState<BeliefMarket[]>(CURATED_SEED_MARKETS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrendingMarkets() {
      try {
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.markets && Array.isArray(data.markets) && data.markets.length > 0) {
            const mapped: BeliefMarket[] = data.markets
              .filter((m: any) => m && (m.statement || m.title))
              .map((m: any, idx: number) => ({
                id: m.id || `market-${idx + 1}`,
                statement: m.statement ?? m.title,
                author: m.author ?? m.beliefs?.author ?? "Unknown",
                authorHandle: m.authorHandle ?? m.beliefs?.author ?? undefined,
                isConfirmed: Boolean(m.isConfirmed ?? (m.beliefs?.status === "CONFIRMED")),
                status: m.status ?? "OPEN",
                agreePool: Number(m.agreePool ?? m.agree_pool ?? 0),
                disagreePool: Number(m.disagreePool ?? m.disagree_pool ?? 0),
                agreeParticipants: Number(m.agreeParticipants ?? m.agree_participants ?? 0),
                disagreeParticipants: Number(m.disagreeParticipants ?? m.disagree_participants ?? 0),
                closeTime: m.closeTime ?? m.close_time ?? m.deadline ?? "",
                category: m.category ?? "General",
              }));

            if (mapped.length >= 4) {
              setMarkets(mapped);
            } else {
              const combined = [...mapped];
              for (const seed of CURATED_SEED_MARKETS) {
                if (!combined.some((c) => c.statement.toLowerCase() === seed.statement.toLowerCase())) {
                  combined.push(seed);
                }
              }
              setMarkets(combined);
            }
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
      : markets.filter((m) => {
          const categoryLower = (m.category || "").toLowerCase();
          const statementLower = (m.statement || "").toLowerCase();
          if (activeTab === "eth") {
            return (
              categoryLower === "eth" ||
              categoryLower === "crypto" ||
              statementLower.includes("eth") ||
              statementLower.includes("ethereum") ||
              statementLower.includes("sol")
            );
          }
          if (activeTab === "btc") {
            return (
              categoryLower === "btc" ||
              categoryLower === "bitcoin" ||
              statementLower.includes("btc") ||
              statementLower.includes("bitcoin")
            );
          }
          if (activeTab === "arb") {
            return (
              categoryLower === "arb" ||
              categoryLower === "arbitrum" ||
              statementLower.includes("arb") ||
              statementLower.includes("arbitrum") ||
              statementLower.includes("rollup")
            );
          }
          if (activeTab === "macro") {
            return (
              categoryLower === "macro" ||
              categoryLower === "economics" ||
              statementLower.includes("fed") ||
              statementLower.includes("rate") ||
              statementLower.includes("inflation") ||
              statementLower.includes("cpi")
            );
          }
          return categoryLower === activeTab;
        });

  return (
    <section id="markets" className="w-full my-8 sm:my-12 scroll-mt-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span
              className={`text-xs font-mono font-bold uppercase tracking-widest ${
                isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
              }`}
            >
              Live Conviction Markets
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
          >
            Trending Belief Markets
          </h2>
        </div>
        <Link
          href="/markets"
          className={`text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border ${
            isDark
              ? "bg-white/5 border-white/10 text-[#34D399] hover:bg-emerald-500/10 hover:border-emerald-400/40"
              : "bg-white border-emerald-500/20 text-[#0E7A4E] hover:bg-emerald-50 shadow-xs"
          }`}
        >
          <span>Explore All Markets</span>
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

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === tab.id
                ? isDark
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-md"
                  : "bg-[#10221A] text-white border-[#10221A] shadow-md"
                : isDark
                  ? "bg-[#0A0F0C] border-white/10 text-[#A9B3AD] hover:text-white hover:border-white/20"
                  : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-xs"
            }`}
          >
            <Image
              src={tab.icon}
              alt={`${tab.label} icon`}
              width={18}
              height={18}
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain shrink-0"
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="p-8 sm:p-10 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No trending belief markets found
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {activeTab === "all"
                ? "No active belief markets are available right now. Be the first to create one!"
                : `No active belief markets found in the ${activeTab.toUpperCase()} category.`}
            </p>
          </div>
          <Link
            href="/create"
            className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Submit New Belief</span>
            <span>↗</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {filteredMarkets.map((market) => (
            <BeliefMarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </section>
  );
}
