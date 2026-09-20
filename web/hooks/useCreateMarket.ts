import { useState } from "react";
import { useConnection, useWriteContract, usePublicClient } from "wagmi";
import { Address, Hash, parseUnits, decodeEventLog } from "viem";
import { getOmenFactoryAddress, OMEN_FACTORY_ABI } from "@/lib/contracts";
import type { CreateMarketParams, UseCreateMarketResult } from "@/types";

export type { CreateMarketParams, UseCreateMarketResult };

export function useCreateMarket(): UseCreateMarketResult {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { mutateAsync } = useWriteContract();

  const [isPending, setIsPending] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [marketAddress, setMarketAddress] = useState<Address | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = () => {
    setIsPending(false);
    setIsDeploying(false);
    setIsSuccess(false);
    setMarketAddress(null);
    setTxHash(null);
    setError(null);
  };

  const createMarket = async (params: CreateMarketParams) => {
    setIsPending(true);
    setIsDeploying(true);
    setError(null);

    try {
      const creatorAddress = (params.creator || address) as Address | undefined;
      if (!creatorAddress) {
        throw new Error("Creator wallet address is required to create a market.");
      }
      const oracleFeedAddress = (params.oracleFeed || "0x694AA1769357215DE4FAC081bf1f309aDC325306") as Address;
      const targetPriceBigInt = typeof params.targetPrice === "bigint"
        ? params.targetPrice
        : parseUnits((params.targetPrice ?? 0).toString(), 8);
      const closeTimeBigInt = typeof params.closeTime === "bigint"
        ? params.closeTime
        : BigInt(params.closeTime ?? 0);

      const factoryAddress = getOmenFactoryAddress();
      if (!mutateAsync) {
        throw new Error("Wallet not connected or contract write unavailable.");
      }

      const tx = await mutateAsync({
        address: factoryAddress,
        abi: OMEN_FACTORY_ABI,
        functionName: "createMarket",
        args: [
          params.statement,
          oracleFeedAddress,
          targetPriceBigInt,
          params.resolutionType,
          closeTimeBigInt,
          creatorAddress,
        ],
      });

      if (!tx || typeof tx !== "string") {
        throw new Error("Transaction execution failed to return a valid transaction hash.");
      }

      const validTx = tx as Hash;
      let deployedAddress: Address | null = null;
      if (publicClient) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: validTx });
          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: OMEN_FACTORY_ABI,
                data: log.data,
                topics: log.topics,
              });
              if (decoded.eventName === "MarketCreated" && decoded.args) {
                const args = decoded.args as { marketAddress?: Address };
                if (args.marketAddress) {
                  deployedAddress = args.marketAddress;
                  break;
                }
              }
            } catch {
              if (log.topics && log.topics.length >= 3) {
                const potential = ("0x" + log.topics[2]?.slice(26)) as Address;
                if (potential.length === 42) {
                  deployedAddress = potential;
                }
              }
            }
          }
        } catch {
        }
      }

      setMarketAddress(deployedAddress);
      setTxHash(validTx);
      setIsSuccess(true);
      setIsPending(false);
      setIsDeploying(false);

      if (params.beliefId && deployedAddress) {
        try {
          await fetch("/api/beliefs/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              beliefId: params.beliefId,
              marketAddress: deployedAddress,
              txHash: validTx,
            }),
          });
        } catch {
        }
      }

      return { marketAddress: deployedAddress, txHash: validTx };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setIsPending(false);
      setIsDeploying(false);
      throw errorObj;
    }
  };

  return {
    createMarket,
    isPending,
    isDeploying,
    isSuccess,
    marketAddress,
    txHash,
    error,
    reset,
  };
}

export default useCreateMarket;
