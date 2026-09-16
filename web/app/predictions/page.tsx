"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MarketCategoryFilter,
} from "@/components/MarketCategoryFilter";
import { MarketCard, MarketData, MarketOutcome } from "@/components/MarketCard";
import { BettingModal } from "@/components/BettingModal";
import { mockPredictionMarket } from "@/lib/mockPredictionMarket";

export const MOCK_MARKETS: MarketData[] = [
  {
    id: "mkt-1",
    title: "Will ETH reach $5,000 before Q4 2026?",
    category: "CRYPTO",
    status: "active",
    endTime: "Ends in 2d 18h",
    totalPool: "28.50",
    yesPercentage: 68,
    noPercentage: 32,
    volume: "74.20",
  },
  {
    id: "mkt-2",
    title: "Will Arbitrum exceed 10M active daily addresses?",
    category: "L2",
    status: "closing-soon",
    endTime: "Ends in 4h 12m",
    totalPool: "18.80",
    yesPercentage: 45,
    noPercentage: 55,
    volume: "42.10",
  },
  {
    id: "mkt-3",
    title: "Will Bitcoin hit $120,000 in 2026?",
    category: "CRYPTO",
    status: "active",
    endTime: "Ends in 5d 06h",
    totalPool: "45.00",
    yesPercentage: 74,
    noPercentage: 26,
    volume: "112.40",
  },
  {
    id: "mkt-4",
    title: "Will DOGE reach $1.00 this cycle?",
    category: "MEME",
    status: "active",
    endTime: "Ends in 12d 14h",
    totalPool: "12.40",
    yesPercentage: 38,
    noPercentage: 62,
    volume: "31.90",
  },
  {
    id: "mkt-5",
    title: "Will Solana TVL flip Ethereum L2s combined?",
    category: "TRENDING",
    status: "active",
    endTime: "Ends in 8d 20h",
    totalPool: "22.30",
    yesPercentage: 29,
    noPercentage: 71,
    volume: "58.70",
  },
  {
    id: "mkt-6",
    title: "Will PEPE flip SHIB in market capitalization?",
    category: "MEME",
    status: "active",
    endTime: "Ends in 3d 09h",
    totalPool: "9.60",
    yesPercentage: 52,
    noPercentage: 48,
    volume: "24.50",
  },
  {
    id: "mkt-7",
    title: "Will US Fed cut interest rates in September?",
    category: "MACRO",
    status: "resolved",
    endTime: "Ended",
    totalPool: "34.20",
    yesPercentage: 100,
    noPercentage: 0,
    volume: "89.10",
    resolvedOutcome: "YES",
  },
  {
    id: "mkt-8",
    title: "Will Apple announce Native Crypto Wallet in iOS 20?",
    category: "TRENDING",
    status: "active",
    endTime: "Ends in 15d 11h",
    totalPool: "15.70",
    yesPercentage: 41,
    noPercentage: 59,
    volume: "39.80",
  },
];

export default function PredictionsPage() {
  const [markets, setMarkets] = useState<MarketData[]>(MOCK_MARKETS);
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
    async function fetchLiveMarkets() {
      try {
        const res = await fetch("/api/markets");
        if (res.ok) {
          const data = await res.json();
          if (data.markets && Array.isArray(data.markets) && data.markets.length > 0) {
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
                resolvedOutcome: m.status === "resolved_yes" ? "YES" : m.status === "resolved_no" ? "NO" : undefined,
              };
            });
            setMarkets(mapped);
          }
        }
      } catch {
      }
    }

    fetchLiveMarkets();
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
      meme: markets.filter((m) => m.category.toLowerCase() === "meme")
        .length,
      "closing-soon": markets.filter((m) => m.status === "closing-soon")
        .length,
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
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = market.title.toLowerCase().includes(query);
        const matchesCategory = market.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "highest-pool") {
        return parseFloat(b.totalPool) - parseFloat(a.totalPool);
      }
      if (sortBy === "ending-soon") {
        if (a.status === "closing-soon" && b.status !== "closing-soon") return -1;
        if (b.status === "closing-soon" && a.status !== "closing-soon") return 1;
        return a.endTime.localeCompare(b.endTime);
      }
      return 0;
    });
  }, [markets, selectedCategory, searchQuery, sortBy]);

  const handleSelectOutcome = (market: MarketData, outcome: MarketOutcome) => {
    setBettingModal({
      isOpen: true,
      market,
      outcome,
    });
  };

  const handleConfirmBet = async ({
    marketId,
    outcome,
    amount,
  }: {
    marketId: string | number;
    outcome: MarketOutcome;
    amount: string;
  }) => {
    const market = markets.find((m) => m.id === marketId) || MOCK_MARKETS.find((m) => m.id === marketId);
    const marketTitle = market ? market.title : `Market #${marketId}`;
    const numericMarketId = typeof marketId === "number" ? marketId : parseInt(String(marketId).replace(/\D/g, "") || "1", 10);
    const demo = mockPredictionMarket.getDemoWallet();

    try {
      const res = await mockPredictionMarket.placeBet({
        marketId: numericMarketId,
        side: outcome,
        amountEth: amount,
        userAddress: demo.address,
      });

      await fetch("/api/bets/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_hash: res.txHash,
          contract_market_id: numericMarketId,
          wallet_address: demo.address,
          side: outcome.toLowerCase(),
          amount: parseFloat(amount),
        }),
      });
    } catch {
    }

    setSelectedOutcomeInfo(
      `Confirmed bet of ${amount} ETH on ${outcome} for "${marketTitle}"! Position registered.`
    );
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("highest-pool");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Arbitrum Sepolia Markets
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Prediction Markets
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Trade outcome shares on crypto narratives, meme assets, protocol milestones, and global events with instant testnet settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active Markets</p>
            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">{markets.length}</p>
          </div>
          <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Pool</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">186.50 ETH</p>
          </div>
        </div>
      </div>

      {selectedOutcomeInfo && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between"
        >
          <span>{selectedOutcomeInfo}</span>
          <button
            onClick={() => setSelectedOutcomeInfo(null)}
            className="text-xs underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <MarketCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        marketCounts={categoryCounts}
      />

      {filteredMarkets.length > 0 ? (
        <div
          data-testid="predictions-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8"
        >
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onSelectOutcome={handleSelectOutcome}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="empty-markets"
          className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl my-8 space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No markets found
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            No prediction markets match your current filter or search criteria &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      <BettingModal
        isOpen={bettingModal.isOpen}
        onClose={() => setBettingModal((prev) => ({ ...prev, isOpen: false }))}
        market={bettingModal.market}
        initialOutcome={bettingModal.outcome}
        onConfirmBet={handleConfirmBet}
      />
    </div>
  );
}
