"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BeliefMarketCard from "../BeliefMarketCard";
import {
  BeliefMarket,
  TrendingMarketsTeaserProps,
  TabCategory,
  CategoryTabItem,
} from "@/types";

export type { TrendingMarketsTeaserProps, TabCategory, CategoryTabItem };

export const CATEGORY_TABS: CategoryTabItem[] = [
  { id: "all", label: "All" },
  { id: "eth", label: "ETH" },
  { id: "btc", label: "BTC" },
  { id: "arb", label: "ARB" },
  { id: "macro", label: "Macro" },
];

export default function TrendingMarketsTeaser({}: TrendingMarketsTeaserProps) {
  const [activeTab, setActiveTab] = useState<TabCategory>("all");
  const [markets, setMarkets] = useState<BeliefMarket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTrendingMarkets() {
      try {
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.markets && Array.isArray(data.markets)) {
            const mapped: BeliefMarket[] = data.markets
              .filter((m: any) => m && (m.statement || m.title))
              .map((m: any, idx: number) => {
                const authorName = m.author ?? m.beliefs?.author ?? "Unknown";
                const authorHandle = m.authorHandle && m.authorHandle !== authorName ? m.authorHandle : undefined;
                return {
                  id: m.id || `market-${idx + 1}`,
                  statement: m.statement ?? m.title,
                  author: authorName,
                  authorHandle: authorHandle,
                  isConfirmed: Boolean(m.isConfirmed ?? (m.beliefs?.status === "CONFIRMED")),
                  status: m.status ?? "OPEN",
                  agreePool: Number(m.agreePool ?? m.agree_pool ?? 0),
                  disagreePool: Number(m.disagreePool ?? m.disagree_pool ?? 0),
                  agreeParticipants: Number(m.agreeParticipants ?? m.agree_participants ?? 0),
                  disagreeParticipants: Number(m.disagreeParticipants ?? m.disagree_participants ?? 0),
                  closeTime: m.closeTime ?? m.close_time ?? m.deadline ?? "",
                  category: m.category ?? "General",
                  volume: Number(m.volume ?? m.total_pool ?? 0),
                };
              });
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
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0E7A4E] dark:text-[#34D399]">
              Live Conviction Markets
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F16] dark:text-white">
            Trending Belief Markets
          </h2>
        </div>
        <Link
          href="/markets"
          className="hidden sm:flex text-sm font-semibold items-center gap-1.5 px-4 py-2 rounded-xl transition-all border bg-white dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-[#0E7A4E] dark:text-[#34D399] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-400/40 shadow-xs dark:shadow-none"
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
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === tab.id
                ? "bg-[#10221A] dark:bg-emerald-500 text-white dark:text-black border-[#10221A] dark:border-emerald-400 shadow-md"
                : "bg-white dark:bg-[#0A0F0C] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-[#A9B3AD] hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 shadow-xs dark:shadow-none"
            }`}
          >
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarkets.slice(0, 6).map((market, idx) => (
              <div key={market.id} className={`h-full ${idx >= 3 ? "hidden sm:block" : ""}`}>
                <BeliefMarketCard market={market} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex sm:hidden justify-center">
            <Link
              href="/markets"
              className="w-full text-sm font-semibold flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all border bg-white dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-[#0E7A4E] dark:text-[#34D399] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-400/40 shadow-xs dark:shadow-none"
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
        </>
      )}
    </section>
  );
}
