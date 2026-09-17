"use client";

import { useState } from "react";
import { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import { USE_MOCK_CONTRACT } from "@/lib/mock-contracts";

export interface ClaimPayoutParams {
  marketAddress: string;
  marketId?: string;
}

export function useClaim(defaultMarketAddress?: string) {
  const { address } = useAccount();
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
      let hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      if (!USE_MOCK_CONTRACT && mutateAsync) {
        hash = await mutateAsync({
          address: marketAddress as Address,
          abi: OMEN_MARKET_ABI,
          functionName: "claimPayout",
        });
      }

      setTxHash(hash);

      const syncId = marketId || marketAddress;
      try {
        await fetch(`/api/markets/${syncId}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address || "0x1111111111111111111111111111111111111111",
            marketId: syncId,
            txHash: hash,
          }),
        });
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

  const claim = async (targetAddress?: string) => {
    const target = targetAddress || defaultMarketAddress || "0x0000000000000000000000000000000000000000";
    return claimPayout({ marketAddress: target });
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
