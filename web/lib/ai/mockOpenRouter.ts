import { StructuredBelief } from "../../types/belief";

export function isMockAiEnabled(): boolean {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.startsWith("dummy") || apiKey.startsWith("mock")) {
    return true;
  }
  return false;
}

export const USE_MOCK_AI = isMockAiEnabled();

export function extractMockBelief(rawText: string): StructuredBelief {
  const upper = rawText.toUpperCase();
  let subject = "ETH";
  if (upper.includes("SOL") || upper.includes("SOLANA")) subject = "SOL";
  else if (upper.includes("BTC") || upper.includes("BITCOIN")) subject = "BTC";
  else if (upper.includes("NVDA") || upper.includes("NVIDIA")) subject = "NVDA";

  let comparisonAsset: string | null = null;
  let direction: "OUTPERFORM" | "ABOVE_PRICE" | "BELOW_PRICE" = "ABOVE_PRICE";

  if (upper.includes("OUTPERFORM") || upper.includes("BEAT") || upper.includes("VS")) {
    direction = "OUTPERFORM";
    comparisonAsset = subject === "SOL" ? "ETH" : "BTC";
  } else if (upper.includes("BELOW") || upper.includes("DROP") || upper.includes("CRASH") || upper.includes("UNDER")) {
    direction = "BELOW_PRICE";
  } else {
    direction = "ABOVE_PRICE";
  }

  const priceMatch = rawText.match(/\$?(\d+[\d,]*\.?\d*)\s*(?:k|thousand)?/i);
  let targetValue: number | null = null;
  if (priceMatch && direction !== "OUTPERFORM") {
    const numStr = priceMatch[1].replace(/,/g, "");
    let num = parseFloat(numStr);
    if (rawText.toLowerCase().includes(priceMatch[0].toLowerCase() + "k")) {
      num *= 1000;
    }
    targetValue = isNaN(num) ? 4000 : num;
  }

  return {
    subject,
    comparison_asset: comparisonAsset,
    direction,
    target_value: targetValue,
    timeframe_days: 30,
    statement_summary: rawText.slice(0, 120),
    oracle_recommendation: "chainlink",
    confidence_score: 0.9,
  };
}
