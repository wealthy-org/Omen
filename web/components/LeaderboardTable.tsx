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

const DEFAULT_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, address: "0x71C8364f3B3979B6396c5678440A4418652D875F", ensName: "oracle-king.eth", streakDays: 24, totalPoints: 128500, multiplier: "3.0x", winRate: "82%" },
  { rank: 2, address: "0x3A945b630B72d8e6E1fE46a297E59b20757Ebb30", ensName: "arbitrum-whale.eth", streakDays: 21, totalPoints: 94200, multiplier: "3.0x", winRate: "78%" },
  { rank: 3, address: "0x98Fc4E2551e737B244243684B98818c3B1280B3A", ensName: "satoshi-prophet.eth", streakDays: 19, totalPoints: 81400, multiplier: "2.5x", winRate: "75%" },
  { rank: 4, address: "0x1234567890abcdef1234567890abcdef12345678", ensName: "omen-hunter.eth", streakDays: 14, totalPoints: 52300, multiplier: "2.0x", winRate: "71%" },
  { rank: 5, address: "0x55B3901a7D2364c6792E5B50A11F68eF62810931", streakDays: 12, totalPoints: 44100, multiplier: "2.0x", winRate: "69%" },
  { rank: 6, address: "0x89D24C15a20120F638706341f23E451965A20B78", streakDays: 11, totalPoints: 39800, multiplier: "1.8x", winRate: "67%" },
  { rank: 7, address: "0x23E481029F741938562B286E451296B07412A359", streakDays: 9, totalPoints: 34200, multiplier: "1.5x", winRate: "65%" },
  { rank: 8, address: "0x67A9128364109384512B74239856129486A20B53", streakDays: 8, totalPoints: 29500, multiplier: "1.5x", winRate: "64%" },
  { rank: 9, address: "0x44C19283561029384512B74239856129486A20F1", streakDays: 7, totalPoints: 26100, multiplier: "1.5x", winRate: "62%" },
  { rank: 10, address: "0x90B38192641029384512B74239856129486A20E2", streakDays: 6, totalPoints: 22400, multiplier: "1.2x", winRate: "60%" },
  { rank: 11, address: "0x11A38192641029384512B74239856129486A2011", streakDays: 5, totalPoints: 19800, multiplier: "1.2x", winRate: "59%" },
  { rank: 12, address: "0x22B38192641029384512B74239856129486A2022", streakDays: 4, totalPoints: 17300, multiplier: "1.0x", winRate: "58%" },
];

export interface LeaderboardTableProps {
  entries?: LeaderboardEntry[];
  currentUserAddress?: string;
  pageSize?: number;
  className?: string;
}

export default function LeaderboardTable({
  entries = DEFAULT_LEADERBOARD_ENTRIES,
  currentUserAddress = "0x1234567890abcdef1234567890abcdef12345678",
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs">
          <span>🥇</span>
          <span>#1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-300/20 text-slate-300 dark:text-slate-200 border border-slate-300/30 shadow-xs">
          <span>🥈</span>
          <span>#2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-700/15 text-amber-600 dark:text-amber-500 border border-amber-700/30 shadow-xs">
          <span>🥉</span>
          <span>#3</span>
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-xs px-2 py-0.5 text-text-muted dark:text-[#A9B3AD]">
        #{rank}
      </span>
    );
  };

  return (
    <div
      role="region"
      aria-label="Points Leaderboard"
      className={`rounded-2xl border overflow-hidden transition-all ${
        isDark
          ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-white border-emerald-500/10 shadow-[0_4px_24px_rgba(14,122,78,0.04)]"
      } ${className}`}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr
              className={`border-b text-[11px] font-mono font-bold uppercase tracking-wider ${
                isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD]"
                  : "bg-emerald-50/50 border-emerald-500/15 text-[#4B5D55]"
              }`}
            >
              <th scope="col" className="py-3.5 px-4 sm:px-6 w-20">
                Rank
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-6">
                Trader / Wallet
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">
                Streak
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-center hidden md:table-cell">
                Multiplier
              </th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                Total Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle dark:divide-white/5">
            {currentEntries.map((entry) => {
              const isCurrentUser =
                currentUserAddress &&
                entry.address.toLowerCase() === currentUserAddress.toLowerCase();

              return (
                <tr
                  key={entry.address}
                  className={`transition-colors duration-150 ${
                    isCurrentUser
                      ? isDark
                        ? "bg-primary-blue/15 border-l-4 border-l-primary-blue font-semibold"
                        : "bg-primary-blue-soft/70 border-l-4 border-l-primary-blue font-semibold"
                      : isDark
                        ? "hover:bg-white/5 text-[#DCE5DF]"
                        : "hover:bg-slate-50 text-[#17241D]"
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6 align-middle">
                    {renderRankBadge(entry.rank)}
                  </td>

                  <td className="py-4 px-4 sm:px-6 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          isCurrentUser
                            ? "bg-primary-blue text-white"
                            : isDark
                              ? "bg-white/10 text-white"
                              : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {entry.ensName ? entry.ensName.slice(0, 1).toUpperCase() : "0x"}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm font-bold text-accent-navy dark:text-white">
                            {entry.ensName || formatAddress(entry.address)}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-blue text-white shadow-2xs">
                              YOU
                            </span>
                          )}
                        </div>
                        {entry.ensName && (
                          <span className="text-[10px] font-mono text-text-muted dark:text-[#A9B3AD]">
                            {formatAddress(entry.address)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 sm:px-6 align-middle text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-warning-soft dark:bg-amber-500/10 text-warning-amber border border-amber-500/20">
                      <span>🔥</span>
                      <span>{entry.streakDays}d</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 sm:px-6 align-middle text-center hidden md:table-cell">
                    <span className="text-xs font-mono font-bold text-yes-green px-2 py-0.5 rounded bg-yes-green/10 border border-yes-green/20">
                      {entry.multiplier || "1.0x"}
                    </span>
                  </td>

                  <td className="py-4 px-4 sm:px-6 align-middle text-right font-mono font-bold text-sm sm:text-base text-primary-blue dark:text-primary-blue">
                    +{entry.totalPoints.toLocaleString()} PTS
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={`px-4 sm:px-6 py-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
          isDark
            ? "border-white/10 bg-white/5 text-[#A9B3AD]"
            : "border-emerald-500/10 bg-slate-50/50 text-[#4B5D55]"
        }`}
      >
        <span>
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, entries.length)} of {entries.length} traders
        </span>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              currentPage <= 1
                ? "opacity-40 cursor-not-allowed border-border-subtle dark:border-white/10"
                : isDark
                  ? "bg-white/10 border-white/10 hover:bg-white/20 text-white cursor-pointer"
                  : "bg-white border-border-subtle hover:bg-slate-100 text-accent-navy cursor-pointer"
            }`}
          >
            Previous
          </button>

          <span className="px-2 font-bold text-accent-navy dark:text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              currentPage >= totalPages
                ? "opacity-40 cursor-not-allowed border-border-subtle dark:border-white/10"
                : isDark
                  ? "bg-white/10 border-white/10 hover:bg-white/20 text-white cursor-pointer"
                  : "bg-white border-border-subtle hover:bg-slate-100 text-accent-navy cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
