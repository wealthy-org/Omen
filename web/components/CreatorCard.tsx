"use client";

import React from "react";
import Link from "next/link";

export interface CreatorProfile {
  address: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  accuracyRate: number;
  confirmedBeliefs: number;
  totalBeliefs: number;
  volumeGeneratedEth: number;
  earnedFeesEth?: number;
  isVerified?: boolean;
}

export interface CreatorCardProps {
  creator: CreatorProfile;
  rank?: number;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, rank }) => {
  const shortAddress = `${creator.address.slice(0, 6)}...${creator.address.slice(-4)}`;

  return (
    <div
      data-testid={`creator-card-${creator.address}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-sm">
                {creator.name.slice(0, 2).toUpperCase()}
              </div>
              {rank !== undefined && rank <= 3 && (
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 text-zinc-900 font-black text-[10px] flex items-center justify-center shadow-xs border border-white dark:border-zinc-900">
                  {rank}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {creator.name}
                </h3>
                {creator.isVerified && (
                  <span className="inline-flex items-center text-emerald-500 text-xs font-bold" title="EIP-712 Verified Creator">
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                {creator.handle && <span>{creator.handle}</span>}
                <span className="text-[11px] opacity-75">{shortAddress}</span>
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {creator.accuracyRate}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-center my-3">
          <div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Confirmed</div>
            <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {creator.confirmedBeliefs}/{creator.totalBeliefs}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Volume</div>
            <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {creator.volumeGeneratedEth} ETH
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Fees Earned</div>
            <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {creator.earnedFeesEth !== undefined ? `${creator.earnedFeesEth} ETH` : "0 ETH"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <Link
          href={`/creator/${creator.address}`}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
          aria-label="View Profile"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default CreatorCard;
