import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { Address } from "viem";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
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
    contractAddress,
  }: ResolveMarketParams & { contractAddress?: string }): Promise<string> => {
    setSyncError(null);

    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }

    const targetAddress = (contractAddress || (typeof marketId === "string" && marketId.startsWith("0x") ? marketId : undefined)) as Address | undefined;

    let hash = "0x" as `0x${string}`;

    if (targetAddress && targetAddress.startsWith("0x") && targetAddress.length === 42) {
      if (outcome === "CANCEL" || outcome === "VOID") {
        hash = await mutateAsync({
          address: targetAddress,
          abi: OMEN_MARKET_ABI as any,
          functionName: "voidMarket",
        });
      } else {
        const outcomeUint = outcome === "AGREE" ? 1 : 2;
        hash = await mutateAsync({
          address: targetAddress,
          abi: OMEN_MARKET_ABI as any,
          functionName: "resolveMarket",
          args: [outcomeUint],
        });
      }
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
          resolution_tx_hash: hash !== "0x" ? hash : null,
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
