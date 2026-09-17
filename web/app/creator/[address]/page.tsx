"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CreatorProfileHeader from "@/components/CreatorProfileHeader";
import BeliefCard, { BeliefItem } from "@/components/BeliefCard";
import { CreatorProfile } from "@/components/CreatorCard";

export type ProfileTab = "active" | "resolved" | "all";

export interface CreatorPageProps {
  params: { address: string } | Promise<{ address: string }>;
}

const DEFAULT_CREATOR: CreatorProfile & { bio?: string; confirmationRate?: number } = {
  address: "0x1111111111111111111111111111111111111111",
  name: "Vitalik Buterin",
  handle: "@vitalik.eth",
  bio: "Ethereum researcher and decentralization advocate.",
  isVerified: true,
  accuracyRate: 88,
  confirmationRate: 95,
  totalBeliefs: 24,
  volumeGeneratedEth: 540.2,
  confirmedBeliefs: 22,
};

const DEFAULT_BELIEFS: BeliefItem[] = [
  {
    id: "belief-1",
    statement: "Will ETH trade above $5000 in Q4 2026?",
    author: "Vitalik Buterin",
    authorHandle: "@vitalik.eth",
    isConfirmed: true,
    status: "MARKET_OPEN",
    confidenceScore: 95,
    marketId: "market-101",
  },
  {
    id: "belief-2",
    statement: "Layer 2 transaction count will exceed 100M daily.",
    author: "Vitalik Buterin",
    authorHandle: "@vitalik.eth",
    isConfirmed: true,
    status: "RESOLVED",
    confidenceScore: 92,
    marketId: "market-102",
  },
];

export default function CreatorProfilePage({ params }: CreatorPageProps) {
  const [targetAddress, setTargetAddress] = useState<string>("0x1111111111111111111111111111111111111111");
  const [creator, setCreator] = useState(DEFAULT_CREATOR);
  const [beliefs, setBeliefs] = useState<BeliefItem[]>(DEFAULT_BELIEFS);
  const [activeTab, setActiveTab] = useState<ProfileTab>("active");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function resolveParamsAndLoad() {
      try {
        const resolved = await Promise.resolve(params);
        if (!isMounted) return;
        const addr = resolved?.address || "0x1111111111111111111111111111111111111111";
        setTargetAddress(addr);

        setIsLoading(true);
        const res = await fetch(`/api/creators/${addr}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.creator) {
              setCreator({
                ...data.creator,
                address: addr,
                name: data.creator.name || data.creator.display_name || "Creator",
                handle: data.creator.handle || data.creator.username,
                accuracyRate: Number(data.creator.accuracyRate ?? data.creator.accuracy_rate ?? 85),
                confirmationRate: Number(data.creator.confirmationRate ?? data.creator.confirmation_rate ?? 90),
                totalBeliefs: Number(data.creator.totalBeliefs ?? data.creator.total_beliefs ?? 10),
                confirmedBeliefs: Number(data.creator.confirmedBeliefs ?? data.creator.confirmed_beliefs ?? 8),
                volumeGeneratedEth: Number(data.creator.volumeGeneratedEth ?? data.creator.volume_eth ?? 100),
                isVerified: Boolean(data.creator.isVerified ?? data.creator.is_verified ?? true),
              });
            }
            if (data.beliefs && Array.isArray(data.beliefs)) {
              const mapped: BeliefItem[] = data.beliefs.map((b: any, idx: number) => ({
                id: b.id || `belief-${idx + 1}`,
                statement: b.statement || b.title || "Belief Statement",
                author: b.author || data.creator?.name || "Creator",
                authorHandle: b.authorHandle || data.creator?.handle,
                isConfirmed: Boolean(b.isConfirmed ?? b.is_confirmed ?? true),
                status: (b.status as any) || "MARKET_OPEN",
                confidenceScore: b.confidenceScore ?? b.confidence_score ?? 90,
                marketId: b.marketId || b.market_id,
                sourceUrl: b.sourceUrl || b.source_url,
              }));
              setBeliefs(mapped);
            }
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    resolveParamsAndLoad();
    return () => {
      isMounted = false;
    };
  }, [params]);

  const filteredBeliefs = beliefs.filter((b) => {
    if (activeTab === "active") return b.status === "MARKET_OPEN" || b.status === "CONFIRMED";
    if (activeTab === "resolved") return b.status === "RESOLVED";
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 animate-slide-right">
        <Link
          href="/creators"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Creators Directory</span>
        </Link>
      </div>

      <CreatorProfileHeader creator={{ ...creator, address: targetAddress }} />

      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto animate-fade-in">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            activeTab === "active"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Active Beliefs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resolved")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            activeTab === "resolved"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Resolved Beliefs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all ${
            activeTab === "all"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          All Origins ({beliefs.length})
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="h-48 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        </div>
      ) : filteredBeliefs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 animate-scale-in">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            No beliefs found in this tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up stagger-1">
          {filteredBeliefs.map((belief) => (
            <BeliefCard key={belief.id} belief={belief} />
          ))}
        </div>
      )}
    </div>
  );
}
