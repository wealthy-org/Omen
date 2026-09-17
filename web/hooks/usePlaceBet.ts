import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { getPredictionMarketAddress, PREDICTION_MARKET_ABI } from "@/lib/contracts";

export interface PlaceBetParams {
  marketId: string | number;
  outcome: "YES" | "NO";
  amount: string;
}

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

  const placeBet = async ({ marketId, outcome, amount }: PlaceBetParams) => {
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
      await fetch("/api/bets/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          market_id: String(marketId),
          wallet_address: address,
          side: outcome,
          amount: parseFloat(amount),
          tx_hash: hash,
        }),
      });
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
