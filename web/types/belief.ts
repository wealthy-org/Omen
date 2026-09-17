import { z } from "zod";

export const ExtractBeliefRequestSchema = z.object({
  raw_text: z.string().trim().min(1, "raw_text cannot be empty"),
  source_url: z.string().url().optional().or(z.literal("")),
  author_handle: z.string().trim().optional().or(z.literal("")),
});

export type ExtractBeliefRequest = z.infer<typeof ExtractBeliefRequestSchema>;

export const StructuredBeliefSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  comparison_asset: z.string().trim().nullable().optional(),
  direction: z.enum(["OUTPERFORM", "ABOVE_PRICE", "BELOW_PRICE"]),
  target_value: z.number().nullable().optional(),
  timeframe_days: z.number().positive().default(30),
  statement_summary: z.string().trim().min(1, "Statement summary is required"),
  oracle_recommendation: z.enum(["chainlink", "robinhood_market_data"]).default("chainlink"),
  confidence_score: z.number().min(0).max(1).default(0.8),
});

export type StructuredBelief = z.infer<typeof StructuredBeliefSchema>;

export type ExtractBeliefResponse = {
  success: boolean;
  data?: StructuredBelief;
  error?: string;
};
