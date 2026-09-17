import { verifyTypedData, Address, Hex } from "viem";

export const EIP712_BELIEF_CONFIRMATION_TYPES = {
  BeliefConfirmation: [
    { name: "beliefId", type: "string" },
    { name: "statement", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

export interface VerifyConfirmationParams {
  beliefId: string;
  statement: string;
  timestamp: number | bigint;
  chainId: number;
  creatorAddress: string;
  signature: string;
}

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
        timestamp: BigInt(params.timestamp),
      },
      signature: params.signature as Hex,
    });
    return isValid;
  } catch {
    return false;
  }
}
