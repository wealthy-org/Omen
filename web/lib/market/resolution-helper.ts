import { ResolvedOutcome } from "@/types/database";

export function normalizeOutcome(outcomeOrStatus: string): ResolvedOutcome | null {
  if (!outcomeOrStatus || typeof outcomeOrStatus !== "string") return null;
  const normalized = outcomeOrStatus.trim().toUpperCase();

  if (normalized === "AGREE" || normalized === "RESOLVED_YES" || normalized === "AGREE_WON" || normalized === "YES") {
    return "AGREE";
  }

  if (normalized === "DISAGREE" || normalized === "RESOLVED_NO" || normalized === "DISAGREE_WON" || normalized === "NO") {
    return "DISAGREE";
  }

  if (normalized === "VOID" || normalized === "CANCELLED" || normalized === "CANCEL") {
    return "VOID";
  }

  return null;
}

export function calculateSettlementPool(
  agreePool: number,
  disagreePool: number,
  outcome: ResolvedOutcome,
  protocolFeeBps = 200
): {
  totalPool: number;
  distributablePool: number;
  protocolFee: number;
} {
  const safeAgree = Math.max(0, Number(agreePool) || 0);
  const safeDisagree = Math.max(0, Number(disagreePool) || 0);
  const totalPool = Number((safeAgree + safeDisagree).toFixed(6));

  if (outcome === "VOID") {
    return {
      totalPool,
      distributablePool: totalPool,
      protocolFee: 0,
    };
  }

  const protocolFee = Number(((totalPool * protocolFeeBps) / 10000).toFixed(6));
  const distributablePool = Number((totalPool - protocolFee).toFixed(6));

  return {
    totalPool,
    distributablePool,
    protocolFee,
  };
}

export function evaluateOracleCondition(
  resolutionType: "PRICE_ABOVE" | "PRICE_BELOW" | "RELATIVE_PERFORMANCE",
  targetPrice: number,
  startPrice?: number,
  endPrice?: number
): ResolvedOutcome {
  if (endPrice === undefined || endPrice === null) {
    return "VOID";
  }

  if (resolutionType === "PRICE_ABOVE") {
    return endPrice >= targetPrice ? "AGREE" : "DISAGREE";
  }

  if (resolutionType === "PRICE_BELOW") {
    return endPrice <= targetPrice ? "AGREE" : "DISAGREE";
  }

  if (resolutionType === "RELATIVE_PERFORMANCE" && startPrice !== undefined && startPrice !== null && startPrice > 0) {
    const returnPct = ((endPrice - startPrice) / startPrice) * 100;
    return returnPct >= targetPrice ? "AGREE" : "DISAGREE";
  }

  return "VOID";
}
