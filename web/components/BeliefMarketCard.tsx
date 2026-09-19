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
  
  const agreePoolPercent = totalPool > 0 ? Math.round((market.agreePool / totalPool) * 100) : 0;
  const disagreePoolPercent = totalPool > 0 ? 100 - agreePoolPercent : 0;

  const agreeParticipantPercent = totalParticipants > 0 ? Math.round((market.agreeParticipants / totalParticipants) * 100) : 0;
  const disagreeParticipantPercent = totalParticipants > 0 ? 100 - agreeParticipantPercent : 0;

  const initials = (market.author || "OM")
    .replace("@", "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white dark:bg-[#0A0F0C] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all hover-lift flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-mono font-bold text-[10px] flex items-center justify-center border border-white/10">
              {initials}
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {market.author}
            </span>
            {market.authorHandle && (
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {market.authorHandle}
              </span>
            )}
            {market.isConfirmed ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ✓ CONFIRMED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300/40 dark:border-white/10">
                AI DETECTED
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {formatCountdown(market.closeTime)}
          </span>
        </div>

        <Link href={`/market/${market.id}`} className="block">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug my-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {market.statement}
          </h3>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/10 space-y-3">
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

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/market/${market.id}`}
            onClick={() => onSelect?.(market)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all font-mono font-bold text-xs"
          >
            <span>Agree</span>
            <span className="text-xs">{agreePoolPercent}%</span>
          </Link>

          <Link
            href={`/market/${market.id}`}
            onClick={() => onSelect?.(market)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all font-mono font-bold text-xs"
          >
            <span>Disagree</span>
            <span className="text-xs">{disagreePoolPercent}%</span>
          </Link>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => onSelect?.(market)}
            className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            aria-label={`View Market ${market.statement}`}
          >
            View Market ↗
          </button>
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">{totalParticipants > 0 ? totalParticipants.toLocaleString() : "0"}</strong> traders
          </span>
        </div>
      </div>
    </div>
  );
};

export default BeliefMarketCard;
