"use client";

import React, { useState, useEffect } from "react";
import CreatorCard, { CreatorProfile } from "@/components/CreatorCard";

export type CreatorSortOption = "accuracy" | "confirmed" | "volume" | "beliefs";

const INITIAL_CREATORS: CreatorProfile[] = [
  {
    address: "0x1111111111111111111111111111111111111111",
    name: "Vitalik Buterin",
    handle: "@vitalik.eth",
    accuracyRate: 92,
    confirmedBeliefs: 18,
    totalBeliefs: 20,
    volumeGeneratedEth: 450.5,
    earnedFeesEth: 6.75,
    isVerified: true,
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    name: "Satoshi Disciple",
    handle: "@satoshidisciple",
    accuracyRate: 75,
    confirmedBeliefs: 30,
    totalBeliefs: 35,
    volumeGeneratedEth: 120.0,
    earnedFeesEth: 1.8,
    isVerified: true,
  },
];

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [sortBy, setSortBy] = useState<CreatorSortOption>("accuracy");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCreators() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/creators");
        if (res.ok) {
          const data = await res.json();
          const creatorList = data.data || data.creators || (Array.isArray(data) ? data : []);
          if (isMounted && Array.isArray(creatorList)) {
            const mapped: CreatorProfile[] = creatorList.map((c: any, idx: number) => ({
              address: c.address || c.wallet_address || `0x${(idx + 1).toString().padStart(40, "0")}`,
              name: c.name || c.display_name || c.handle?.replace("@", "") || "Creator",
              handle: c.handle || c.username || undefined,
              avatarUrl: c.avatarUrl || c.avatar_url || undefined,
              accuracyRate: Number(c.accuracyRate ?? c.accuracy_rate ?? c.accuracy_percentage ?? c.win_rate ?? 85),
              confirmedBeliefs: Number(c.confirmedBeliefs ?? c.confirmed_count ?? c.confirmed_beliefs_count ?? 0),
              totalBeliefs: Number(c.totalBeliefs ?? c.total_count ?? c.total_beliefs_count ?? 1),
              volumeGeneratedEth: Number(c.volumeGeneratedEth ?? c.volume_eth ?? c.total_volume ?? 0),
              earnedFeesEth: Number(c.earnedFeesEth ?? c.fees_eth ?? 0),
              isVerified: Boolean(c.isVerified ?? c.is_verified ?? (c.confirmed_beliefs_count > 0)),
            }));
            setCreators(mapped);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCreators();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAndSortedCreators = creators
    .filter((c) => {
      if (searchQuery.trim() === "") return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.handle && c.handle.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "accuracy") return b.accuracyRate - a.accuracyRate;
      if (sortBy === "confirmed") return b.confirmedBeliefs - a.confirmedBeliefs;
      if (sortBy === "volume") return b.volumeGeneratedEth - a.volumeGeneratedEth;
      if (sortBy === "beliefs") return b.totalBeliefs - a.totalBeliefs;
      return 0;
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              EIP-712 Verified Thinkers
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Creators Directory
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Discover top social opinion creators, verify on-chain conviction records, and track prediction accuracy.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 animate-slide-up stagger-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSortBy("accuracy")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              sortBy === "accuracy"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Highest Accuracy
          </button>
          <button
            type="button"
            onClick={() => setSortBy("confirmed")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              sortBy === "confirmed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Most Confirmed
          </button>
          <button
            type="button"
            onClick={() => setSortBy("volume")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              sortBy === "volume"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Most Volume
          </button>
          <button
            type="button"
            onClick={() => setSortBy("beliefs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
              sortBy === "beliefs"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Most Beliefs
          </button>
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators by name, handle, or address..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            aria-label="Search creators by name, handle, or address..."
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
      ) : filteredAndSortedCreators.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            No creators matched your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up stagger-2">
          {filteredAndSortedCreators.map((creator, idx) => (
            <CreatorCard key={creator.address} creator={creator} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
