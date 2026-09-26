"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CreatorProfileHeader from "@/components/CreatorProfileHeader";
import BeliefCard from "@/components/BeliefCard";
import type { CreatorProfile, BeliefItem, ProfileTab, CreatorPageProps } from "@/types";

export type { ProfileTab, CreatorPageProps };

export default function CreatorProfilePage({ params }: CreatorPageProps) {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [creator, setCreator] = useState<(CreatorProfile & { bio?: string; confirmationRate?: number }) | null>(null);
  const [beliefs, setBeliefs] = useState<BeliefItem[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("active");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    let isMounted = true;
    async function resolveParamsAndLoad() {
      try {
        const resolved = await Promise.resolve(params);
        if (!isMounted) return;
        const addr = resolved?.address;
        if (!addr) {
          setIsLoading(false);
          return;
        }
        setTargetAddress(addr);

        setIsLoading(true);
        const res = await fetch(`/api/creators/${addr}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const creatorObj = data.creator || data.data;
            if (creatorObj) {
              setCreator({
                ...creatorObj,
                address: addr,
                name: creatorObj.name || creatorObj.display_name || creatorObj.handle?.replace("@", "") || "Creator",
                handle: creatorObj.handle || creatorObj.username,
                avatarUrl: creatorObj.avatarUrl || creatorObj.avatar_url || undefined,
                bio: creatorObj.bio || "Social Belief Creator on Omen Protocol",
                accuracyRate: Number(creatorObj.accuracyRate ?? creatorObj.accuracy_rate ?? creatorObj.accuracy_percentage ?? 0),
                confirmationRate: Number(creatorObj.confirmationRate ?? creatorObj.confirmation_rate ?? 0),
                totalBeliefs: Number(creatorObj.totalBeliefs ?? creatorObj.total_beliefs ?? creatorObj.total_beliefs_count ?? (Array.isArray(data.beliefs) ? data.beliefs.length : 0)),
                confirmedBeliefs: Number(creatorObj.confirmedBeliefs ?? creatorObj.confirmed_beliefs ?? creatorObj.confirmed_beliefs_count ?? 0),
                volumeGeneratedEth: Number(creatorObj.volumeGeneratedEth ?? creatorObj.volume_eth ?? 0),
                isVerified: Boolean(creatorObj.isVerified ?? creatorObj.is_verified ?? Number(creatorObj.confirmed_beliefs_count ?? 0) > 0),
              });
            }

            const beliefList = data.beliefs || creatorObj?.beliefs || [];
            if (Array.isArray(beliefList)) {
              const mapped: BeliefItem[] = beliefList.map((b: any, idx: number) => ({
                id: b.id || `belief-${idx + 1}`,
                statement: b.statement || b.title || "Belief Statement",
                author: b.author || creatorObj?.name || "Creator",
                authorHandle: b.authorHandle || creatorObj?.handle,
                isConfirmed: Boolean(b.isConfirmed ?? b.is_confirmed ?? b.status === "CONFIRMED"),
                status: (b.status as any) || "MARKET_OPEN",
                confidenceScore: b.confidenceScore ?? b.confidence_score ?? b.ai_confidence ?? 0,
                marketId: b.marketId || b.market_id,
                sourceUrl: b.sourceUrl || b.source_url,
              }));
              setBeliefs(mapped);
            }
          }
        } else if (isMounted) {
          const decodedAddr = decodeURIComponent(addr).trim();
          const cleanName = decodedAddr.replace(/^@/, "");
          const isEthAddress = cleanName.startsWith("0x") && cleanName.length === 42;
          const displayName = isEthAddress ? `${cleanName.slice(0, 6)}...${cleanName.slice(-4)}` : cleanName;
          const handle = isEthAddress ? undefined : `@${cleanName}`;

          setCreator({
            address: cleanName,
            name: displayName,
            handle: handle,
            bio: "Social Belief Creator on Omen Protocol",
            accuracyRate: 100,
            confirmationRate: 100,
            totalBeliefs: 0,
            confirmedBeliefs: 0,
            volumeGeneratedEth: 0,
            isVerified: false,
          });
          setBeliefs([]);
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

      {creator ? (
        <CreatorProfileHeader creator={{ ...creator, address: targetAddress }} />
      ) : isLoading ? (
        <div className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse mb-8" />
      ) : null}

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
