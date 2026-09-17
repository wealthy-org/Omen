import { useState } from "react";
import { useAccount, useSignTypedData, useChainId } from "wagmi";
import { Address } from "viem";
import { OMEN_FACTORY_ADDRESS } from "@/lib/contracts";
import { USE_MOCK_CONTRACT } from "@/lib/mock-contracts";

export interface ConfirmBeliefPayload {
  beliefId: string;
  statement: string;
  marketAddress?: Address;
}

export interface UseCreatorConfirmResult {
  confirmBelief: (payload: ConfirmBeliefPayload) => Promise<{ signature: string }>;
  isSigning: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  signature: string | null;
  error: Error | null;
  reset: () => void;
}

export function useCreatorConfirm(): UseCreatorConfirmResult {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();

  const [isSigning, setIsSigning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = () => {
    setIsSigning(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setSignature(null);
    setError(null);
  };

  const confirmBelief = async (payload: ConfirmBeliefPayload) => {
    setIsSigning(true);
    setError(null);

    try {
      const creatorAddress = (address || "0x1111111111111111111111111111111111111111") as Address;
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      let signedSig = "";

      if (USE_MOCK_CONTRACT || !signTypedDataAsync) {
        signedSig = `0xMockSignatureEIP712${Math.random().toString(16).substring(2, 10)}${"0".repeat(40)}`;
      } else {
        const domain = {
          name: "Omen Belief Protocol",
          version: "1",
          chainId: chainId || 11155111,
          verifyingContract: payload.marketAddress || OMEN_FACTORY_ADDRESS,
        } as const;

        const types = {
          ConfirmBelief: [
            { name: "beliefId", type: "string" },
            { name: "creator", type: "address" },
            { name: "statement", type: "string" },
            { name: "timestamp", type: "uint256" },
          ],
        } as const;

        signedSig = await signTypedDataAsync({
          domain,
          types,
          primaryType: "ConfirmBelief",
          message: {
            beliefId: payload.beliefId,
            creator: creatorAddress,
            statement: payload.statement,
            timestamp,
          },
        });
      }

      setIsSigning(false);
      setIsConfirming(true);

      try {
        await fetch(`/api/beliefs/${payload.beliefId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            beliefId: payload.beliefId,
            creator: creatorAddress,
            signature: signedSig,
          }),
        });
      } catch {
      }

      setSignature(signedSig);
      setIsSuccess(true);
      setIsConfirming(false);
      return { signature: signedSig };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setIsSigning(false);
      setIsConfirming(false);
      throw errorObj;
    }
  };

  return {
    confirmBelief,
    isSigning,
    isConfirming,
    isSuccess,
    signature,
    error,
    reset,
  };
}

export default useCreatorConfirm;
