"use client";

import React from "react";
import Link from "next/link";

import { BeliefCardStatus, BeliefItem, BeliefCardProps } from "@/types";

export type { BeliefCardStatus, BeliefItem, BeliefCardProps };

export const BeliefCard: React.FC<BeliefCardProps> = ({
  belief,
  onCreateMarket,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all hover-lift flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {belief.isConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ✓ CONFIRMED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                AI DETECTED
              </span>
            )}

            {belief.confidenceScore !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {belief.confidenceScore}% Confidence
              </span>
            )}
          </div>

          {belief.sourceUrl && (
            <a
              href={belief.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-mono flex items-center gap-1 transition-colors"
              aria-label="View Source"
            >
              <span>Source</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
            <span>{belief.author.slice(0, 2).toUpperCase()}</span>
            <img
              src={`/api/avatar/${(belief.authorHandle || belief.author).replace('@', '')}`}
              alt={belief.author}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {belief.author}
            </div>
            {belief.authorHandle && (
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                {belief.authorHandle}
              </div>
            )}
          </div>
        </div>

        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug my-2">
          {belief.statement}
        </p>

        {(belief.subject || belief.comparisonAsset || belief.direction || belief.targetTime) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {belief.subject && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Asset: {belief.subject}
              </span>
            )}
            {belief.direction && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Dir: {belief.direction}
              </span>
            )}
            {belief.targetTime && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Target: {belief.targetTime}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        {belief.marketId ? (
          <Link
            href={`/market/${belief.marketId}`}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
            aria-label="View Market"
          >
            View Market
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onCreateMarket?.(belief)}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold transition-all shadow-sm"
            aria-label="Create Market"
          >
            Create Market
          </button>
        )}
      </div>
    </div>
  );
};

export default BeliefCard;
