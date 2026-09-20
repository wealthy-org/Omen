import { useState } from "react";
import { useConnection, useSignTypedData, useChainId } from "wagmi";
import { Address } from "viem";
import { getOmenFactoryAddress } from "@/lib/contracts";
import type { ConfirmBeliefPayload, UseCreatorConfirmResult } from "@/types";

export type { ConfirmBeliefPayload, UseCreatorConfirmResult };

export function useCreatorConfirm(): UseCreatorConfirmResult {
  const { address } = useConnection();
  const chainId = useChainId();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();

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
      if (!address || !signTypedDataAsync) {
        throw new Error("Wallet not connected or signTypedData unavailable.");
      }

      if (!chainId) {
        throw new Error("Connected network / chain ID is required to confirm belief.");
      }

      const creatorAddress = address as Address;
      const timestampSec = Math.floor(Date.now() / 1000);
      const timestamp = BigInt(timestampSec);

      const verifyingContract = (payload.marketAddress || getOmenFactoryAddress(chainId)) as Address;

      const domain = {
        name: "Omen Belief Protocol",
        version: "1",
        chainId,
        verifyingContract,
      } as const;

      const types = {
        ConfirmBelief: [
          { name: "beliefId", type: "string" },
          { name: "creator", type: "address" },
          { name: "statement", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      } as const;

      const signedSig = await signTypedDataAsync({
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

      setIsSigning(false);
      setIsConfirming(true);

      try {
        const res = await fetch(`/api/beliefs/${payload.beliefId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creator_address: creatorAddress,
            signature: signedSig,
            timestamp: timestampSec,
            chain_id: chainId,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to confirm belief");
        }
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
