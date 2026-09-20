import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useConnection } from "wagmi";
import { parseEther, Address } from "viem";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import type { PlaceBetParams } from "@/types";

export type { PlaceBetParams };

export function usePlaceBet() {
  const { address } = useConnection();
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

  const placeBet = async ({
    marketId,
    outcome = "AGREE",
    amount = "0",
    contractAddress,
  }: PlaceBetParams & { contractAddress?: string; chainId?: number }) => {
    setIndexerError(null);
    const side = outcome === "AGREE";
    const value = parseEther(amount);

    const targetAddress = (contractAddress || (typeof marketId === "string" && marketId.startsWith("0x") ? marketId : undefined)) as Address | undefined;

    if (!targetAddress || !targetAddress.startsWith("0x") || targetAddress.length !== 42) {
      throw new Error("Valid market contract address is required to place a bet");
    }

    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }

    const functionName = side ? "depositAgree" : "depositDisagree";
    const hash = await mutateAsync({
      address: targetAddress,
      abi: OMEN_MARKET_ABI as any,
      functionName,
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
          contract_market_id: typeof marketId === "number" ? marketId : parseInt(String(marketId).replace(/\D/g, "") || "1", 10),
          wallet_address: address,
          side: outcome.toUpperCase(),
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
