"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { useCreatorConfirm } from "@/hooks/useCreatorConfirm";

export interface CreatorConfirmationProps {
  beliefId: string;
  statement: string;
  authorHandle: string;
  creatorAddress?: string;
  isConfirmed?: boolean;
  marketAddress?: string;
  onConfirmed?: (signature: string) => void;
}

export function CreatorConfirmation({
  beliefId,
  statement,
  authorHandle,
  creatorAddress,
  isConfirmed = false,
  marketAddress,
  onConfirmed,
}: CreatorConfirmationProps) {
  const { address, isConnected } = useAccount();
  const [confirmedLocally, setConfirmedLocally] = useState(isConfirmed);
  const { confirmBelief, isSigning, isConfirming, error } = useCreatorConfirm();

  const isCreatorMatch = Boolean(
    isConnected &&
    address &&
    (!creatorAddress || creatorAddress.toLowerCase() === address.toLowerCase())
  );

  const handleConfirm = async () => {
    try {
      const res = await confirmBelief({
        beliefId,
        statement,
        marketAddress: marketAddress as Address | undefined,
      });
      setConfirmedLocally(true);
      if (onConfirmed) {
        onConfirmed(res.signature);
      }
    } catch {
    }
  };

  if (confirmedLocally) {
    return (
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
            ✓
          </span>
          <span>EIP-712 Authenticated by @{authorHandle || "creator"}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Verified
        </span>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Unverified Belief &bull; Awaiting authentication from @{authorHandle || "creator"}</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
          Connect wallet to verify
        </span>
      </div>
    );
  }

  if (!isCreatorMatch) {
    return (
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>AI Detected Belief &bull; Only @{authorHandle || "creator"} can authenticate</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
          Read-Only
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            Creator Verification
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Gasless EIP-712</span>
        </div>
        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">You are @{authorHandle}</span>
      </div>
      <p className="text-xs text-zinc-700 dark:text-zinc-300">
        Sign typed data with your connected wallet to officially authenticate this belief statement.
      </p>
      <div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSigning || isConfirming}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
        >
          {isSigning || isConfirming ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Confirm Belief (EIP-712)</span>
          )}
        </button>
      </div>
      {error && (
        <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded p-2">
          {error.message || "Failed to sign creator confirmation"}
        </div>
      )}
    </div>
  );
}

export default CreatorConfirmation;
