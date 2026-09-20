"use client";

import { useState } from "react";
import { Address } from "viem";
import { useConnection, useWriteContract } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import type { ClaimPayoutParams } from "@/types";

export type { ClaimPayoutParams };

export function useClaim() {
  const { address } = useConnection();
  const { mutateAsync } = useWriteContract();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const claimPayout = async ({ marketAddress, marketId }: ClaimPayoutParams) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    try {
      if (!address) {
        throw new Error("Wallet not connected");
      }
      if (!marketAddress || !marketAddress.trim()) {
        throw new Error("Market contract address is required to claim payout");
      }
      if (!mutateAsync) {
        throw new Error("Wallet not connected or contract write unavailable.");
      }

      const hash = await mutateAsync({
        address: marketAddress as Address,
        abi: OMEN_MARKET_ABI,
        functionName: "claimPayout",
      });

      setTxHash(hash);

      const syncId = marketId || marketAddress;
      const userAddr = address;
      try {
        const res = await fetch(`/api/markets/${syncId}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: userAddr,
            tx_hash: hash,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to record claim in database");
        }
      } catch {
      }

      setIsSuccess(true);
      return hash;
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsPending(false);
    }
  };

  const claim = async (marketAddress: string) => {
    if (!marketAddress || !marketAddress.trim()) {
      throw new Error("Market contract address is required to claim payout");
    }
    return claimPayout({ marketAddress });
  };

  return {
    claim,
    claimPayout,
    isPending,
    isSuccess,
    error,
    txHash,
  };
}

export default useClaim;
