import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getOmenFactoryAddress, OMEN_FACTORY_ADDRESS, PREDICTION_MARKET_ABI, OMEN_MARKET_ABI } from "@/lib/contracts";
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

  const claimPayout = async (marketIdOrAddress: string | number, chainId?: number): Promise<string> => {
    const isAddress = typeof marketIdOrAddress === "string" && marketIdOrAddress.startsWith("0x") && marketIdOrAddress.length === 42 && marketIdOrAddress !== OMEN_FACTORY_ADDRESS;

    let hash: string;

    if (isAddress) {
      hash = await mutateAsync({
        address: marketIdOrAddress as Address,
        abi: OMEN_MARKET_ABI,
        functionName: "claimPayout",
      });
    } else {
      const numericMarketId = BigInt(String(marketIdOrAddress).replace(/\D/g, "") || "1");
      const targetAddress = getOmenFactoryAddress(chainId) || OMEN_FACTORY_ADDRESS;
      hash = await mutateAsync({
        address: targetAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: "claim",
        args: [numericMarketId],
      });
    }

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
