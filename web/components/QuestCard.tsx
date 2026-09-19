"use client";

import { useState } from "react";

export type QuestCategory = "ONBOARDING" | "SOCIAL" | "ON-CHAIN" | "DAILY";
export type QuestStatus = "AVAILABLE" | "VERIFYING" | "COMPLETED";

export interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  points: number;
  status?: QuestStatus;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: (id: string) => Promise<void> | void;
  onVerify?: (id: string) => Promise<void> | void;
  className?: string;
}

export default function QuestCard({
  id,
  title,
  description,
  category,
  points,
  status = "AVAILABLE",
  actionLabel = "Start Quest",
  actionUrl,
  onAction,
  onVerify,
  className = "",
}: QuestCardProps) {
  const [currentStatus, setCurrentStatus] = useState<QuestStatus>(status);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCategoryBadge = (cat: QuestCategory) => {
    switch (cat) {
      case "SOCIAL":
        return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      case "ON-CHAIN":
        return "text-warning-amber bg-warning-soft dark:bg-amber-500/15 border-amber-500/20";
      case "DAILY":
        return "text-yes-green bg-yes-green-soft dark:bg-yes-green/10 border-yes-green/20";
      case "ONBOARDING":
      default:
        return "text-primary-blue bg-primary-blue-soft dark:bg-primary-blue/15 border-primary-blue/20";
    }
  };

  const handleActionClick = async () => {
    if (currentStatus === "COMPLETED" || isProcessing) return;

    if (actionUrl && typeof window !== "undefined") {
      window.open(actionUrl, "_blank", "noopener,noreferrer");
    }

    setIsProcessing(true);
    setCurrentStatus("VERIFYING");

    try {
      if (onAction) {
        await onAction(id);
      }
      if (onVerify) {
        await onVerify(id);
      } else if (!onAction) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setCurrentStatus("COMPLETED");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article
      role="article"
      aria-label={`Quest: ${title}`}
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 hover-lift flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0A0F0C] border-emerald-500/10 dark:border-white/10 hover:border-emerald-500/20 dark:hover:border-white/20 shadow-[0_4px_16px_rgba(14,122,78,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(
              category
            )}`}
          >
            {category}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-accent-navy dark:text-white tracking-tight">
          {title}
        </h3>

        <p className="text-xs sm:text-sm mt-1 leading-relaxed max-w-xl text-[#4B5D55] dark:text-[#A9B3AD]">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-subtle dark:border-white/10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm bg-primary-blue-soft text-primary-blue dark:bg-primary-blue/15 dark:text-primary-blue border border-primary-blue/20 shadow-2xs">
          <svg className="w-3.5 h-3.5 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>+{points} PTS</span>
        </div>

        {currentStatus === "COMPLETED" ? (
          <div
            className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm font-mono flex items-center gap-1.5 bg-yes-green-soft dark:bg-yes-green/10 text-yes-green border border-yes-green/30 shadow-2xs"
            aria-label="Quest completed"
          >
            <svg className="w-4 h-4 text-yes-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Completed</span>
          </div>
        ) : currentStatus === "VERIFYING" || isProcessing ? (
          <button
            type="button"
            disabled
            className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 cursor-wait border bg-slate-100 dark:bg-white/10 border-border-subtle dark:border-white/10 text-text-muted dark:text-[#A9B3AD]"
          >
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Verifying...</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleActionClick}
            className="bg-primary-blue text-white hover:bg-primary-blue-hover px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>{actionLabel}</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}
