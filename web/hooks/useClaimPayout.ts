import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getPredictionMarketAddress, PREDICTION_MARKET_ABI } from "@/lib/contracts";

export interface ClaimPayoutResult {
  claimPayout: (marketId: string | number) => Promise<string>;
  txHash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

export function useClaimPayout(): ClaimPayoutResult {
  const {
    mutateAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimPayout = async (marketId: string | number): Promise<string> => {
    const numericMarketId = BigInt(marketId);

    const hash = await mutateAsync({
      address: getPredictionMarketAddress(),
      abi: PREDICTION_MARKET_ABI,
      functionName: "claim",
      args: [numericMarketId],
    });

    return hash;
  };

  return {
    claimPayout,
    txHash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError,
  };
}

export default useClaimPayout;
