"use client";

import React from "react";
import { CreatorProfile } from "./CreatorCard";

export interface CreatorProfileHeaderProps {
  creator: CreatorProfile & {
    bio?: string;
    confirmationRate?: number;
  };
}

export const CreatorProfileHeader: React.FC<CreatorProfileHeaderProps> = ({ creator }) => {
  const shortAddress = `${creator.address.slice(0, 6)}...${creator.address.slice(-4)}`;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md shrink-0">
            {creator.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {creator.name}
              </h1>
              {creator.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ✓ Verified Creator
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
              {creator.handle && <span className="font-semibold text-zinc-700 dark:text-zinc-300">{creator.handle}</span>}
              <span>•</span>
              <span className="opacity-80">{shortAddress}</span>
            </div>

            {creator.bio && (
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-2 max-w-2xl">
                {creator.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Win Rate / Accuracy
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {creator.accuracyRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            EIP-712 Confirmation
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {creator.confirmationRate !== undefined ? `${creator.confirmationRate}%` : "100%"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Beliefs Indexed
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {creator.totalBeliefs}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Pool Volume
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {creator.volumeGeneratedEth} ETH
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfileHeader;
