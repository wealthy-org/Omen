import { useState, useContext } from "react";
import {
  WagmiContext,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { decodeEventLog } from "viem";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";

export interface CreateMarketParams {
  title: string;
  category: string;
  endTime: string;
  resolutionSourceUrl?: string;
  resolutionCriteria: string;
  initialLiquidity?: string;
}

export interface CreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<{ hash: string; contractMarketId: string }>;
  txHash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isSyncing: boolean;
  error: Error | null;
}

export function useAdminCreateMarket(): CreateMarketResult {
  const context = useContext(WagmiContext);
  if (!context) {
    return {
      createMarket: async () => ({ hash: "", contractMarketId: "0" }),
      txHash: undefined,
      isPending: false,
      isConfirming: false,
      isConfirmed: false,
      isSyncing: false,
      error: null,
    };
  }

  return useAdminCreateMarketInner();
}

function useAdminCreateMarketInner(): CreateMarketResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const {
    writeContractAsync,
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
    title,
    category,
    endTime,
    resolutionSourceUrl = "",
    resolutionCriteria,
    initialLiquidity = "0.50",
  }: CreateMarketParams): Promise<{ hash: string; contractMarketId: string }> => {
    setSyncError(null);
    const deadline = BigInt(Math.floor(new Date(endTime).getTime() / 1000));

    const hash = await writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createMarket",
      args: [title, deadline],
    });

    let contractMarketId = String(Date.now());

    if (publicClient) {
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
      await fetch("/api/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
