import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { getPredictionMarketAddress, PREDICTION_MARKET_ABI } from "@/lib/contracts";

export interface ResolveMarketParams {
  marketId: string | number;
  outcome: "YES" | "NO" | "CANCEL";
  notes?: string;
  cancellationReason?: string;
}

export interface ResolveMarketResult {
  resolveMarket: (params: ResolveMarketParams) => Promise<string>;
  txHash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isSyncing: boolean;
  error: Error | null;
}

export function useAdminResolveMarket(): ResolveMarketResult {
  const { address } = useAccount();
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

    let hash: `0x${string}`;
    const contractAddress = getPredictionMarketAddress();

    if (outcome === "CANCEL") {
      hash = await mutateAsync({
        address: contractAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: "cancelMarket",
        args: [numericMarketId],
      });
    } else {
      const result = outcome === "YES";
      hash = await mutateAsync({
        address: contractAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: "resolveMarket",
        args: [numericMarketId, result],
      });
    }

    try {
      setIsSyncing(true);
      const adminWallet = address
        ? address.toLowerCase()
        : (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();

      const res = await fetch(`/api/markets/${marketId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminWallet ? { "x-admin-wallet": adminWallet } : {}),
        },
        body: JSON.stringify({
          status:
            outcome === "CANCEL"
              ? "cancelled"
              : outcome === "YES"
              ? "resolved_yes"
              : "resolved_no",
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
