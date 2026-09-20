"use client";

import { useState } from "react";
import { parseEther, Address } from "viem";
import { useConnection, useWriteContract } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import type { PlacePositionParams } from "@/types";

export type { PlacePositionParams };

export function usePosition() {
  const { address } = useConnection();
  const { mutateAsync } = useWriteContract();

  const [isPending, setIsPending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const placePosition = async ({
    marketAddress,
    marketId,
    side,
    amount,
    amountEth,
  }: PlacePositionParams) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    const rawAmount = amount !== undefined && amount !== null ? amount : amountEth;
    const strAmount = rawAmount !== undefined && rawAmount !== null ? String(rawAmount) : "";
    const numAmount = parseFloat(strAmount);

    if (!strAmount || isNaN(numAmount) || numAmount <= 0) {
      setIsPending(false);
      const err = new Error("Amount must be greater than 0 ETH.");
      setError(err);
      throw err;
    }

    try {
      const parsedWei = parseEther(strAmount);

      if (!mutateAsync) {
        throw new Error("Wallet not connected or contract write unavailable.");
      }
      const functionName = side === "AGREE" ? "depositAgree" : "depositDisagree";
      const hash = await mutateAsync({
        address: marketAddress as Address,
        abi: OMEN_MARKET_ABI,
        functionName,
        value: parsedWei,
      });

      if (!address) {
        throw new Error("Wallet not connected");
      }

      setTxHash(hash);

      const syncId = marketId || marketAddress;
      const userAddr = address;
      try {
        const res = await fetch(`/api/markets/${syncId}/position`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: userAddr,
            side,
            amount: numAmount,
            tx_hash: hash,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to record position in database");
        }
      } catch {
      }

      setIsSuccess(true);
      return hash;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsPending(false);
    }
  };

  return {
    placePosition,
    isPending,
    isSuccess,
    error,
    txHash,
  };
}

export default usePosition;
