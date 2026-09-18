"use client";

import React, { useState, useEffect } from "react";
import ActivityFeed, { ActivityItem, ActivityType } from "@/components/ActivityFeed";

export type ActivityFilterCategory = "all" | "stakes" | "confirmations" | "payouts";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<ActivityFilterCategory>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadActivities() {
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          const rawList = data.activities || data.data;
          if (isMounted && rawList && Array.isArray(rawList)) {
            const mapped: ActivityItem[] = rawList.map((a: any, idx: number) => ({
              id: a.id || `act-${idx + 1}`,
              type: (a.type as ActivityType) || "AGREE",
              actorAddress: a.actorAddress || a.user_address || "0x0000000000000000000000000000000000000000",
              actorName: a.actorName || a.username || undefined,
              marketId: a.marketId || a.market_id || "market-1",
              marketStatement: a.marketStatement || a.market_title || "Market Statement",
              amountEth: a.amountEth !== undefined ? Number(a.amountEth) : a.amount_eth !== undefined ? Number(a.amount_eth) : undefined,
              outcomeWon: a.outcomeWon || a.outcome || undefined,
              txHash: a.txHash || a.transaction_hash || "0x0000000000000000000000000000000000000000000000000000000000000000",
              chainId: a.chainId || a.chain_id || 11155111,
              timestamp: a.timestamp || a.created_at || new Date().toISOString(),
            }));
            setActivities(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredActivities = activities.filter((act) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "stakes") return act.type === "AGREE" || act.type === "DISAGREE";
    if (filterCategory === "confirmations") return act.type === "CONFIRM_EIP712";
    if (filterCategory === "payouts") return act.type === "CLAIM" || act.type === "RESOLVE";
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Live Stream • Auto-refreshing
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            On-Chain Activity Feed
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time verification of convictions, market stakes, creator signatures, and settlement payouts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 animate-slide-up stagger-1">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            filterCategory === "all"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          All Activity ({activities.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("stakes")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            filterCategory === "stakes"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Market Stakes
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("confirmations")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            filterCategory === "confirmations"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Confirmations
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory("payouts")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            filterCategory === "payouts"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Payouts & Settled
        </button>
      </div>

      <div className="animate-slide-up stagger-2">
        <ActivityFeed activities={filteredActivities} isLoading={isLoading} />
      </div>
    </div>
  );
}
