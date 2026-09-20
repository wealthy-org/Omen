import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { OMEN_MARKET_ABI } from "@/lib/contracts";
import type { ClaimPayoutResult } from "@/types";
import { Address } from "viem";

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

  const claimPayout = async (marketIdOrAddress: string | number): Promise<string> => {
    if (!mutateAsync) {
      throw new Error("Wallet not connected or contract write unavailable.");
    }

    const targetAddress = (typeof marketIdOrAddress === "string" && marketIdOrAddress.startsWith("0x") ? marketIdOrAddress : undefined) as Address | undefined;

    if (!targetAddress || !targetAddress.startsWith("0x") || targetAddress.length !== 42) {
      throw new Error("Valid market contract address is required to claim payout");
    }

    const hash = await mutateAsync({
      address: targetAddress,
      abi: OMEN_MARKET_ABI as any,
      functionName: "claimPayout",
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
