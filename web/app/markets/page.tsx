"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import BeliefMarketCard, { BeliefMarket } from "@/components/BeliefMarketCard";
import DiscoveryFilter, { DiscoveryTab, MarketCategoryFilter } from "@/components/DiscoveryFilter";

export default function MarketsPage() {
  const contextTheme = useTheme();
  const isDark = (contextTheme.theme || "dark") === "dark";

  const [markets, setMarkets] = useState<BeliefMarket[]>([]);
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("trending");
  const [activeCategory, setActiveCategory] = useState<MarketCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadMarkets() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (activeTab) queryParams.set("tab", activeTab);
        if (activeCategory !== "all") queryParams.set("category", activeCategory);
        if (searchQuery) queryParams.set("search", searchQuery);

        const res = await fetch(`/api/markets?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.markets && Array.isArray(data.markets)) {
            const mapped: BeliefMarket[] = data.markets
              .filter((m: any) => m && (m.statement || m.title))
              .map((m: any, idx: number) => ({
                id: m.id || `mkt-${idx + 1}`,
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
                volume: Number(m.volume ?? m.total_pool ?? 0),
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

    loadMarkets();
    return () => {
      isMounted = false;
    };
  }, [activeTab, activeCategory, searchQuery]);

  const filteredAndSortedMarkets = markets
    .filter((m) => {
      if (activeTab === "confirmed" && !m.isConfirmed) return false;
      if (activeCategory !== "all") {
        const categoryLower = (m.category || "").toLowerCase();
        const statementLower = (m.statement || "").toLowerCase();
        if (activeCategory === "eth") {
          return (
            categoryLower === "eth" ||
            categoryLower === "crypto" ||
            statementLower.includes("eth") ||
            statementLower.includes("ethereum") ||
            statementLower.includes("sol")
          );
        }
        if (activeCategory === "btc") {
          return (
            categoryLower === "btc" ||
            categoryLower === "bitcoin" ||
            statementLower.includes("btc") ||
            statementLower.includes("bitcoin")
          );
        }
        if (activeCategory === "arb") {
          return (
            categoryLower === "arb" ||
            categoryLower === "arbitrum" ||
            statementLower.includes("arb") ||
            statementLower.includes("arbitrum") ||
            statementLower.includes("rollup")
          );
        }
        if (activeCategory === "macro") {
          return (
            categoryLower === "macro" ||
            categoryLower === "economics" ||
            statementLower.includes("fed") ||
            statementLower.includes("rate") ||
            statementLower.includes("inflation") ||
            statementLower.includes("cpi")
          );
        }
        return categoryLower === String(activeCategory).toLowerCase();
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          m.statement.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          (m.authorHandle && m.authorHandle.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "volume") return (b.volume || (b.agreePool + b.disagreePool)) - (a.volume || (a.agreePool + a.agreePool));
      if (activeTab === "ending_soon") {
        return new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime();
      }
      if (activeTab === "newest") {
        return b.id.localeCompare(a.id);
      }
      return (b.agreePool + b.disagreePool) - (a.agreePool + a.disagreePool);
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`text-xs font-mono font-bold uppercase tracking-widest ${
                isDark ? "text-[#34D399]" : "text-[#0E7A4E]"
              }`}
            >
              Dual-Chain Belief Markets
            </span>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-[#0B1F16]"
            }`}
          >
            Explore Belief Markets
          </h1>
          <p
            className={`text-sm sm:text-base mt-1 ${
              isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"
            }`}
          >
            Discover conviction pools, back social beliefs with AGREE / DISAGREE stakes, and earn decentralized payouts.
          </p>
        </div>
      </div>

      <div className="animate-slide-up stagger-1">
        <DiscoveryFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-white/5 rounded-2xl" />
        </div>
      ) : filteredAndSortedMarkets.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No belief markets found
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              No active markets match your selected filter criteria.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up stagger-2">
          {filteredAndSortedMarkets.map((market) => (
            <BeliefMarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
