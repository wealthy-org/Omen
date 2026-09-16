"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export interface DailyCheckinWidgetProps {
  currentStreak?: number;
  totalDays?: number;
  streakMultiplier?: string;
  initialCanCheckIn?: boolean;
  cooldownSeconds?: number;
  pointsSchedule?: number[];
  onCheckIn?: (day: number, points: number) => Promise<void> | void;
  className?: string;
}

export default function DailyCheckinWidget({
  currentStreak = 2,
  totalDays = 7,
  streakMultiplier = "1.5x Multiplier Active",
  initialCanCheckIn = true,
  cooldownSeconds = 51730,
  pointsSchedule = [50, 100, 150, 200, 300, 450, 1000],
  onCheckIn,
  className = "",
}: DailyCheckinWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [streak, setStreak] = useState(currentStreak);
  const [canCheckIn, setCanCheckIn] = useState(initialCanCheckIn);
  const [timeLeft, setTimeLeft] = useState(cooldownSeconds);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const [prevStreak, setPrevStreak] = useState(currentStreak);
  const [prevCanCheckIn, setPrevCanCheckIn] = useState(initialCanCheckIn);
  const [prevCooldown, setPrevCooldown] = useState(cooldownSeconds);

  if (currentStreak !== prevStreak) {
    setPrevStreak(currentStreak);
    setStreak(currentStreak);
  }

  if (initialCanCheckIn !== prevCanCheckIn) {
    setPrevCanCheckIn(initialCanCheckIn);
    setCanCheckIn(initialCanCheckIn);
  }

  if (cooldownSeconds !== prevCooldown) {
    setPrevCooldown(cooldownSeconds);
    setTimeLeft(cooldownSeconds);
  }

  useEffect(() => {
    if (canCheckIn || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanCheckIn(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canCheckIn, timeLeft]);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m < 10 ? "0" : ""}${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const activeDayIndex = streak;
  const activeDayNumber = Math.min(activeDayIndex + 1, totalDays);
  const activePoints = pointsSchedule[activeDayIndex] || 150;

  const handleClaim = async () => {
    if (!canCheckIn || isClaiming) return;

    setIsClaiming(true);
    try {
      if (onCheckIn) {
        await onCheckIn(activeDayNumber, activePoints);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setStreak((prev) => Math.min(prev + 1, totalDays));
      setCanCheckIn(false);
      setTimeLeft(cooldownSeconds);
      setClaimedNotice(`+${activePoints} Points Claimed!`);
      setTimeout(() => {
        setClaimedNotice(null);
      }, 3500);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <section
      role="region"
      aria-label="Daily Check-in Streak"
      className={`rounded-2xl border p-6 sm:p-8 transition-all ${
        isDark
          ? "bg-[#0A0F0C] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-white border-emerald-500/10 shadow-[0_4px_20px_rgba(14,122,78,0.04)]"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-subtle dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-soft dark:bg-amber-500/15 text-warning-amber flex items-center justify-center border border-amber-500/20 shadow-xs">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.07 3.06-7.64 5.92-10.97.43-.5 1.23-.28 1.37.37.5 2.25 1.7 4.14 3.71 5.35 1.58.95 2.76 2.37 3.42 4.07.24.62-.31 1.25-.97 1.18-.74-.08-1.5-.02-2.22.2-1.3.39-2.31 1.4-2.7 2.7-.27.9-.17 1.83.22 2.65.26.54-.15 1.15-.75 1.15-.68 0-1.34-.1-2-.3-.55-.17-1.12.16-1.27.71-.16.59.18 1.19.78 1.34 1.05.27 2.15.35 3.29.25 4.38-.38 7.93-3.95 7.98-8.34.02-2.14-.77-4.14-2.12-5.74-.42-.5-.14-1.28.51-1.39 2.55-.42 5.06 1.18 6.07 3.66C20.47 11.23 21 12.57 21 14c0 4.97-4.03 9-9 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-accent-navy dark:text-white flex items-center gap-2">
              <span>Daily Check-in Streak</span>
            </h2>
            <p className="text-xs text-text-muted dark:text-[#A9B3AD] font-medium">
              {streak}-Day Streak Active • Day 7 unlocks 3.0x Max Multiplier Vault
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border border-primary-blue/20">
            <span className="w-2 h-2 rounded-full bg-primary-blue animate-pulse" />
            {streakMultiplier}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3 my-6">
        {Array.from({ length: totalDays }, (_, index) => {
          const dayNum = index + 1;
          const points = pointsSchedule[index] || 100;
          const isChecked = index < streak;
          const isActive = index === streak && canCheckIn;
          const isLocked = index > streak || (index === streak && !canCheckIn);

          if (isChecked) {
            return (
              <div
                key={dayNum}
                className="p-3 rounded-xl border border-yes-green/30 bg-yes-green-soft dark:bg-yes-green/10 text-yes-green text-center font-mono font-bold flex flex-col items-center justify-between min-h-[96px] shadow-xs"
              >
                <div className="flex items-center justify-between w-full text-[11px] font-semibold opacity-90">
                  <span>Day {dayNum}</span>
                  <svg className="w-3.5 h-3.5 text-yes-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-xs font-black my-1">+{points}</div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-yes-green/20 text-yes-green">
                  Claimed
                </span>
              </div>
            );
          }

          if (isActive) {
            return (
              <div
                key={dayNum}
                className="p-3 rounded-xl border-2 border-primary-blue bg-primary-blue-soft dark:bg-primary-blue/15 text-primary-blue text-center font-mono font-bold flex flex-col items-center justify-between min-h-[96px] shadow-md scale-[1.02] ring-2 ring-primary-blue/20"
              >
                <div className="flex items-center justify-between w-full text-[11px] font-semibold">
                  <span>Day {dayNum}</span>
                  <span className="w-2 h-2 rounded-full bg-primary-blue animate-ping" />
                </div>
                <div className="text-sm font-black my-1 text-primary-blue dark:text-white">+{points}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-blue text-white">
                  Today
                </span>
              </div>
            );
          }

          return (
            <div
              key={dayNum}
              className={`p-3 rounded-xl border text-center font-mono flex flex-col items-center justify-between min-h-[96px] ${
                isDark
                  ? "bg-white/5 border-white/10 text-[#A9B3AD]"
                  : "bg-slate-50 border-border-subtle text-text-muted"
              }`}
            >
              <div className="flex items-center justify-between w-full text-[11px] font-medium opacity-70">
                <span>Day {dayNum}</span>
                <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xs font-bold my-1 opacity-80">+{points}</div>
              <span className="text-[10px] font-medium opacity-50 uppercase tracking-wider">
                Locked
              </span>
            </div>
          );
        })}
      </div>

      {claimedNotice && (
        <div
          role="status"
          className="mb-4 p-3 rounded-xl bg-yes-green/10 border border-yes-green/30 text-yes-green text-center text-xs font-mono font-bold animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          🎉 {claimedNotice}
        </div>
      )}

      {canCheckIn ? (
        <button
          type="button"
          onClick={handleClaim}
          disabled={isClaiming}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
            isClaiming
              ? "bg-primary-blue/70 text-white cursor-not-allowed"
              : "bg-primary-blue text-white hover:bg-primary-blue-hover cursor-pointer"
          }`}
        >
          {isClaiming ? (
            <>
              <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Claiming Reward...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>Claim Day {activeDayNumber} Reward (+{activePoints} PTS)</span>
            </>
          )}
        </button>
      ) : (
        <div
          aria-live="polite"
          className={`w-full py-3.5 px-4 rounded-xl font-mono text-sm border flex items-center justify-center gap-2.5 cursor-not-allowed ${
            isDark
              ? "bg-white/5 border-white/10 text-[#A9B3AD]"
              : "bg-slate-100 border-border-subtle text-text-muted"
          }`}
        >
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Next Check-in in {formatCountdown(timeLeft)}</span>
        </div>
      )}
    </section>
  );
}
