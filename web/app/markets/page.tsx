"use client";

import React, { useState, useEffect } from "react";
import BeliefMarketCard, { BeliefMarket } from "@/components/BeliefMarketCard";
import DiscoveryFilter, { DiscoveryTab, MarketCategoryFilter } from "@/components/DiscoveryFilter";

const INITIAL_MARKETS: BeliefMarket[] = [
  {
    id: "market-1",
    statement: "Will ETH trade above $5000 in Q4 2026?",
    author: "VitalikFan",
    authorHandle: "@vitalikfan",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 100,
    disagreePool: 50,
    agreeParticipants: 70,
    disagreeParticipants: 30,
    closeTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: "Crypto",
    volume: 150,
  },
  {
    id: "market-2",
    statement: "Will Solana DEX volume overtake Ethereum mainnet in 2026?",
    author: "SolMaxi",
    authorHandle: "@solmaxi",
    isConfirmed: false,
    status: "DETECTED",
    agreePool: 20,
    disagreePool: 80,
    agreeParticipants: 25,
    disagreeParticipants: 75,
    closeTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "Crypto",
    volume: 100,
  },
  {
    id: "market-3",
    statement: "Will AI agents generate $10B in on-chain revenue by 2027?",
    author: "AIThinker",
    authorHandle: "@aithinker",
    isConfirmed: true,
    status: "OPEN",
    agreePool: 200,
    disagreePool: 100,
    agreeParticipants: 80,
    disagreeParticipants: 20,
    closeTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    category: "AI",
    volume: 300,
  },
];

export default function MarketsPage() {
  const [markets, setMarkets] = useState<BeliefMarket[]>(INITIAL_MARKETS);
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("trending");
  const [activeCategory, setActiveCategory] = useState<MarketCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
            const mapped: BeliefMarket[] = data.markets.map((m: any, idx: number) => ({
              id: m.id || `mkt-${idx + 1}`,
              statement: m.statement ?? m.title ?? "Belief Statement",
              author: m.author ?? m.beliefs?.author ?? "Anonymous",
              authorHandle: m.authorHandle ?? m.beliefs?.author ?? undefined,
              isConfirmed: Boolean(m.isConfirmed ?? (m.beliefs?.status === "CONFIRMED")),
              status: m.status ?? "OPEN",
              agreePool: Number(m.agreePool ?? m.agree_pool ?? 0),
              disagreePool: Number(m.disagreePool ?? m.disagree_pool ?? 0),
              agreeParticipants: Number(m.agreeParticipants ?? m.agree_participants ?? 0),
              disagreeParticipants: Number(m.disagreeParticipants ?? m.disagree_participants ?? 0),
              closeTime: m.closeTime ?? m.close_time ?? m.deadline ?? new Date(Date.now() + 86400000 * 3).toISOString(),
              category: m.category ?? "Crypto",
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
      if (activeCategory !== "all" && (m.category || "").toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
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
      if (activeTab === "volume") return (b.volume || 0) - (a.volume || 0);
      if (activeTab === "ending_soon") {
        return new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime();
      }
      return (b.agreePool + b.disagreePool) - (a.agreePool + a.disagreePool);
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Dual-Chain Belief Markets
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Explore Belief Markets
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Discover conviction pools, back social beliefs with AGREE/DISAGREE stakes, and earn decentralized payouts.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        </div>
      ) : filteredAndSortedMarkets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            No belief markets found matching your selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up stagger-2">
          {filteredAndSortedMarkets.map((market) => (
            <BeliefMarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
