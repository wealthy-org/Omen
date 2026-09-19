"use client";

import { useState, useEffect } from "react";
import LeaderboardTable, { LeaderboardEntry } from "@/components/LeaderboardTable";
import { mockPredictionMarket } from "@/lib/mockPredictionMarket";

export interface CurrentUserProfile {
  rank: number;
  totalPoints: number;
  streakDays?: number;
  ensName?: string;
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<CurrentUserProfile | null>(null);

  const demo = mockPredictionMarket.getDemoWallet();

  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/leaderboard/points?wallet_address=${demo.address}&limit=50&offset=0`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.leaderboard && Array.isArray(data.leaderboard)) {
              const mapped: LeaderboardEntry[] = data.leaderboard.map((item: any) => ({
                rank: item.rank,
                address: item.wallet_address,
                ensName: item.ens_name,
                streakDays: item.streak_days || 1,
                totalPoints: Number(item.total_points || 0),
                multiplier: `${(1 + Math.min(Number(item.streak_days || 1) * 0.1, 2.0)).toFixed(1)}x`,
                winRate: item.win_rate ? `${item.win_rate}%` : "65%",
              }));
              setEntries(mapped);
            }
            if (data.currentUserRank) {
              setUserProfile({
                rank: data.currentUserRank.rank,
                totalPoints: data.currentUserRank.totalPoints,
                streakDays: data.currentUserRank.streakDays,
                ensName: data.currentUserRank.ensName,
              });
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

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [demo.address]);

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      entry.address.toLowerCase().includes(query) ||
      Boolean(entry.ensName && entry.ensName.toLowerCase().includes(query))
    );
  });

  const userRank = userProfile?.rank ?? (entries.findIndex((e) => e.address.toLowerCase() === demo.address.toLowerCase()) + 1 || 1);
  const userPoints = userProfile?.totalPoints ?? 0;
  const userStreak = userProfile?.streakDays ?? 1;
  const userMultiplier = `${(1 + Math.min(userStreak * 0.1, 2.0)).toFixed(1)}x`;

  const topThreeTarget = entries.find((e) => e.rank === 3);
  const nextTarget = entries.find((e) => e.rank === userRank - 1);
  const gapTarget = nextTarget || topThreeTarget;
  const targetPoints = gapTarget?.totalPoints ?? 0;
  const pointsGap = gapTarget ? Math.max(0, targetPoints - userPoints) : 0;

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-fade-in">
      <div className="flex flex-col gap-2 animate-slide-down">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border-primary-blue/20">
            Leaderboard • Global Season 1
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-accent-navy dark:text-white">
          Points Leaderboard
        </h1>
        <p className="text-sm sm:text-base text-text-muted dark:text-[#A9B3AD] max-w-2xl">
          Global rankings of all active participants based on points earned from check-ins and prediction markets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border transition-all hover-lift animate-slide-up stagger-1 bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Your Current Rank
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border border-primary-blue/20">
              {userRank <= 3 ? "Top 1%" : userRank <= 10 ? "Top 5%" : "Active Trader"}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-accent-navy dark:text-white flex items-center gap-2">
            <span>#{userRank}</span>
            {userProfile?.ensName && (
              <span className="text-sm font-semibold text-text-muted dark:text-[#A9B3AD] font-sans">
                ({userProfile.ensName})
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            Higher rank grants larger share in Season 1 token airdrop.
          </p>
        </div>

        <div className="p-6 rounded-2xl border transition-all hover-lift animate-slide-up stagger-2 bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Your Total Points
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-yes-green-soft text-yes-green dark:bg-yes-green/10 border border-yes-green/20">
              {userMultiplier} Multiplier
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-primary-blue">
            {userPoints.toLocaleString()} <span className="text-lg font-bold">PTS</span>
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            {userStreak} consecutive streak days maintaining boost.
          </p>
        </div>

        <div className="p-6 rounded-2xl border transition-all hover-lift animate-slide-up stagger-3 bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Gap to Next Tier
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warning-soft text-warning-amber dark:bg-amber-500/15 border border-amber-500/20">
              {gapTarget ? `#${gapTarget.rank} Target` : "Top Leader"}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-warning-amber">
            +{pointsGap.toLocaleString()} <span className="text-lg font-bold">PTS</span>
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            {gapTarget
              ? `Needed to overtake #${gapTarget.rank} ${gapTarget.ensName || gapTarget.address.slice(0, 6)} (${targetPoints.toLocaleString()} PTS).`
              : "You are currently leading the global leaderboard!"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-text-muted dark:text-[#A9B3AD] absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ENS name or 0x... address"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition-all outline-none bg-white dark:bg-[#0A0F0C] border-border-subtle dark:border-white/10 text-accent-navy dark:text-white placeholder:text-text-muted/60 focus:border-primary-blue/50"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear Search"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted hover:text-accent-navy dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs font-mono text-text-muted dark:text-[#A9B3AD]">
            Showing {filteredEntries.length} of {entries.length} participants
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 rounded-2xl border bg-white/5 border-white/10 animate-pulse space-y-4">
            <div className="h-6 w-1/4 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/5 rounded" />
            <div className="h-10 w-full bg-white/5 rounded" />
            <div className="h-10 w-full bg-white/5 rounded" />
          </div>
        ) : (
          <LeaderboardTable
            entries={filteredEntries}
            currentUserAddress={demo.address}
            pageSize={10}
          />
        )}
      </div>
    </div>
  );
}
