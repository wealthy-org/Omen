"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import DailyCheckinWidget from "@/components/DailyCheckinWidget";
import QuestCard, { QuestCategory, QuestStatus } from "@/components/QuestCard";

interface QuestItem {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points: number;
  status: QuestStatus;
  actionLabel: string;
  actionUrl?: string;
}

const INITIAL_QUESTS: QuestItem[] = [
  {
    id: "quest-onboarding-1",
    title: "Connect Web3 Wallet",
    description: "Connect your Phantom EVM wallet to initialize your Omen account and receive your starter bonus.",
    category: "ONBOARDING",
    points: 100,
    status: "COMPLETED",
    actionLabel: "Connect Wallet",
  },
  {
    id: "quest-onboarding-2",
    title: "Request Arbitrum Sepolia Testnet ETH",
    description: "Claim faucet testnet tokens to fund your binary prediction positions.",
    category: "ONBOARDING",
    points: 150,
    status: "AVAILABLE",
    actionLabel: "Claim Faucet",
    actionUrl: "https://faucets.chain.link/arbitrum-sepolia",
  },
  {
    id: "quest-social-1",
    title: "Follow @OmenPredict on X",
    description: "Follow the official Omen protocol channel on X to get instant resolution updates.",
    category: "SOCIAL",
    points: 200,
    status: "AVAILABLE",
    actionLabel: "Follow on X",
    actionUrl: "https://x.com",
  },
  {
    id: "quest-social-2",
    title: "Join Official Discord Community",
    description: "Verify your Discord membership to access alpha channels and trader discussion rooms.",
    category: "SOCIAL",
    points: 250,
    status: "AVAILABLE",
    actionLabel: "Join Discord",
    actionUrl: "https://discord.com",
  },
  {
    id: "quest-onchain-1",
    title: "Place Your First Market Prediction",
    description: "Execute a YES or NO prediction slip of at least 0.01 ETH on any active prediction market.",
    category: "ON-CHAIN",
    points: 500,
    status: "AVAILABLE",
    actionLabel: "Explore Markets",
  },
  {
    id: "quest-onchain-2",
    title: "Achieve First Winning Settlement Claim",
    description: "Successfully claim payout rewards from a resolved winning prediction pool.",
    category: "ON-CHAIN",
    points: 750,
    status: "AVAILABLE",
    actionLabel: "View Settlements",
  },
  {
    id: "quest-daily-1",
    title: "Complete Daily Check-in Streak",
    description: "Claim your consecutive daily check-in to preserve your multiplier momentum.",
    category: "DAILY",
    points: 50,
    status: "COMPLETED",
    actionLabel: "Check In",
  },
  {
    id: "quest-daily-2",
    title: "Share Market Analysis on Social",
    description: "Share any live market probability chart with the tag #OmenPredict.",
    category: "DAILY",
    points: 100,
    status: "AVAILABLE",
    actionLabel: "Share Prediction",
  },
];

type FilterCategory = "ALL" | QuestCategory;

export default function QuestsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [quests, setQuests] = useState<QuestItem[]>(INITIAL_QUESTS);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("ALL");
  const [totalPoints, setTotalPoints] = useState(2450);

  const handleQuestAction = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.status !== "COMPLETED") {
          setTotalPoints((current) => current + q.points);
          return { ...q, status: "COMPLETED" as QuestStatus };
        }
        return q;
      })
    );
  };

  const handleDailyCheckIn = (_day: number, points: number) => {
    setTotalPoints((prev) => prev + points);
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

  return (
    <div className="w-full flex flex-col gap-8 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
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

      <div
        className={`rounded-2xl border p-6 sm:p-8 transition-all ${
          isDark
            ? "bg-gradient-to-r from-[#0A0F0C] via-[#0D1612] to-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 border-emerald-500/15 shadow-[0_4px_24px_rgba(14,122,78,0.06)]"
        }`}
      >
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
                Tier II • Silver Hunter
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-yes-green-soft dark:bg-yes-green/10 border border-yes-green/20 text-yes-green">
                1.5x Multiplier Boost
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-border-subtle shadow-xs"}`}>
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Quests Done</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-accent-navy dark:text-white">
                {completedCount}/{quests.length}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-border-subtle shadow-xs"}`}>
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Active Streak</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-warning-amber">
                3 Days
              </div>
            </div>

            <div className={`col-span-2 sm:col-span-1 p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-border-subtle shadow-xs"}`}>
              <span className="text-[11px] font-mono text-text-muted dark:text-[#A9B3AD] uppercase">Airdrop Rank</span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 text-yes-green">
                Top 8%
              </div>
            </div>
          </div>
        </div>
      </div>

      <DailyCheckinWidget onCheckIn={handleDailyCheckIn} />

      <section className="flex flex-col gap-5">
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
                      : isDark
                        ? "bg-white/5 border-white/10 text-[#A9B3AD] hover:text-white hover:bg-white/10"
                        : "bg-white border-border-subtle text-text-muted hover:text-accent-navy hover:bg-slate-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isDark
                          ? "bg-white/10 text-[#A9B3AD]"
                          : "bg-slate-100 text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredQuests.length === 0 ? (
          <div
            className={`p-10 rounded-2xl border text-center ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-border-subtle"
            }`}
          >
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
                onVerify={handleQuestAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
