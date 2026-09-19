"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";

import { QuestsTeaserProps, TeaserQuest } from "@/types";

export type { QuestsTeaserProps, TeaserQuest };

export default function QuestsTeaser(_props: QuestsTeaserProps) {
  const [quests, setQuests] = useState<TeaserQuest[]>([
    {
      title: "Connect Web3 Wallet",
      category: "Onboarding",
      reward: "+100 PTS",
      progress: "0/1",
    },
    {
      title: "Place First Binary Bet (≥ 0.01 ETH)",
      category: "On-Chain",
      reward: "+250 PTS",
      progress: "0/1",
    },
    {
      title: "Daily Check-in Streak",
      category: "Daily",
      reward: "+50 PTS",
      progress: "1/1",
    },
  ]);
  const [streakCount, setStreakCount] = useState(3);

  useEffect(() => {
    let isMounted = true;
    async function fetchQuestsTeaser() {
      try {
        const res = await fetch("/api/quests");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.quests && Array.isArray(data.quests) && data.quests.length > 0) {
              const mapped: TeaserQuest[] = data.quests.slice(0, 3).map((q: any) => ({
                title: q.title,
                category: (q.category || "DAILY").toUpperCase(),
                reward: `+${q.points_reward || 100} PTS`,
                progress: q.is_completed ? "1/1" : "0/1",
              }));
              setQuests(mapped);
            }
            if (data.userProfile && data.userProfile.streak_count !== undefined) {
              setStreakCount(Number(data.userProfile.streak_count));
            }
          }
        }
      } catch {
      }
    }

    fetchQuestsTeaser();
    return () => {
      isMounted = false;
    };
  }, []);

  const DAYS = [
    { day: "D1", points: "+50", status: streakCount >= 1 ? "completed" : "locked", isMilestone: false },
    { day: "D2", points: "+50", status: streakCount >= 2 ? "completed" : "locked", isMilestone: false },
    { day: "D3", points: "+100", status: streakCount >= 3 ? "completed" : streakCount === 2 ? "today" : "locked", multiplier: "1.5x", isMilestone: true },
    { day: "D4", points: "+50", status: streakCount >= 4 ? "completed" : streakCount === 3 ? "today" : "locked", isMilestone: false },
    { day: "D5", points: "+75", status: streakCount >= 5 ? "completed" : streakCount === 4 ? "today" : "locked", isMilestone: false },
    { day: "D6", points: "+100", status: streakCount >= 6 ? "completed" : streakCount === 5 ? "today" : "locked", multiplier: "2.0x", isMilestone: false },
    { day: "D7", points: "+300", status: streakCount >= 7 ? "completed" : streakCount === 6 ? "today" : "locked", multiplier: "3.0x", isMilestone: true },
  ];

  return (
    <section className="w-full my-8 sm:my-12">
      <div className="rounded-3xl border p-6 sm:p-10 transition-all duration-300 overflow-hidden relative bg-white/95 dark:bg-[#070D09]/95 border-emerald-500/15 dark:border-emerald-500/20 light-card-shine shadow-[0_8px_32px_rgba(14,122,78,0.06),_inset_0_1px_0_#ffffff] dark:shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none light-emerald-seam dark:dark-emerald-seam" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-emerald-500/10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0E7A4E] dark:text-[#34D399]">
              Gamification & Quest Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-[#0B1F16] dark:text-white">
              Build Streaks. Multiply Your Points.
            </h2>
            <p className="text-sm sm:text-base mt-1.5 max-w-xl text-[#4B5D55] dark:text-[#A9B3AD]">
              Check in daily to build your streak multiplier and complete interactive quests to maximize your Season 1 Airdrop allocation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/quests"
              className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] bg-[#10221A] text-white hover:bg-[#183428] dark:bg-[#34D399] dark:text-[#030906] dark:hover:bg-emerald-400 dark:shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              <span>Claim Today&apos;s +50 PTS</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 pb-8 border-b border-emerald-500/10 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD]">
                7-Day Streak Multiplier Roadmap
              </span>
              <span className="text-[11px] font-mono text-yes-green font-bold">Gasless Check-in</span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {DAYS.map((d) => (
                <div
                  key={d.day}
                  className={`rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between border transition-all ${
                    d.isMilestone
                      ? "bg-emerald-100/70 dark:bg-gradient-to-b dark:from-emerald-500/20 dark:to-emerald-950/60 border-emerald-300 dark:border-emerald-400/40 shadow-xs dark:shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                      : "bg-emerald-50/50 dark:bg-black/30 border-emerald-500/10 dark:border-white/10"
                  } ${
                    d.status === "completed"
                      ? "border-yes-green/40 text-yes-green"
                      : d.status === "today"
                      ? "border-[#0E7A4E] text-[#0E7A4E] dark:border-emerald-400 dark:text-[#34D399] dark:shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                      : "text-[#4B5D55] dark:text-[#A9B3AD]"
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{d.day}</span>
                  <span className={`font-mono font-black my-1 ${d.isMilestone ? "text-base text-yes-green" : "text-sm"}`}>
                    {d.points}
                  </span>
                  {d.multiplier ? (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        d.isMilestone
                          ? "bg-yes-green text-slate-950"
                          : "bg-emerald-200 text-emerald-900 dark:bg-white/10 dark:text-white"
                      }`}
                    >
                      {d.multiplier}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono opacity-70">PTS</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl p-5 flex flex-col justify-between border bg-emerald-50/40 dark:bg-[#030704] border-emerald-500/15 dark:border-emerald-500/20">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#4B5D55] dark:text-[#A9B3AD]">Your Current Status</span>
                <span className="text-[10px] font-mono font-bold text-yes-green px-2 py-0.5 rounded bg-yes-green/10 border border-yes-green/20">
                  Active Streak
                </span>
              </div>
              <div className="text-lg font-black tracking-tight text-[#0B1F16] dark:text-white flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />
                <span>{streakCount}-Day Consecutive Streak</span>
              </div>
              <p className="text-xs mt-2 text-[#4B5D55] dark:text-[#A9B3AD]">
                You are earning with a <strong>1.5x Point Multiplier</strong>. Check in tomorrow to keep your bonus active!
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[#4B5D55] dark:text-[#A9B3AD]">Next Tier: 2.0x Boost</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">2 Days Left</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4B5D55] dark:text-[#A9B3AD]">
              Task Center • Available Quests
            </span>
            <Link href="/quests" className="text-xs font-mono font-semibold text-yes-green hover:underline">
              View All Tasks →
            </Link>
          </div>

          <div className="divide-y divide-emerald-500/10 border border-emerald-500/10 rounded-2xl overflow-hidden">
            {quests.map((quest) => (
              <div
                key={quest.title}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors bg-white hover:bg-emerald-50/50 dark:bg-black/20 dark:hover:bg-emerald-500/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold bg-emerald-50 border-emerald-500/20 text-[#0E7A4E] dark:bg-white/5 dark:border-white/10 dark:text-white/80">
                    {quest.category}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1F16] dark:text-white">
                      {quest.title}
                    </h4>
                    <span className="text-xs font-mono text-[#4B5D55] dark:text-[#A9B3AD]">
                      Progress: {quest.progress}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-mono font-black text-yes-green px-2.5 py-1 rounded-md bg-yes-green/10 border border-yes-green/20">
                    {quest.reward}
                  </span>
                  <Link
                    href="/quests"
                    className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all bg-[#10221A] text-white hover:bg-[#183428] dark:bg-white/10 dark:text-white dark:hover:bg-[#34D399] dark:hover:text-[#030906]"
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
