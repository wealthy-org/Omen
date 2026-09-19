"use client";

import React from "react";

export type MarketStatus = "active" | "closing-soon" | "resolved";
export type MarketOutcome = "YES" | "NO";

export interface MarketData {
  id: string | number;
  title: string;
  category: string;
  status: MarketStatus;
  endTime: string;
  totalPool: string;
  yesPercentage: number;
  noPercentage: number;
  volume?: string;
  resolvedOutcome?: MarketOutcome;
}

export interface MarketCardProps {
  market: MarketData;
  onSelectOutcome?: (market: MarketData, outcome: MarketOutcome) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  onSelectOutcome,
}) => {
  const isResolved = market.status === "resolved";

  const getStatusBadge = () => {
    switch (market.status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "closing-soon":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Closing Soon
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300/40 dark:border-white/10">
            Resolved
          </span>
        );
    }
  };

  return (
    <div
      data-testid={`market-card-${market.id}`}
      className="bg-white dark:bg-[#0A0F0C] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all hover-lift flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {market.category}
            </span>
            {getStatusBadge()}
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            {market.endTime}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug my-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {market.title}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/10">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>Yes</span>
            <span className="font-mono">{market.yesPercentage}%</span>
          </span>
          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <span>No</span>
            <span className="font-mono">{market.noPercentage}%</span>
          </span>
        </div>

        <div className="h-2 w-full bg-rose-500/15 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${market.yesPercentage}%` }}
            aria-label={`Yes ${market.yesPercentage}%`}
          />
        </div>

        <div className="flex items-center justify-between mt-2.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <span>Total Pool: {market.totalPool} ETH</span>
          {market.volume && <span>Vol: {market.volume} ETH</span>}
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-100/80 dark:border-white/5 flex gap-2">
          {isResolved ? (
            <div className="w-full py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
              Resolved: {market.resolvedOutcome ? `Outcome ${market.resolvedOutcome} Won 🏆` : "Market Settled"}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectOutcome?.(market, "YES")}
                className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-500/20 active:scale-98 py-2 px-3 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-between cursor-pointer"
                aria-label={`Bet Yes on ${market.title}`}
              >
                <span>Yes</span>
                <span>{market.yesPercentage}%</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectOutcome?.(market, "NO")}
                className="flex-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-500/20 active:scale-98 py-2 px-3 rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-between cursor-pointer"
                aria-label={`Bet No on ${market.title}`}
              >
                <span>No</span>
                <span>{market.noPercentage}%</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
