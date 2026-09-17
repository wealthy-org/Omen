"use client";

import React from "react";
import Link from "next/link";

export type BeliefStatus = "OPEN" | "CLOSED" | "RESOLVED" | "DETECTED";

export interface BeliefMarket {
  id: string;
  statement: string;
  author: string;
  authorHandle?: string;
  isConfirmed: boolean;
  status: BeliefStatus;
  agreePool: number;
  disagreePool: number;
  agreeParticipants: number;
  disagreeParticipants: number;
  closeTime: string;
  category?: string;
  volume?: number;
}

export interface BeliefMarketCardProps {
  market: BeliefMarket;
  onSelect?: (market: BeliefMarket) => void;
}

function formatCountdown(dateString: string): string {
  try {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    if (diff <= 0) return "Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  } catch {
    return dateString;
  }
}

export const BeliefMarketCard: React.FC<BeliefMarketCardProps> = ({
  market,
  onSelect,
}) => {
  const totalPool = market.agreePool + market.disagreePool;
  const totalParticipants = market.agreeParticipants + market.disagreeParticipants;
  
  const agreePoolPercent = totalPool > 0 ? Math.round((market.agreePool / totalPool) * 100) : 50;
  const disagreePoolPercent = totalPool > 0 ? 100 - agreePoolPercent : 50;

  const agreeParticipantPercent = totalParticipants > 0 ? Math.round((market.agreeParticipants / totalParticipants) * 100) : 50;
  const disagreeParticipantPercent = totalParticipants > 0 ? 100 - agreeParticipantPercent : 50;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {market.category && (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {market.category}
              </span>
            )}
            {market.isConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ✓ CONFIRMED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                AI DETECTED
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {formatCountdown(market.closeTime)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{market.author}</span>
          {market.authorHandle && (
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{market.authorHandle}</span>
          )}
        </div>

        <Link href={`/market/${market.id}`} className="block">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug my-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {market.statement}
          </h3>
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
            <span>Consensus (People)</span>
            <div className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{agreeParticipantPercent}% AGREE</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">{disagreeParticipantPercent}% DISAGREE</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${agreeParticipantPercent}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${disagreeParticipantPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
            <span>Money (Pool: {totalPool} ETH)</span>
            <div className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{agreePoolPercent}% AGREE</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">{disagreePoolPercent}% DISAGREE</span>
            </div>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${agreePoolPercent}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${disagreePoolPercent}%` }}
            />
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Link
            href={`/market/${market.id}`}
            className="flex-1"
          >
            <button
              type="button"
              onClick={() => onSelect?.(market)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 shadow-sm"
              aria-label={`View Market ${market.statement}`}
            >
              View Market
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BeliefMarketCard;
