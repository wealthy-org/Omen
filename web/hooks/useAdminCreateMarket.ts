import { useState } from "react";
import { decodeEventLog } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  usePublicClient,
} from "wagmi";
import { OMEN_FACTORY_ADDRESS, PREDICTION_MARKET_ABI, getOmenFactoryAddress } from "@/lib/contracts";
import type { CreateMarketParams, CreateMarketResult } from "@/types";

export type { CreateMarketParams, CreateMarketResult };

export function useAdminCreateMarket(): CreateMarketResult {
  const { address } = useConnection();
  const publicClient = usePublicClient();
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

  const createMarket = async ({
    title = "",
    category = "CRYPTO",
    endTime = new Date().toISOString(),
    resolutionSourceUrl = "",
    resolutionCriteria = "",
    initialLiquidity = "0.50",
  }: CreateMarketParams): Promise<{ hash: string; contractMarketId: string }> => {
    setSyncError(null);
    const deadline = BigInt(Math.floor(new Date(endTime).getTime() / 1000));

    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }
    const targetAddress = getOmenFactoryAddress() || OMEN_FACTORY_ADDRESS;
    const hash = await mutateAsync({
      address: targetAddress as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: [title, deadline],
    });

    let contractMarketId = String(Date.now());

    if (publicClient && hash) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: PREDICTION_MARKET_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "MarketCreated" && decoded.args) {
              const argsObj = decoded.args as { marketId?: bigint };
              if (argsObj.marketId !== undefined) {
                contractMarketId = argsObj.marketId.toString();
                break;
              }
            }
          } catch {
          }
        }
      } catch {
      }
    }

    try {
      setIsSyncing(true);
      const adminWallet = address ? address.toLowerCase() : "";

      const res = await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminWallet ? { "x-admin-wallet": adminWallet } : {}),
        },
        body: JSON.stringify({
          contract_market_id: contractMarketId,
          title,
          category,
          deadline: new Date(Number(deadline) * 1000).toISOString(),
          description: resolutionCriteria,
          resolution_source: resolutionSourceUrl,
          initial_liquidity: parseFloat(initialLiquidity) || 0,
          creator_wallet: address,
          tx_hash: hash,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync market with database");
      }
    } catch {
      setSyncError("Failed to sync market with database");
    } finally {
      setIsSyncing(false);
    }

    return { hash, contractMarketId };
  };

  return {
    createMarket,
    txHash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    isSyncing,
    error: writeError || (syncError ? new Error(syncError) : null),
  };
}

export default useAdminCreateMarket;
