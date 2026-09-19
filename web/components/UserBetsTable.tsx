"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, Trophy } from "lucide-react";

export type BetStatus = "active" | "won" | "lost" | "cancelled";
export type BetSide = "YES" | "NO" | "AGREE" | "DISAGREE";

export interface UserBet {
  id: string | number;
  marketId: string | number;
  marketTitle: string;
  category: string;
  side: BetSide;
  amount: string;
  payout: string;
  roiPercent?: number;
  status: BetStatus;
  isClaimed?: boolean;
  createdAt?: string;
}

export interface UserBetsTableProps {
  bets: UserBet[];
  onClaimPayout?: (bet: UserBet) => void;
  isLoading?: boolean;
}

export const UserBetsTable: React.FC<UserBetsTableProps> = ({
  bets,
  onClaimPayout,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center animate-pulse">
        <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-md mx-auto mb-4" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md mx-auto" />
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div
        data-testid="empty-user-bets"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          No Bet Positions Yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          You haven&apos;t placed any predictions yet. Explore active markets and take your position.
        </p>
        <Link
          href="/predictions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs"
        >
          Explore Prediction Markets
        </Link>
      </div>
    );
  }

  const renderSideBadge = (side: BetSide) => {
    const isAgree = side === "AGREE" || side === "YES";
    if (isAgree) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {side}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        {side}
      </span>
    );
  };

  return (
    <div
      data-testid="user-bets-table-container"
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th scope="col" className="py-3.5 px-6">
                Market Question
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Side
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Staked
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Potential Return
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Status
              </th>
              <th scope="col" className="py-3.5 px-6 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-sm font-medium">
            {bets.map((bet) => {
              const isWon = bet.status === "won";
              const isLost = bet.status === "lost";
              const isActive = bet.status === "active";
              const isCancelled = bet.status === "cancelled";

              return (
                <tr
                  key={bet.id}
                  data-testid={`bet-row-${bet.id}`}
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-4 px-6 max-w-sm">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {bet.marketTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {bet.category}
                      </span>
                      {bet.createdAt && (
                        <span className="text-xs font-mono text-zinc-400">
                          {bet.createdAt}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {renderSideBadge(bet.side)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {bet.amount} ETH
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {bet.payout} ETH
                    </span>
                    {typeof bet.roiPercent === "number" && (
                      <span className="block text-[11px] font-mono text-zinc-400">
                        +{bet.roiPercent}% ROI
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                        Active
                      </span>
                    )}
                    {isWon && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span>Won</span>
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                    {isLost && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Lost
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                        Cancelled
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {isWon && !bet.isClaimed && (
                      <button
                        type="button"
                        onClick={() => onClaimPayout?.(bet)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all"
                        aria-label={`Claim payout for ${bet.marketTitle}`}
                      >
                        Claim Payout
                      </button>
                    )}
                    {isWon && bet.isClaimed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Claimed</span>
                      </span>
                    )}
                    {isActive && (
                      <span className="text-xs text-zinc-400 font-mono">
                        Pending Settlement
                      </span>
                    )}
                    {isLost && (
                      <span className="text-xs text-zinc-400 font-mono">
                        —
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-xs text-zinc-400 font-mono">
                        Refunded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
