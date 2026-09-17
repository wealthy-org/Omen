"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MarketCategoryFilter } from "@/components/MarketCategoryFilter";
import { MarketCard, MarketData, MarketOutcome } from "@/components/MarketCard";
import { BettingModal } from "@/components/BettingModal";

export default function PredictionsPage() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("highest-pool");
  const [selectedOutcomeInfo, setSelectedOutcomeInfo] = useState<string | null>(null);

  const [bettingModal, setBettingModal] = useState<{
    isOpen: boolean;
    market: MarketData | null;
    outcome: MarketOutcome;
  }>({
    isOpen: false,
    market: null,
    outcome: "YES",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveMarkets() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.markets && Array.isArray(data.markets)) {
            const mapped: MarketData[] = data.markets.map((m: any, index: number) => {
              const yes = Number(m.yes_pool || 0);
              const no = Number(m.no_pool || 0);
              const total = yes + no;
              const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
              const noPct = 100 - yesPct;
              return {
                id: m.id || `mkt-${m.contract_market_id || index + 1}`,
                title: m.title,
                category: (m.category || "CRYPTO").toUpperCase(),
                status: m.status === "active" ? "active" : "resolved",
                endTime: m.deadline ? `Ends ${new Date(m.deadline).toLocaleDateString()}` : "Active",
                totalPool: total.toFixed(2),
                yesPercentage: yesPct,
                noPercentage: noPct,
                volume: total.toFixed(2),
                resolvedOutcome:
                  m.status === "resolved_yes"
                    ? "YES"
                    : m.status === "resolved_no"
                    ? "NO"
                    : undefined,
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

    fetchLiveMarkets();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: markets.length,
      trending: markets.filter(
        (m) =>
          m.category.toLowerCase() === "trending" ||
          parseFloat(m.volume || "0") > 50
      ).length,
      crypto: markets.filter(
        (m) =>
          m.category.toLowerCase() === "crypto" ||
          m.category.toLowerCase() === "l2"
      ).length,
      meme: markets.filter((m) => m.category.toLowerCase() === "meme").length,
      "closing-soon": markets.filter((m) => m.status === "closing-soon").length,
      resolved: markets.filter((m) => m.status === "resolved").length,
    };
    return counts;
  }, [markets]);

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      if (selectedCategory !== "all") {
        if (selectedCategory === "trending") {
          const isTrending =
            market.category.toLowerCase() === "trending" ||
            parseFloat(market.volume || "0") > 50;
          if (!isTrending) return false;
        } else if (selectedCategory === "crypto") {
          const isCrypto =
            market.category.toLowerCase() === "crypto" ||
            market.category.toLowerCase() === "l2";
          if (!isCrypto) return false;
        } else if (selectedCategory === "meme") {
          if (market.category.toLowerCase() !== "meme") return false;
        } else if (selectedCategory === "closing-soon") {
          if (market.status !== "closing-soon") return false;
        } else if (selectedCategory === "resolved") {
          if (market.status !== "resolved") return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = market.title.toLowerCase().includes(query);
        const matchesCat = market.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat) return false;
      }

      return true;
    });
  }, [markets, selectedCategory, searchQuery]);

  const sortedMarkets = useMemo(() => {
    const list = [...filteredMarkets];
    if (sortBy === "highest-pool") {
      return list.sort((a, b) => parseFloat(b.totalPool) - parseFloat(a.totalPool));
    }
    if (sortBy === "lowest-pool") {
      return list.sort((a, b) => parseFloat(a.totalPool) - parseFloat(b.totalPool));
    }
    if (sortBy === "closing-soon") {
      return list.sort((a, b) => (a.status === "closing-soon" ? -1 : 1));
    }
    return list;
  }, [filteredMarkets, sortBy]);

  const totalVolume = useMemo(() => {
    return markets.reduce((acc, m) => acc + parseFloat(m.volume || "0"), 0).toFixed(1);
  }, [markets]);

  const activeCount = useMemo(() => {
    return markets.filter((m) => m.status === "active" || m.status === "closing-soon").length;
  }, [markets]);

  const handleOpenBetModal = (market: MarketData, outcome: MarketOutcome) => {
    setBettingModal({
      isOpen: true,
      market,
      outcome,
    });
  };

  const handleCloseBetModal = () => {
    setBettingModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmBet = ({
    amount,
    outcome,
  }: {
    marketId: string | number;
    outcome: MarketOutcome;
    amount: string;
  }) => {
    if (!bettingModal.market) return;
    const title = bettingModal.market.title;
    setSelectedOutcomeInfo(
      `Confirmed bet of ${amount} ETH on ${outcome} for "${title}"! Position registered.`
    );
    handleCloseBetModal();
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("highest-pool");
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800 animate-slide-down">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Arbitrum Sepolia Markets
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Prediction Markets
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Take positions on real-world events, crypto milestones, and macroeconomic trends. Stake ETH directly via smart contracts.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono animate-slide-right">
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover-lift">
            <span className="text-zinc-500 dark:text-zinc-400 block">Total Pool Volume</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{totalVolume} ETH</span>
          </div>
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover-lift">
            <span className="text-zinc-500 dark:text-zinc-400 block">Active Markets</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</span>
          </div>
        </div>
      </div>

      {selectedOutcomeInfo && (
        <div
          role="status"
          className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-200 animate-slide-down"
        >
          <span>{selectedOutcomeInfo}</span>
          <button
            type="button"
            onClick={() => setSelectedOutcomeInfo(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 text-xs font-bold font-mono"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="animate-slide-up stagger-1">
        <MarketCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          marketCounts={categoryCounts}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
            />
          ))}
        </div>
      ) : sortedMarkets.length > 0 ? (
        <div
          data-testid="predictions-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up stagger-2"
        >
          {sortedMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onSelectOutcome={(m, outcome) => handleOpenBetModal(m, outcome)}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="empty-markets"
          className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4 animate-scale-in"
        >
          <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">No markets found</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            No prediction markets matched your query. Try clearing your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all hover-lift shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      <BettingModal
        isOpen={bettingModal.isOpen}
        onClose={handleCloseBetModal}
        market={bettingModal.market}
        initialOutcome={bettingModal.outcome}
        onConfirmBet={handleConfirmBet}
      />
    </div>
  );
}
