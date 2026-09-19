"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BeliefCard from "@/components/BeliefCard";
import type { BeliefRecord, BeliefsApiResponse, BeliefItem, BeliefCardStatus, BeliefFilterStatus } from "@/types";

export type { BeliefFilterStatus };

export default function BeliefsPage() {
  const [beliefs, setBeliefs] = useState<BeliefItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<BeliefFilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBeliefs() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/beliefs");
        if (res.ok) {
          const data: BeliefsApiResponse = await res.json();
          if (isMounted && Array.isArray(data.beliefs)) {
            const mapped: BeliefItem[] = data.beliefs
              .filter((b): b is BeliefRecord & { statement: string } => Boolean(b.statement))
              .map((b) => {
                const firstMarket = Array.isArray(b.markets) ? b.markets[0] : b.markets;
                return {
                  id: b.id,
                  statement: b.statement,
                  author: b.author ?? "Unknown",
                  authorHandle: b.source_platform ? `@${b.source_platform}` : undefined,
                  isConfirmed: b.status === "CONFIRMED" || b.status === "MARKET_OPEN",
                  status: (b.status as BeliefCardStatus) || "DETECTED",
                  confidenceScore: b.ai_confidence !== null ? Number(b.ai_confidence) : undefined,
                  sourceUrl: b.source_url ?? undefined,
                  marketId: firstMarket?.id ?? undefined,
                };
              });
            setBeliefs(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBeliefs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBeliefs = beliefs.filter((item) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "detected" && (!item.isConfirmed || item.status === "DETECTED")) ||
      (filterStatus === "confirmed" && item.isConfirmed) ||
      (filterStatus === "market_live" && Boolean(item.marketId));

    const matchesSearch =
      searchQuery.trim() === "" ||
      item.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.authorHandle && item.authorHandle.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              AI & Social Signal Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Social Beliefs Directory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse, filter, and discover opinions indexed by AI from Twitter, Warpcast, and community thinkers.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all hover-lift shadow-sm active:scale-98"
          aria-label="Submit New Belief"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Submit New Belief</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 animate-slide-up stagger-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              filterStatus === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            All ({beliefs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("detected")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              filterStatus === "detected"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            AI Detected
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("confirmed")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              filterStatus === "confirmed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Confirmed
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("market_live")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              filterStatus === "market_live"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Market Live
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beliefs or authors..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            aria-label="Search beliefs or authors..."
          />
          <svg
            className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        </div>
      ) : filteredBeliefs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            No beliefs matched your current filter or query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up stagger-2">
          {filteredBeliefs.map((belief) => (
            <BeliefCard key={belief.id} belief={belief} />
          ))}
        </div>
      )}
    </div>
  );
}
