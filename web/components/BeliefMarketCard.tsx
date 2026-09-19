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

  const showDistinctHandle =
    market.authorHandle &&
    market.authorHandle !== market.author &&
    market.authorHandle.toLowerCase() !== market.author.toLowerCase();

  return (
    <div className="bg-white dark:bg-[#0A0F0C] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all hover-lift flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-zinc-800 text-white font-mono font-bold text-[10px] flex items-center justify-center border border-white/10 shrink-0">
              {initials}
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {market.author}
            </span>
            {showDistinctHandle && (
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                {market.authorHandle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
            <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatCountdown(market.closeTime)}</span>
          </div>
        </div>

        <Link href={`/market/${market.id}`} className="block">
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug my-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {market.statement}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 mt-3 mb-1">
          {market.isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ✓ CONFIRMED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              AI DETECTED
            </span>
          )}
          {market.category && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-semibold">
              {market.category}
            </span>
          )}
        </div>
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

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/market/${market.id}`}
            onClick={() => onSelect?.(market)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono font-bold text-xs shadow-xs hover:shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer group/btn"
          >
            <span className="font-sans font-bold text-xs">Agree</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-emerald-100 font-mono text-xs">{agreePoolPercent}%</span>
          </Link>

          <Link
            href={`/market/${market.id}`}
            onClick={() => onSelect?.(market)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-mono font-bold text-xs shadow-xs hover:shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer group/btn"
          >
            <span className="font-sans font-bold text-xs">Disagree</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-rose-100 font-mono text-xs">{disagreePoolPercent}%</span>
          </Link>
        </div>

        <div className="pt-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100/80 dark:border-white/5">
          <Link
            href={`/market/${market.id}`}
            role="button"
            onClick={() => onSelect?.(market)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-emerald-500 dark:hover:text-black text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer shadow-xs"
            aria-label={`View Market ${market.statement}`}
          >
            <span>View Market</span>
            <span className="text-xs">↗</span>
          </Link>
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">{totalParticipants > 0 ? totalParticipants.toLocaleString() : "0"}</strong> traders
          </span>
        </div>
      </div>
    </div>
  );
};

export default BeliefMarketCard;
