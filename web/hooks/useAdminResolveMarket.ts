import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { OMEN_FACTORY_ADDRESS, PREDICTION_MARKET_ABI, getOmenFactoryAddress } from "@/lib/contracts";
import type { ResolveMarketParams, ResolveMarketResult } from "@/types";

export type { ResolveMarketParams, ResolveMarketResult };

export function useAdminResolveMarket(): ResolveMarketResult {
  const { address } = useConnection();
  const {
    mutateAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const resolveMarket = async ({
    marketId,
    outcome,
    notes = "",
    cancellationReason,
  }: ResolveMarketParams): Promise<string> => {
    setSyncError(null);
    const numericStr = String(marketId).replace(/\D/g, "");
    const numericMarketId = BigInt(numericStr.length > 0 ? numericStr : "1");

    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }
    const targetAddress = (getOmenFactoryAddress() || OMEN_FACTORY_ADDRESS) as `0x${string}`;

    let hash: `0x${string}`;
    if (outcome === "CANCEL" || outcome === "VOID") {
      hash = await mutateAsync({
        address: targetAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: "cancelMarket",
        args: [numericMarketId],
      });
    } else {
      const result = outcome === "AGREE";
      hash = await mutateAsync({
        address: targetAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [numericMarketId, result],
      });
    }

    try {
      setIsSyncing(true);
      const adminWallet = address ? address.toLowerCase() : "";

      const res = await fetch(`/api/markets/${marketId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminWallet ? { "x-admin-wallet": adminWallet } : {}),
        },
        body: JSON.stringify({
          status:
            outcome === "CANCEL" || outcome === "VOID"
              ? "cancelled"
              : "RESOLVED",
          outcome: outcome,
          winner: outcome === "CANCEL" ? "VOID" : outcome,
          resolution_source: notes,
          cancellation_reason: cancellationReason,
          admin_wallet: address,
          tx_hash: hash,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update market resolution status in database");
      }
    } catch {
      setSyncError("Failed to update market resolution status in database");
    } finally {
      setIsSyncing(false);
    }

    return hash;
  };

  return {
    resolveMarket,
    txHash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSyncing,
    error: writeError || (syncError ? new Error(syncError) : null),
  };
}

export default useAdminResolveMarket;
