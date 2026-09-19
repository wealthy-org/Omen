import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { getPredictionMarketAddress, PREDICTION_MARKET_ABI } from "@/lib/contracts";
import type { PlaceBetParams } from "@/types";

export type { PlaceBetParams };

export function usePlaceBet() {
  const { address } = useAccount();
  const {
    mutateAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const [isIndexing, setIsIndexing] = useState(false);
  const [indexerError, setIndexerError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const placeBet = async ({ marketId, outcome = "YES", amount = "0" }: PlaceBetParams) => {
    setIndexerError(null);
    const side = outcome === "YES";
    const numericMarketId = BigInt(marketId);
    const value = parseEther(amount);

    const hash = await mutateAsync({
      address: getPredictionMarketAddress(),
      abi: PREDICTION_MARKET_ABI,
      functionName: "placeBet",
      args: [numericMarketId, side],
      value,
    });

    try {
      setIsIndexing(true);
      const res = await fetch("/api/bets/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_market_id: Number(marketId),
          wallet_address: address,
          side: outcome.toLowerCase(),
          amount: parseFloat(amount),
          tx_hash: hash,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to index bet off-chain");
      }
    } catch {
      setIndexerError("Failed to index bet off-chain");
    } finally {
      setIsIndexing(false);
    }

    return hash;
  };

  return {
    placeBet,
    txHash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isIndexing,
    error: writeError || (indexerError ? new Error(indexerError) : null),
  };
}

export default usePlaceBet;
