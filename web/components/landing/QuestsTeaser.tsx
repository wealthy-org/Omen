"use client";

import Link from "next/link";
import { useTheme } from "../ThemeProvider";

export interface QuestsTeaserProps {
  theme?: "dark" | "light";
}

export default function QuestsTeaser({ theme: propTheme }: QuestsTeaserProps) {
  const contextTheme = useTheme();
  const isDark = (propTheme || contextTheme.theme || "dark") === "dark";

  const DAYS = [
    { day: "D1", points: "+50", status: "completed" },
    { day: "D2", points: "+50", status: "completed" },
    { day: "D3", points: "+100", status: "completed", multiplier: "1.5x" },
    { day: "D4", points: "+50", status: "today" },
    { day: "D5", points: "+75", status: "locked" },
    { day: "D6", points: "+100", status: "locked", multiplier: "2.0x" },
    { day: "D7", points: "+300", status: "locked", multiplier: "3.0x" },
  ];

  const ACTIVE_QUESTS = [
    {
      title: "Connect Web3 Wallet",
      category: "Onboarding",
      reward: "+100 PTS",
      status: "Available",
      progress: "0/1",
    },
    {
      title: "Place First Binary Bet (≥ 0.01 ETH)",
      category: "Betting",
      reward: "+250 PTS",
      status: "Available",
      progress: "0/1",
    },
    {
      title: "Maintain 3-Day Check-in Streak",
      category: "Streak",
      reward: "+150 PTS",
      status: "In Progress",
      progress: "2/3",
    },
  ];

  return (
    <section className="w-full my-12">
      <div
        className={`rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl transition-all duration-300 ${
          isDark
            ? "bg-[#0A0F0C] border border-emerald-500/15"
            : "bg-white border border-emerald-900/10 shadow-[0_4px_28px_rgba(14,122,78,0.06)]"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            isDark
              ? "bg-gradient-to-bl from-emerald-500/15 via-emerald-600/5 to-transparent"
              : "bg-gradient-to-bl from-emerald-400/20 via-mint-soft/30 to-transparent"
          }`}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>
              Gamification & Quest Engine
            </span>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>
              Build Streaks. Multiply Your Points.
            </h2>
            <p className={`text-sm sm:text-base mt-2 max-w-xl ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
              Check in daily to build your streak multiplier and complete interactive quests to maximize your Season 1 Airdrop allocation.
            </p>
          </div>

          <Link
            href="/quests"
            className={`px-6 py-3.5 rounded-[14px] text-sm font-bold shrink-0 flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
              isDark
                ? "bg-[#34D399] text-[#030906] hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "bg-[#10221A] text-white hover:bg-[#183428]"
            }`}
          >
            <span>Claim Today&apos;s +50 PTS</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className={`grid grid-cols-7 gap-2 sm:gap-3 my-6 pb-6 border-b overflow-x-auto ${isDark ? "border-white/10" : "border-emerald-900/10"}`}>
          {DAYS.map((d) => (
            <div
              key={d.day}
              className={`rounded-xl p-3 text-center flex flex-col items-center justify-between border transition-all ${
                d.status === "completed"
                  ? "bg-yes-green/10 border-yes-green/40 text-yes-green"
                  : d.status === "today"
                  ? isDark
                    ? "bg-emerald-500/20 border-emerald-400 text-[#34D399] shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                    : "bg-emerald-100 border-[#0E7A4E] text-[#0E7A4E] shadow-[0_0_15px_rgba(14,122,78,0.2)]"
                  : isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD]"
                  : "bg-emerald-50/50 border-emerald-900/10 text-[#4B5D55]"
              }`}
            >
              <span className="text-xs font-mono font-bold">{d.day}</span>
              <span className="text-sm font-mono font-black my-1">{d.points}</span>
              {d.multiplier ? (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${isDark ? "bg-white/10 text-white" : "bg-emerald-200 text-emerald-900"}`}>
                  {d.multiplier}
                </span>
              ) : (
                <span className="text-[10px] font-mono opacity-80">PTS</span>
              )}
            </div>
          ))}
        </div>

        <div>
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}`}>
            Featured Quests Available Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIVE_QUESTS.map((quest) => (
              <div
                key={quest.title}
                className={`rounded-xl p-4 transition-all flex flex-col justify-between ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-emerald-500/30"
                    : "bg-emerald-50/60 border border-emerald-900/10 hover:border-emerald-600/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className={isDark ? "text-[#A9B3AD]" : "text-[#4B5D55]"}>{quest.category}</span>
                    <span className={`font-bold ${isDark ? "text-[#34D399]" : "text-[#0E7A4E]"}`}>{quest.reward}</span>
                  </div>
                  <h4 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-[#0B1F16]"}`}>{quest.title}</h4>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t text-xs ${isDark ? "border-white/5 text-[#A9B3AD]" : "border-emerald-900/5 text-[#4B5D55]"}`}>
                  <span>Progress: {quest.progress}</span>
                  <Link
                    href="/quests"
                    className={`text-xs font-mono font-semibold ${isDark ? "text-[#34D399] hover:text-[#6EE7B7]" : "text-[#0E7A4E] hover:text-[#047857]"}`}
                  >
                    Start →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
