import { SupabaseClient } from "@supabase/supabase-js";
import { ResolvedOutcome } from "@/types/database";
import { isValidEvmAddress } from "../validators";
import { calculateSettlementPool } from "./resolution-helper";

export async function updateCreatorProfile(
  supabase: SupabaseClient<any, any, any>,
  beliefId: string,
  outcome: ResolvedOutcome
): Promise<void> {
  try {
    await supabase
      .from("beliefs")
      .update({ status: "RESOLVED" })
      .eq("id", beliefId);

    const { data: belief } = await supabase
      .from("beliefs")
      .select("*")
      .eq("id", beliefId)
      .maybeSingle();

    if (!belief || !belief.author) {
      return;
    }

    const { data: confirmation } = await supabase
      .from("creator_confirmations")
      .select("*")
      .eq("belief_id", beliefId)
      .maybeSingle();

    const isCorrect = outcome === "AGREE";

    let profile = null;
    const authorStr = belief.author.trim();

    if (isValidEvmAddress(authorStr)) {
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("wallet_address", authorStr.toLowerCase())
        .maybeSingle();
      profile = data;
    } else {
      const cleanHandle = authorStr.replace(/^@/, "");
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .or(`handle.ilike.${cleanHandle},wallet_address.ilike.${authorStr}`)
        .maybeSingle();
      profile = data;
    }

    if (profile) {
      const updatedResolved = (profile.resolved_count || 0) + 1;
      const updatedCorrect = (profile.correct_count || 0) + (isCorrect ? 1 : 0);

      await supabase
        .from("creator_profiles")
        .update({
          resolved_count: updatedResolved,
          correct_count: updatedCorrect,
        })
        .eq("id", profile.id);
    }
  } catch {
    void 0;
  }
}

export async function insertResolutionRecord(
  supabase: SupabaseClient<any, any, any>,
  params: {
    marketId: string;
    oracleSource: string;
    startPrice?: number | null;
    endPrice?: number | null;
    resolvedOutcome: ResolvedOutcome;
    resolutionTxHash?: string | null;
    resolvedAt?: string;
  }
) {
  try {
    const resResult = await supabase
      .from("market_resolutions")
      .insert({
        market_id: params.marketId,
        oracle_source: params.oracleSource,
        start_price: params.startPrice !== undefined && params.startPrice !== null ? Number(params.startPrice) : null,
        end_price: params.endPrice !== undefined && params.endPrice !== null ? Number(params.endPrice) : null,
        resolved_outcome: params.resolvedOutcome,
        resolution_tx_hash: params.resolutionTxHash || null,
        resolved_at: params.resolvedAt || new Date().toISOString(),
      })
      .select()
      .single();
    return resResult.data;
  } catch {
    return null;
  }
}

export async function insertSettlementRecord(
  supabase: SupabaseClient<any, any, any>,
  params: {
    marketId: string;
    agreePool: number;
    disagreePool: number;
    outcome: ResolvedOutcome;
    protocolFeeBps?: number;
  }
) {
  const settlement = calculateSettlementPool(
    params.agreePool,
    params.disagreePool,
    params.outcome,
    params.protocolFeeBps
  );

  try {
    const setRes = await supabase
      .from("market_settlements")
      .insert({
        market_id: params.marketId,
        total_pool: settlement.totalPool,
        distributable_pool: settlement.distributablePool,
        protocol_fee: settlement.protocolFee,
        settled_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { settlementData: setRes.data, settlement };
  } catch {
    return { settlementData: null, settlement };
  }
}
