import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "@/lib/contracts";

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
    writeContractAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const claimPayout = async (marketId: string | number): Promise<string> => {
    const numericMarketId = BigInt(marketId);

    const hash = await writeContractAsync({
      address: PREDICTION_MARKET_ADDRESS,
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
