"use client";

import React, { useState, useEffect } from "react";
import ActivityFeed, { ActivityItem, ActivityType } from "@/components/ActivityFeed";
import { ApiActivityEvent, ActivityApiResponse } from "@/types/api";

export type ActivityFilterCategory = "all" | "stakes" | "confirmations" | "payouts";

function parseActivityType(eventType: string): ActivityType {
  const norm = (eventType || "").toUpperCase();
  if (norm === "MARKETCREATED" || norm === "MARKET_CREATED") return "MARKET_CREATED";
  if (norm === "CREATORCONFIRMED" || norm === "CONFIRM_EIP712" || norm === "CONFIRMED") return "CONFIRM_EIP712";
  if (norm === "PAYOUTCLAIMED" || norm === "CLAIM") return "CLAIM";
  if (norm === "MARKETRESOLVED" || norm === "RESOLVE") return "RESOLVE";
  if (norm === "DISAGREE" || norm === "POSITION_DISAGREE") return "DISAGREE";
  return "AGREE";
}

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
          const data: ActivityApiResponse = await res.json();
          if (isMounted && Array.isArray(data.activities)) {
            const mapped: ActivityItem[] = data.activities
              .filter((a): a is ApiActivityEvent & { statement: string } => Boolean(a.statement))
              .map((a) => ({
                id: a.id,
                type: parseActivityType(a.event_type),
                actorAddress: a.wallet_address,
                actorName: a.belief_author ?? undefined,
                marketId: a.market_id,
                marketStatement: a.statement,
                amountEth: a.amount !== null && a.amount !== undefined ? Number(a.amount) : undefined,
                txHash: a.tx_hash,
                chainId: a.market_chain_id ?? undefined,
                timestamp: a.created_at,
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
    if (filterCategory === "stakes") return act.type === "AGREE" || act.type === "DISAGREE" || act.type === "MARKET_CREATED";
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
