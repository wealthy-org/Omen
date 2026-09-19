import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getPredictionMarketAddress, PREDICTION_MARKET_ABI } from "@/lib/contracts";
import type { ClaimPayoutResult } from "@/types";

export type { ClaimPayoutResult };

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
