"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import LeaderboardTable, { LeaderboardEntry } from "@/components/LeaderboardTable";

const FULL_LEADERBOARD_DATA: LeaderboardEntry[] = [
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

const CURRENT_USER = "0x1234567890abcdef1234567890abcdef12345678";

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = FULL_LEADERBOARD_DATA.filter((entry) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      entry.address.toLowerCase().includes(query) ||
      (entry.ensName && entry.ensName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
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
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark
              ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Your Current Rank
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border border-primary-blue/20">
              Top 5%
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-accent-navy dark:text-white flex items-center gap-2">
            <span>#4</span>
            <span className="text-sm font-semibold text-text-muted dark:text-[#A9B3AD] font-sans">
              (omen-hunter.eth)
            </span>
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            Higher rank grants larger share in Season 1 token airdrop.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark
              ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Your Total Points
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-yes-green-soft text-yes-green dark:bg-yes-green/10 border border-yes-green/20">
              2.0x Multiplier
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-primary-blue">
            52,300 <span className="text-lg font-bold">PTS</span>
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            14 consecutive streak days maintaining 2.0x boost.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark
              ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-text-muted dark:text-[#A9B3AD]">
              Gap to Next Tier
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warning-soft text-warning-amber dark:bg-amber-500/15 border border-amber-500/20">
              🥉 Bronze Podium
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-warning-amber">
            +29,100 <span className="text-lg font-bold">PTS</span>
          </div>
          <p className="text-xs text-text-muted dark:text-[#A9B3AD] mt-2">
            Needed to overtake #3 satoshi-prophet.eth (81,400 PTS).
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
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition-all outline-none ${
                isDark
                  ? "bg-[#0A0F0C] border-white/10 text-white placeholder:text-[#A9B3AD]/50 focus:border-primary-blue"
                  : "bg-white border-border-subtle text-accent-navy placeholder:text-text-muted/60 focus:border-primary-blue shadow-xs"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-accent-navy dark:hover:text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="text-xs font-mono font-medium text-text-muted dark:text-[#A9B3AD]">
            Displaying {filteredEntries.length} ranked traders
          </div>
        </div>

        <LeaderboardTable
          entries={filteredEntries}
          currentUserAddress={CURRENT_USER}
          pageSize={10}
        />
      </div>
    </div>
  );
}
