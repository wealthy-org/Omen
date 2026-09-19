import { verifyTypedData, Address, Hex } from "viem";

export const EIP712_BELIEF_CONFIRMATION_TYPES = {
  BeliefConfirmation: [
    { name: "beliefId", type: "string" },
    { name: "statement", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

import type { VerifyConfirmationParams } from "@/types";

export type { VerifyConfirmationParams };

export async function verifyBeliefConfirmationSignature(
  params: VerifyConfirmationParams
): Promise<boolean> {
  try {
    const isValid = await verifyTypedData({
      address: params.creatorAddress as Address,
      domain: {
        name: "OMEN",
        version: "1",
        chainId: params.chainId,
      },
      types: EIP712_BELIEF_CONFIRMATION_TYPES,
      primaryType: "BeliefConfirmation",
      message: {
        beliefId: params.beliefId,
        statement: params.statement,
        timestamp: BigInt(params.timestamp ?? 0),
      },
      signature: params.signature as Hex,
    });
    return isValid;
  } catch {
    return false;
  }
}
