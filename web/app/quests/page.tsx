"use client";

import { useState, useEffect } from "react";
import DailyCheckinWidget from "@/components/DailyCheckinWidget";
import QuestCard from "@/components/QuestCard";
import { mockPredictionMarket } from "@/lib/mockPredictionMarket";
import type { QuestCategory, QuestStatus, QuestItem, FilterCategory } from "@/types";

export type { QuestItem, FilterCategory };

export default function QuestsPage() {
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("ALL");
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveQuests() {
      const demo = mockPredictionMarket.getDemoWallet();
      try {
        setIsLoading(true);
        const res = await fetch(`/api/quests?wallet_address=${demo.address}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.quests && Array.isArray(data.quests)) {
              const mapped: QuestItem[] = data.quests.map((q: any) => ({
                id: q.id,
                title: q.title,
                description: q.description || "",
                category: (q.category || "DAILY").toUpperCase() as QuestCategory,
                points: Number(q.points_reward || 100),
                status: q.is_completed ? "COMPLETED" : "AVAILABLE",
                actionLabel: q.is_completed ? "Completed" : "Complete Quest",
                actionUrl: q.action_url,
              }));
              setQuests(mapped);
            }
            if (data.userProfile) {
              setTotalPoints(Number(data.userProfile.total_points || 0));
              setStreakCount(Number(data.userProfile.streak_count || 0));
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

    fetchLiveQuests();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuestAction = async (questId: string) => {
    const demo = mockPredictionMarket.getDemoWallet();
    const targetQuest = quests.find((q) => q.id === questId);

    if (targetQuest && targetQuest.status !== "COMPLETED") {
      setTotalPoints((current) => current + (targetQuest.points ?? targetQuest.xp_reward ?? 0));
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: "COMPLETED" as QuestStatus } : q))
      );

      try {
        await fetch(`/api/quests/${questId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: demo.address }),
        });
      } catch {
      }
    }
  };

  const handleDailyCheckIn = async (_day: number, points: number) => {
    const demo = mockPredictionMarket.getDemoWallet();
    setTotalPoints((prev) => prev + points);
    setStreakCount((prev) => prev + 1);

    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: demo.address }),
      });
    } catch {
    }
  };

  const filteredQuests =
    activeFilter === "ALL"
      ? quests
      : quests.filter((quest) => quest.category === activeFilter);

  const completedCount = quests.filter((q) => q.status === "COMPLETED").length;

  const filterOptions: { label: string; value: FilterCategory }[] = [
    { label: "All Quests", value: "ALL" },
    { label: "Onboarding", value: "ONBOARDING" },
    { label: "Social", value: "SOCIAL" },
    { label: "On-Chain", value: "ON-CHAIN" },
    { label: "Daily", value: "DAILY" },
  ];

  const tierLabel =
    totalPoints >= 5000
      ? "Tier III • Gold Legend"
      : totalPoints >= 1000
      ? "Tier II • Silver Hunter"
      : "Tier I • Bronze Initiate";

  const tierMultiplier =
    totalPoints >= 5000 ? "2.0x Multiplier Boost" : totalPoints >= 1000 ? "1.5x Multiplier Boost" : "1.0x Multiplier";

  const airdropRank =
    totalPoints >= 5000 ? "Top 3%" : totalPoints >= 2000 ? "Top 8%" : totalPoints >= 500 ? "Top 25%" : "Top 50%";

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-fade-in">
      <div className="flex flex-col gap-2 animate-slide-down">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border-primary-blue/20">
            Points Hub • Season 1
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-accent-navy dark:text-white">
          Quests & Points Farming
        </h1>
        <p className="text-sm sm:text-base text-text-muted dark:text-[#A9B3AD] max-w-2xl">
          Complete daily activities, verify social tasks, and predict on-chain to accumulate Omen ecosystem points.
        </p>
      </div>

      <div className="rounded-2xl border p-6 sm:p-8 transition-all animate-slide-up stagger-1 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 dark:from-[#0A0F0C] dark:via-[#0D1612] dark:to-[#0A0F0C] border-emerald-500/15 dark:border-white/10 shadow-[0_4px_24px_rgba(14,122,78,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted dark:text-[#A9B3AD]">
              Your Accumulated Balance
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-primary-blue mt-1">
              {totalPoints.toLocaleString()} <span className="text-2xl font-bold">PTS</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-white/10 border border-border-subtle dark:border-white/10 text-accent-navy dark:text-white">
                {tierLabel}
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-yes-green-soft dark:bg-yes-green/10 border border-yes-green/20 text-yes-green">
                {tierMultiplier}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border hover-lift bg-white dark:bg-white/5 border-border-subtle dark:border-white/10 shadow-xs dark:shadow-none">
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Quests Done</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-accent-navy dark:text-white">
                {completedCount}/{quests.length}
              </div>
            </div>

            <div className="p-4 rounded-xl border hover-lift bg-white dark:bg-white/5 border-border-subtle dark:border-white/10 shadow-xs dark:shadow-none">
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Active Streak</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-warning-amber">
                {streakCount} Days
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border hover-lift bg-white dark:bg-white/5 border-border-subtle dark:border-white/10 shadow-xs dark:shadow-none">
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Airdrop Rank</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-yes-green">
                {airdropRank}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-slide-up stagger-2">
        <DailyCheckinWidget
          currentStreak={streakCount}
          onCheckIn={handleDailyCheckIn}
        />
      </div>

      <section className="flex flex-col gap-5 animate-slide-up stagger-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-accent-navy dark:text-white">
              Ecosystem Quests
            </h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-[#A9B3AD]">
              Filter tasks by category and verify completion to unlock instant reward points.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.value;
              const count =
                opt.value === "ALL"
                  ? quests.length
                  : quests.filter((q) => q.category === opt.value).length;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-primary-blue text-white border-primary-blue shadow-xs"
                      : "bg-white dark:bg-white/5 border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD] hover:text-accent-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-white/10 text-text-muted dark:text-[#A9B3AD]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-slate-100 dark:bg-white/5 border-border-subtle dark:border-white/10 h-28"
              />
            ))}
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="p-10 rounded-2xl border text-center bg-slate-50 dark:bg-white/5 border-border-subtle dark:border-white/10">
            <p className="text-sm text-text-muted dark:text-[#A9B3AD]">
              No quests found in this category.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description}
                category={quest.category}
                points={quest.points}
                status={quest.status}
                actionLabel={quest.actionLabel}
                actionUrl={quest.actionUrl}
                onAction={handleQuestAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
