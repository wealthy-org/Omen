import type { MarketResolutionType } from "@/types/database";

export type BeliefResolution = {
  asset: string;
  targetPrice: number;
  resolutionType: Extract<MarketResolutionType, "PRICE_ABOVE" | "PRICE_BELOW">;
  deadline: Date;
};

const STATEMENT_PATTERN =
  /\b(BTC|ETH|SOL|LINK|BNB|XRP|DOGE|HYPE|ZEC)\b.*?\b(above|below)\b.*?\$([\d,]+(?:\.\d+)?)\s*(k|m)?.*?\bbefore\s+([A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4})/i;

export function parseBeliefResolution(statement: string): BeliefResolution | null {
  const match = statement.match(STATEMENT_PATTERN);
  if (!match) return null;

  const multiplier = match[4]?.toLowerCase() === "k" ? 1_000 : match[4]?.toLowerCase() === "m" ? 1_000_000 : 1;
  const targetPrice = Number(match[3].replace(/,/g, "")) * multiplier;
  const deadline = new Date(`${match[5]} 23:59:59 UTC`);
  if (!targetPrice || isNaN(deadline.getTime())) return null;

  return {
    asset: match[1].toUpperCase(),
    targetPrice,
    resolutionType: match[2].toLowerCase() === "below" ? "PRICE_BELOW" : "PRICE_ABOVE",
    deadline,
  };
}
