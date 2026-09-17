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
  const { address } = useAccount();
  const [confirmedLocally, setConfirmedLocally] = useState(isConfirmed);
  const { confirmBelief, isSigning, isConfirming, error } = useCreatorConfirm();

  const isCreatorMatch =
    !creatorAddress ||
    !address ||
    creatorAddress.toLowerCase() === address.toLowerCase();

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
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
            ✓
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              EIP-712 Authenticated
            </div>
            <div className="text-sm font-medium text-zinc-200">
              Confirmed by @{authorHandle}
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          Official Signature
        </span>
      </div>
    );
  }

  return (
    <div className="bg-purple-50/50 dark:bg-zinc-900/70 border border-purple-500/30 rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Creator Verification
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Gasless EIP-712</span>
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-300">
            Are you <span className="font-semibold text-purple-700 dark:text-purple-300">@{authorHandle}</span>? Sign typed data to officially authenticate this belief statement.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSigning || isConfirming || !isCreatorMatch}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isSigning || isConfirming ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{isSigning ? "Signing..." : "Verifying..."}</span>
              </>
            ) : (
              <span>Confirm Belief (EIP-712)</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded p-2">
          {error.message || "Failed to sign creator confirmation"}
        </div>
      )}
    </div>
  );
}

export default CreatorConfirmation;
