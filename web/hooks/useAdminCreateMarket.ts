import { useState } from "react";
import { decodeEventLog, keccak256, toHex, Address } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  usePublicClient,
  useChainId,
} from "wagmi";
import { OMEN_FACTORY_ABI, getOmenFactoryAddress } from "@/lib/contracts";
import { CHAINLINK_BTC_USD_FEED, CHAINLINK_ETH_USD_FEED, ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";
import type { CreateMarketParams, CreateMarketResult } from "@/types";

export type { CreateMarketParams, CreateMarketResult };

export function useAdminCreateMarket(): CreateMarketResult {
  const { address } = useConnection();
  const chainId = useChainId();
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
    endTime = new Date(Date.now() + 86400000).toISOString(),
    resolutionSourceUrl = "",
    resolutionCriteria = "",
    initialLiquidity = "0.50",
    beliefId,
    resolutionType,
    assetSymbol,
    targetPrice,
  }: CreateMarketParams): Promise<{ hash: string; contractMarketId: string; contractAddress?: string }> => {
    setSyncError(null);

    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }

    const openTime = BigInt(Math.floor(Date.now() / 1000));
    const closeTime = BigInt(Math.floor(new Date(endTime).getTime() / 1000));

    const beliefHash = keccak256(toHex(title.trim() || "OMEN_BELIEF"));
    const sourceHash = keccak256(toHex(resolutionSourceUrl.trim() || "OMEN_SOURCE"));
    const resolutionHash = keccak256(toHex(resolutionCriteria.trim() || JSON.stringify({ category })));

    const priceFeed = assetSymbol?.toUpperCase() === "BTC" ? CHAINLINK_BTC_USD_FEED : CHAINLINK_ETH_USD_FEED;
    const resolutionConfig = {
      resType: resolutionType === 1 ? 1 : 0,
      assetAFeed: priceFeed,
      assetBFeed: priceFeed,
      targetPrice: BigInt(Math.round(Number(targetPrice ?? 0))),
      startTimestamp: openTime,
      endTimestamp: closeTime,
    };

    const targetAddress = getOmenFactoryAddress(chainId);

    const hash = await mutateAsync({
      address: targetAddress,
      abi: OMEN_FACTORY_ABI as any,
      functionName: "createMarket",
      args: [beliefHash, sourceHash, resolutionHash, openTime, closeTime, resolutionConfig],
    });

    let contractMarketId = String(Math.floor(Date.now() / 1000));
    let deployedMarketAddress: string | undefined;

    if (publicClient && hash) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: OMEN_FACTORY_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "MarketCreated" && decoded.args) {
              const argsObj = decoded.args as { marketId?: bigint; marketAddress?: Address };
              if (argsObj.marketId !== undefined) {
                contractMarketId = argsObj.marketId.toString();
              }
              if (argsObj.marketAddress) {
                deployedMarketAddress = argsObj.marketAddress;
              }
              break;
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
          contract_market_id: parseInt(contractMarketId, 10) || Math.floor(Date.now() / 1000),
          contract_address: deployedMarketAddress,
          chain_id: chainId || ETHEREUM_SEPOLIA_CHAIN_ID,
          belief_id: beliefId,
          title,
          category,
          deadline: new Date(Number(closeTime) * 1000).toISOString(),
          description: resolutionCriteria,
          resolution_source: resolutionSourceUrl,
          initial_liquidity: parseFloat(initialLiquidity) || 0,
          creator_wallet: address,
          tx_hash: hash,
          open_time: new Date(Number(openTime) * 1000).toISOString(),
          resolution_type: assetSymbol ? (resolutionType === 1 ? "PRICE_BELOW" : "PRICE_ABOVE") : undefined,
          resolution_config: assetSymbol ? { asset: assetSymbol.toUpperCase(), targetPrice: Number(targetPrice ?? 0) } : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sync market with database");
      }
    } catch {
      setSyncError("Failed to sync market with database");
      throw new Error("Market deployed on-chain but failed to sync with database");
    } finally {
      setIsSyncing(false);
    }

    return { hash, contractMarketId, contractAddress: deployedMarketAddress };
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
