"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export interface LeaderboardEntry {
  rank: number;
  address: string;
  ensName?: string;
  streakDays: number;
  totalPoints: number;
  multiplier?: string;
  winRate?: string;
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        <span className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-lg bg-amber-400/20 text-amber-500 font-mono font-black text-xs border border-amber-400/30">
          <span>🥇</span>
          <span>#1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-lg bg-slate-300/20 text-slate-400 font-mono font-black text-xs border border-slate-300/30">
          <span>🥈</span>
          <span>#2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-lg bg-amber-700/20 text-amber-600 font-mono font-black text-xs border border-amber-700/30">
          <span>🥉</span>
          <span>#3</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-text-muted dark:text-[#A9B3AD] font-mono font-bold text-xs border border-border-subtle dark:border-white/10">
        #{rank}
      </span>
    );
  };

  if (entries.length === 0) {
    return (
      <div
        role="region"
        aria-label="Points Leaderboard Table"
        className={`p-12 rounded-2xl border text-center ${
          isDark ? "bg-[#0A0F0C] border-white/10" : "bg-white border-border-subtle"
        } ${className}`}
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
      className={`rounded-2xl border overflow-hidden transition-all ${
        isDark
          ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)]"
      } ${className}`}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-mono font-bold uppercase tracking-wider ${
              isDark
                ? "bg-white/[0.02] border-white/10 text-[#A9B3AD]"
                : "bg-slate-50 border-border-subtle text-text-muted"
            }`}>
              <th className="py-3.5 px-4 sm:px-6 w-16">Rank</th>
              <th className="py-3.5 px-4 sm:px-6">Trader / Wallet</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Streak</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Multiplier</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Win Rate</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle dark:divide-white/5 text-xs sm:text-sm font-mono">
            {currentEntries.map((entry) => {
              const isCurrentUser =
                Boolean(currentUserAddress) &&
                entry.address.toLowerCase() === currentUserAddress.toLowerCase();

              return (
                <tr
                  key={entry.address}
                  className={`transition-colors ${
                    isCurrentUser
                      ? isDark
                        ? "bg-primary-blue/10 hover:bg-primary-blue/15"
                        : "bg-primary-blue-soft/50 hover:bg-primary-blue-soft/70"
                      : isDark
                        ? "hover:bg-white/[0.02]"
                        : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="py-3.5 px-4 sm:px-6 font-bold">
                    {renderRankBadge(entry.rank)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-accent-navy dark:text-white">
                        {entry.ensName || formatAddress(entry.address)}
                      </span>
                      {entry.ensName && (
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
                  <td className="py-3.5 px-4 sm:px-6 text-center text-warning-amber font-semibold">
                    {entry.streakDays}d
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-yes-green">
                    {entry.multiplier || "1.0x"}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center text-text-muted dark:text-[#A9B3AD]">
                    {entry.winRate || "60%"}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-black text-primary-blue">
                    +{entry.totalPoints.toLocaleString()} PTS
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-t text-xs font-mono ${
          isDark ? "border-white/10 text-[#A9B3AD]" : "border-border-subtle text-text-muted"
        }`}>
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
                  : isDark
                    ? "border-white/10 hover:bg-white/10 text-white"
                    : "border-border-subtle hover:bg-slate-100 text-accent-navy"
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
                  : isDark
                    ? "border-white/10 hover:bg-white/10 text-white"
                    : "border-border-subtle hover:bg-slate-100 text-accent-navy"
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
