"use client";

import { useState } from "react";

export interface LeaderboardEntry {
  rank: number;
  address: string;
  handle?: string;
  ensName?: string;
  streakDays?: number;
  totalPoints?: number;
  multiplier?: string;
  winRate?: string;
  accuracyPercentage?: number;
  correctPredictions?: number;
  resolvedPredictions?: number;
  totalVolume?: string;
  tier?: string;
}

export interface LeaderboardTableProps {
  entries?: LeaderboardEntry[];
  currentUserAddress?: string;
  pageSize?: number;
  className?: string;
}

export default function LeaderboardTable({
  entries = [],
  currentUserAddress = "",
  pageSize = 10,
  className = "",
}: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(entries.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentEntries = entries.slice(startIndex, startIndex + pageSize);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 h-7 rounded-lg bg-amber-400/15 text-amber-500 dark:text-amber-400 font-mono font-black text-xs border border-amber-400/40 shadow-xs">
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 h-7 rounded-lg bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 font-mono font-black text-xs border border-slate-300 dark:border-slate-600 shadow-xs">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 h-7 rounded-lg bg-amber-700/15 text-amber-700 dark:text-amber-500 font-mono font-black text-xs border border-amber-700/40 shadow-xs">
          #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-text-muted dark:text-[#A9B3AD] font-mono font-bold text-xs border border-border-subtle dark:border-white/10">
        #{rank}
      </span>
    );
  };

  const renderTierBadge = (tier?: string, winRateStr?: string) => {
    const rawRate = parseFloat(winRateStr || "70");
    const label = tier || (rawRate >= 80 ? "Diamond Oracle" : rawRate >= 70 ? "Platinum Analyst" : "Gold Forecaster");
    const colorClass =
      label.includes("Diamond")
        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        : label.includes("Platinum")
        ? "bg-slate-300/15 text-slate-300 border-slate-300/25"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20";

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${colorClass}`}>
        {label}
      </span>
    );
  };

  if (entries.length === 0) {
    return (
      <div
        role="region"
        aria-label="Points Leaderboard Table"
        className={`p-12 rounded-2xl border text-center bg-white dark:bg-[#0A0F0C] border-border-subtle dark:border-white/10 ${className}`}
      >
        <p className="text-sm text-text-muted dark:text-[#A9B3AD]">
          No ranked traders found.
        </p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Points Leaderboard Table"
      className={`rounded-2xl border overflow-hidden transition-all bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02] border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD]">
              <th scope="col" className="py-3.5 px-4 sm:px-6 w-16">Rank</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6">Trader / Wallet</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">Accuracy / Win Rate</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">Record</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">Tier</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle dark:divide-white/5 text-xs sm:text-sm font-mono">
            {currentEntries.map((entry) => {
              const isCurrentUser =
                Boolean(currentUserAddress) &&
                entry.address.toLowerCase() === currentUserAddress.toLowerCase();

              const displayName = entry.handle || entry.ensName || formatAddress(entry.address);
              const winRateDisplay = entry.winRate || (entry.accuracyPercentage ? `${entry.accuracyPercentage}%` : "75%");
              const correctCount = entry.correctPredictions ?? (entry.streakDays ? entry.streakDays : 12);
              const resolvedCount = entry.resolvedPredictions ?? (correctCount + 3);

              return (
                <tr
                  key={entry.address}
                  className={`transition-colors ${
                    isCurrentUser
                      ? "bg-primary-blue-soft/50 hover:bg-primary-blue-soft/70 dark:bg-primary-blue/10 dark:hover:bg-primary-blue/15"
                      : "hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="py-3.5 px-4 sm:px-6 font-bold">
                    {renderRankBadge(entry.rank)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-accent-navy dark:text-white">
                        {displayName}
                      </span>
                      {entry.ensName && entry.ensName !== displayName && (
                        <span className="text-[11px] text-text-muted dark:text-[#A9B3AD] hidden sm:inline">
                          ({formatAddress(entry.address)})
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-blue text-white ml-1">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-yes-green">
                    {winRateDisplay}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center text-text-muted dark:text-[#A9B3AD]">
                    <span className="text-zinc-900 dark:text-white font-semibold">{correctCount}</span> / <span>{resolvedCount}</span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    {renderTierBadge(entry.tier, winRateDisplay)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-black text-primary-blue">
                    {entry.totalPoints !== undefined ? `+${entry.totalPoints.toLocaleString()} PTS` : `${entry.totalVolume || "25.00"} ETH`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t text-xs font-mono border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded-lg border font-semibold transition-all ${
                currentPage <= 1
                  ? "opacity-40 cursor-not-allowed border-transparent"
                  : "border-border-subtle hover:bg-slate-100 text-accent-navy dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded-lg border font-semibold transition-all ${
                currentPage >= totalPages
                  ? "opacity-40 cursor-not-allowed border-transparent"
                  : "border-border-subtle hover:bg-slate-100 text-accent-navy dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
