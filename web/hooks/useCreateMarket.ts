import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Address, parseUnits } from "viem";
import { OMEN_FACTORY_ADDRESS, OMEN_FACTORY_ABI, USE_MOCK_CONTRACT } from "@/lib/contracts";

export interface CreateMarketParams {
  statement: string;
  oracleFeed?: Address;
  targetPrice: number | bigint;
  resolutionType: number;
  closeTime: number | bigint;
  creator?: Address;
  beliefId?: string;
}

export interface UseCreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<{ marketAddress: Address; txHash: string }>;
  isPending: boolean;
  isDeploying: boolean;
  isSuccess: boolean;
  marketAddress: Address | null;
  txHash: string | null;
  error: Error | null;
  reset: () => void;
}

export function useCreateMarket(): UseCreateMarketResult {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

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
      const creatorAddress = params.creator || address || ("0x1111111111111111111111111111111111111111" as Address);
      const oracleFeedAddress = params.oracleFeed || ("0x694AA1769357215DE4FAC081bf1f309aDC325306" as Address);
      const targetPriceBigInt = typeof params.targetPrice === "bigint"
        ? params.targetPrice
        : parseUnits(params.targetPrice.toString(), 8);
      const closeTimeBigInt = typeof params.closeTime === "bigint"
        ? params.closeTime
        : BigInt(params.closeTime);

      if (USE_MOCK_CONTRACT) {
        const mockAddress = `0xMarket${Math.random().toString(16).substring(2, 10)}${"0".repeat(24)}` as Address;
        const mockHash = `0xHash${Math.random().toString(16).substring(2, 10)}${"0".repeat(24)}`;

        setMarketAddress(mockAddress);
        setTxHash(mockHash);
        setIsSuccess(true);
        setIsPending(false);
        setIsDeploying(false);

        if (params.beliefId) {
          try {
            await fetch("/api/beliefs/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                beliefId: params.beliefId,
                marketAddress: mockAddress,
                txHash: mockHash,
              }),
            });
          } catch {
          }
        }

        return { marketAddress: mockAddress, txHash: mockHash };
      }

      const tx = await writeContractAsync({
        address: OMEN_FACTORY_ADDRESS,
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

      const deployedAddress = `0xMarket${tx.slice(2, 10)}${"0".repeat(24)}` as Address;
      setMarketAddress(deployedAddress);
      setTxHash(tx);
      setIsSuccess(true);
      setIsPending(false);
      setIsDeploying(false);

      if (params.beliefId) {
        try {
          await fetch("/api/beliefs/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              beliefId: params.beliefId,
              marketAddress: deployedAddress,
              txHash: tx,
            }),
          });
        } catch {
        }
      }

      return { marketAddress: deployedAddress, txHash: tx };
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
