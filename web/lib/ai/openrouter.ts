import { StructuredBelief, StructuredBeliefSchema } from "../../types/belief";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3-8b-instruct:free";

const SYSTEM_PROMPT = `You are a financial and crypto market belief structuring AI for the OMEN protocol.
Your task is to analyze user-provided raw opinion/prediction text and extract a precise, measurable prediction structure.

You must respond ONLY with a raw, valid JSON object matching this exact structure:
{
  "subject": "Asset or entity making the prediction about, e.g. SOL, ETH, BTC, NVDA",
  "comparison_asset": "Comparison asset if relative performance (e.g. ETH for SOL vs ETH), or null if absolute price",
  "direction": "OUTPERFORM" (for relative), "ABOVE_PRICE" (for price above target), or "BELOW_PRICE" (for price below target),
  "target_value": numeric price target if applicable or null,
  "timeframe_days": estimated duration in days until resolution (e.g. 30, 60, 90),
  "statement_summary": "Clear, concise 1-sentence summary of the core belief",
  "oracle_recommendation": "chainlink" or "robinhood_market_data",
  "confidence_score": confidence score between 0.0 and 1.0 based on clarity of the assertion
}

Do not include any greeting, preamble, commentary, or markdown fences. Output only valid JSON.`;

export function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function extractBeliefFromText(
  rawText: string,
  author?: string,
  sourceUrl?: string
): Promise<{ success: boolean; data?: StructuredBelief; error?: string; status?: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY || "mock-openrouter-key";
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const userPrompt = `Extract structured belief from:
Text: "${rawText}"
${author ? `Author: "${author}"` : ""}
${sourceUrl ? `Source: "${sourceUrl}"` : ""}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://omen.market",
        "X-Title": "OMEN Protocol",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `AI provider error: ${response.status} ${response.statusText}`,
        status: 502,
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = payload.choices?.[0]?.message?.content;
    if (!rawContent) {
      return {
        success: false,
        error: "AI provider returned empty content",
        status: 502,
      };
    }

    const cleanedJson = cleanJsonOutput(rawContent);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      return {
        success: false,
        error: "Failed to parse AI output as valid JSON",
        status: 422,
      };
    }

    const parseResult = StructuredBeliefSchema.safeParse(parsed);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return {
        success: false,
        error: `Schema validation failed: ${errorMsg}`,
        status: 422,
      };
    }

    return {
      success: true,
      data: parseResult.data,
      status: 200,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: `AI provider error: ${message}`,
      status: 502,
    };
  }
}
