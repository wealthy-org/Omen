"use client";

import React, { useState, useMemo, useEffect } from "react";
import { UserBetsTable, UserBet, BetStatus } from "@/components/UserBetsTable";
import { mockPredictionMarket } from "@/lib/mockPredictionMarket";

export const FILTER_TABS: { id: "all" | BetStatus; label: string }[] = [
  { id: "all", label: "All Positions" },
  { id: "active", label: "Active" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export default function MyBetsPage() {
  const [bets, setBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | BetStatus>("all");
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

  const demo = mockPredictionMarket.getDemoWallet();

  useEffect(() => {
    let isMounted = true;
    async function fetchUserBets() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/bets?wallet_address=${demo.address}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.bets && Array.isArray(data.bets)) {
            const mapped: UserBet[] = data.bets.map((b: any) => {
              const amountNum = Number(b.amount || 0);
              const payoutNum = Number(b.payout !== undefined ? b.payout : amountNum * 1.5);
              const roi = amountNum > 0 ? Math.round(((payoutNum - amountNum) / amountNum) * 100) : 0;
              return {
                id: b.id,
                marketId: b.market_id || b.markets?.contract_market_id || "1",
                marketTitle: b.markets?.title || `Market #${b.market_id}`,
                category: (b.markets?.category || "CRYPTO").toUpperCase(),
                side: (b.side || "YES").toUpperCase() as "YES" | "NO",
                amount: amountNum.toFixed(2),
                payout: payoutNum.toFixed(2),
                roiPercent: roi,
                status: (b.status || "active") as BetStatus,
                isClaimed: Boolean(b.claimed),
                createdAt: b.created_at
                  ? new Date(b.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Today",
              };
            });
            setBets(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUserBets();
    return () => {
      isMounted = false;
    };
  }, [demo.address]);

  const totalStaked = useMemo(() => {
    return bets.reduce((sum, b) => sum + parseFloat(b.amount || "0"), 0).toFixed(2);
  }, [bets]);

  const totalWon = useMemo(() => {
    return bets
      .filter((b) => b.status === "won")
      .reduce((sum, b) => sum + parseFloat(b.payout || "0"), 0)
      .toFixed(2);
  }, [bets]);

  const winRate = useMemo(() => {
    const resolvedBets = bets.filter((b) => b.status === "won" || b.status === "lost");
    if (resolvedBets.length === 0) return "0.0";
    const wonCount = resolvedBets.filter((b) => b.status === "won").length;
    return ((wonCount / resolvedBets.length) * 100).toFixed(1);
  }, [bets]);

  const netReturnPercent = useMemo(() => {
    const stakedNum = parseFloat(totalStaked) || 0;
    const wonNum = parseFloat(totalWon) || 0;
    if (stakedNum === 0) return "0.0%";
    const netReturn = ((wonNum - stakedNum) / stakedNum) * 100;
    const sign = netReturn >= 0 ? "+" : "";
    return `${sign}${netReturn.toFixed(1)}% Net Return`;
  }, [totalStaked, totalWon]);

  const filteredBets = useMemo(() => {
    if (activeTab === "all") return bets;
    return bets.filter((b) => b.status === activeTab);
  }, [bets, activeTab]);

  const handleClaimPayout = (targetBet: UserBet) => {
    const numericMarketId =
      typeof targetBet.marketId === "number"
        ? targetBet.marketId
        : parseInt(String(targetBet.marketId).replace(/\D/g, "") || "1", 10);
    mockPredictionMarket.claimPayout({ marketId: numericMarketId }).catch(() => {});

    setBets((prev) =>
      prev.map((b) => (b.id === targetBet.id ? { ...b, isClaimed: true } : b))
    );
    setClaimNotification(
      `Successfully claimed ${targetBet.payout} ETH for "${targetBet.marketTitle}"!`
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Personal Betting Portfolio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            My Predictions & Bets
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Track your open market positions, review settled outcomes, and claim your winnings directly to your connected Web3 wallet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <p className="text-xs font-mono font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Total ETH Staked
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
            {totalStaked} ETH
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Across {bets.length} total positions
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <p className="text-xs font-mono font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Total Payouts Won
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {totalWon} ETH
          </p>
          <p className="text-xs text-emerald-500 mt-1 font-medium font-mono">
            {netReturnPercent}
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <p className="text-xs font-mono font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Prediction Win Rate
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
            {winRate}%
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Based on settled markets
          </p>
        </div>
      </div>

      {claimNotification && (
        <div
          role="status"
          className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-200"
        >
          <span>{claimNotification}</span>
          <button
            type="button"
            onClick={() => setClaimNotification(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 text-xs font-bold font-mono"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "all"
                ? bets.length
                : bets.filter((b) => b.status === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <UserBetsTable
          bets={filteredBets}
          isLoading={isLoading}
          onClaimPayout={handleClaimPayout}
        />
      </div>
    </div>
  );
}
