"use client";

import React from "react";
import Link from "next/link";

export type ActivityType = "AGREE" | "DISAGREE" | "CONFIRM_EIP712" | "CLAIM" | "RESOLVE" | "MARKET_CREATED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorAddress: string;
  actorName?: string;
  marketId: string;
  marketStatement: string;
  amountEth?: number;
  outcomeWon?: string;
  txHash: string;
  chainId?: number;
  timestamp: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

function getExplorerUrl(txHash: string, chainId?: number): string {
  if (chainId === 46630) {
    return `https://explorer.robinhood.com/tx/${txHash}`;
  }
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  return "";
}

function formatRelativeTime(dateString: string): string {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          No recent activity found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => {
        const shortActor = item.actorAddress.length >= 10
          ? `${item.actorAddress.slice(0, 6)}...${item.actorAddress.slice(-4)}`
          : item.actorAddress;
        const shortTx = item.txHash.length >= 10
          ? `${item.txHash.slice(0, 8)}...`
          : item.txHash;
        const explorerUrl = getExplorerUrl(item.txHash, item.chainId);
        const displayName = item.actorName ?? shortActor;
        const avatarInitial = (item.actorName ?? item.actorAddress).slice(0, 2).toUpperCase();

        const renderBadge = () => {
          switch (item.type) {
            case "MARKET_CREATED":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  ✨ MARKET CREATED
                </span>
              );
            case "AGREE":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AGREE STAKE
                </span>
              );
            case "DISAGREE":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  DISAGREE STAKE
                </span>
              );
            case "CONFIRM_EIP712":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  ✓ EIP-712 SIGNED
                </span>
              );
            case "CLAIM":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  🏆 PAYOUT CLAIM
                </span>
              );
            case "RESOLVE":
              return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  ⚖ RESOLUTION
                </span>
              );
          }
        };

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-emerald-500/30 transition-all hover-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {avatarInitial}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </span>
                  {renderBadge()}
                  {item.amountEth !== undefined && (
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {item.amountEth} ETH
                    </span>
                  )}
                </div>

                <Link
                  href={`/market/${item.marketId}`}
                  className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1 transition-colors"
                  aria-label="View Market"
                >
                  {item.marketStatement}
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80">
              <span className="text-xs font-mono text-zinc-400">
                {formatRelativeTime(item.timestamp)}
              </span>

              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  aria-label={`View tx ${shortTx}`}
                >
                  <span>{shortTx}</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
