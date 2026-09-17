"use client";

import { useState } from "react";
import { parseEther, Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import { USE_MOCK_CONTRACT } from "@/lib/mockContracts";

export interface PlacePositionParams {
  marketAddress: string;
  marketId?: string;
  side: "AGREE" | "DISAGREE";
  amount?: string | number;
  amountEth?: number | string;
}

export function usePosition() {
  const { address } = useAccount();
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

    const rawAmount = amount ?? amountEth;
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
      let hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      if (!USE_MOCK_CONTRACT && mutateAsync) {
        const functionName = side === "AGREE" ? "depositAgree" : "depositDisagree";
        hash = await mutateAsync({
          address: marketAddress as Address,
          abi: OMEN_MARKET_ABI,
          functionName,
          value: parsedWei,
        });
      }

      setTxHash(hash);

      const syncId = marketId || marketAddress;
      try {
        await fetch(`/api/markets/${syncId}/position`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddress: address || "0x1111111111111111111111111111111111111111",
            marketId: syncId,
            side,
            amount: numAmount,
            txHash: hash,
          }),
        });
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
