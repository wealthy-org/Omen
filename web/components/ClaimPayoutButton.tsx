"use client";

import React, { useState } from "react";

export interface ClaimPayoutButtonProps {
  amount: string | number;
  isClaimed?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClaim?: () => Promise<void> | void;
  className?: string;
}

export const ClaimPayoutButton: React.FC<ClaimPayoutButtonProps> = ({
  amount,
  isClaimed = false,
  isLoading = false,
  disabled = false,
  onClaim,
  className = "",
}) => {
  const [internalLoading, setInternalLoading] = useState<boolean>(false);

  const isPending = isLoading || internalLoading;

  const handleClick = async () => {
    if (isClaimed || isPending || disabled || !onClaim) return;

    try {
      setInternalLoading(true);
      await onClaim();
    } catch {
    } finally {
      setInternalLoading(false);
    }
  };

  if (isClaimed) {
    return (
      <span
        data-testid="claim-payout-claimed-badge"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 ${className}`}
      >
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>Claimed</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      data-testid="claim-payout-btn"
      onClick={handleClick}
      disabled={disabled || isPending}
      className={`px-4 py-2 rounded-lg font-bold text-xs font-mono shadow-xs transition-all flex items-center justify-center gap-1.5 ${
        disabled || isPending
          ? "bg-emerald-600/60 dark:bg-emerald-500/50 text-white cursor-not-allowed opacity-75"
          : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-zinc-950 active:scale-98 cursor-pointer"
      } ${className}`}
      aria-label={`Claim ${amount} ETH payout`}
      aria-busy={isPending}
    >
      {isPending ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Claiming...</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Claim {amount} ETH</span>
        </>
      )}
    </button>
  );
};
