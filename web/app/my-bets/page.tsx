"use client";

import React, { useState, useMemo } from "react";
import { UserBetsTable, UserBet, BetStatus } from "@/components/UserBetsTable";

export const INITIAL_USER_BETS: UserBet[] = [
  {
    id: "bet-1",
    marketId: "mkt-1",
    marketTitle: "Will ETH reach $5,000 before Q4 2026?",
    category: "CRYPTO",
    side: "YES",
    amount: "0.50",
    payout: "0.74",
    roiPercent: 48,
    status: "active",
    createdAt: "Sep 15, 2026",
  },
  {
    id: "bet-2",
    marketId: "mkt-2",
    marketTitle: "Will Arbitrum exceed 10M active daily addresses?",
    category: "L2",
    side: "NO",
    amount: "0.20",
    payout: "0.36",
    roiPercent: 80,
    status: "won",
    isClaimed: false,
    createdAt: "Sep 14, 2026",
  },
  {
    id: "bet-3",
    marketId: "mkt-3",
    marketTitle: "Will DOGE reach $1.00 this cycle?",
    category: "MEME",
    side: "YES",
    amount: "0.10",
    payout: "0.26",
    roiPercent: 160,
    status: "lost",
    createdAt: "Sep 13, 2026",
  },
  {
    id: "bet-4",
    marketId: "mkt-4",
    marketTitle: "Will US Fed cut interest rates in September?",
    category: "MACRO",
    side: "YES",
    amount: "0.40",
    payout: "0.80",
    roiPercent: 100,
    status: "won",
    isClaimed: true,
    createdAt: "Sep 10, 2026",
  },
];

export const FILTER_TABS: { id: "all" | BetStatus; label: string }[] = [
  { id: "all", label: "All Positions" },
  { id: "active", label: "Active" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export default function MyBetsPage() {
  const [bets, setBets] = useState<UserBet[]>(INITIAL_USER_BETS);
  const [activeTab, setActiveTab] = useState<"all" | BetStatus>("all");
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

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

  const filteredBets = useMemo(() => {
    if (activeTab === "all") return bets;
    return bets.filter((b) => b.status === activeTab);
  }, [bets, activeTab]);

  const handleClaimPayout = (targetBet: UserBet) => {
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
            +104% Net Return
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
            Based on settled positions
          </p>
        </div>
      </div>

      {claimNotification && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200"
        >
          <span>{claimNotification}</span>
          <button
            type="button"
            onClick={() => setClaimNotification(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                aria-pressed={isActive}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950 font-bold"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <UserBetsTable bets={filteredBets} onClaimPayout={handleClaimPayout} />
      </div>
    </div>
  );
}
