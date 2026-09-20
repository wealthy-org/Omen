import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { normalizeOutcome } from "@/lib/market/resolution-helper";
import { updateCreatorProfile, insertResolutionRecord, insertSettlementRecord } from "@/lib/market/resolution-service";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import type { DbMarketStatus, Market } from "@/types/database";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Missing market id" }, { status: 400 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Request body must be an object" }, { status: 400 });
    }

    const rawOutcome = typeof body.outcome === "string" ? body.outcome : (typeof body.status === "string" ? body.status : "");
    const outcome = normalizeOutcome(rawOutcome);

    if (!outcome) {
      return NextResponse.json(
        { success: false, error: "Invalid status or outcome: must be one of 'AGREE', 'DISAGREE', 'VOID', 'cancelled'" },
        { status: 400 }
      );
    }

    const { oracle_source, start_price, end_price, resolution_tx_hash, resolution_source } = body;
    const supabase = getSupabaseAdminClient();

    let query = supabase.from("markets").select("*");
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      query = query.eq("id", id);
    } else if (!isNaN(Number(id))) {
      query = query.eq("contract_market_id", Number(id));
    } else {
      query = query.eq("id", id);
    }

    const { data: market, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ success: false, error: "Market not found" }, { status: 404 });
    }

    const activeStatuses = ["OPEN", "active"];
    if (!activeStatuses.includes(market.status)) {
      return NextResponse.json(
        { success: false, error: `Market is already ${market.status} and cannot be resolved again` },
        { status: 400 }
      );
    }

    const marketStatus: DbMarketStatus = body.status && ["cancelled"].includes(body.status)
      ? "cancelled"
      : "RESOLVED";

    const updatePayload: Partial<Market> = {
      status: marketStatus,
      winner: outcome,
    };

    const effectiveSource = typeof oracle_source === "string" && oracle_source.trim().length > 0
      ? oracle_source.trim()
      : (typeof resolution_source === "string" && resolution_source.trim().length > 0 ? resolution_source.trim() : null);

    if (effectiveSource) {
      updatePayload.resolution_source = effectiveSource;
    }

    const { data: updatedMarket, error: updateError } = await supabase
      .from("markets")
      .update(updatePayload)
      .eq("id", market.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    if (market.belief_id) {
      await updateCreatorProfile(supabase, market.belief_id, outcome);
    }

    const resolution = await insertResolutionRecord(supabase, {
      marketId: market.id,
      oracleSource: effectiveSource || "manual_admin",
      startPrice: start_price,
      endPrice: end_price,
      resolvedOutcome: outcome,
      resolutionTxHash: resolution_tx_hash,
    });

    const agreePool = Number(updatedMarket.agree_pool ?? 0);
    const disagreePool = Number(updatedMarket.disagree_pool ?? 0);

    const { settlementData, settlement } = await insertSettlementRecord(supabase, {
      marketId: market.id,
      agreePool,
      disagreePool,
      outcome,
    });

    return NextResponse.json({
      success: true,
      market: {
        id: updatedMarket.id,
        contract_market_id: updatedMarket.contract_market_id,
        title: updatedMarket.title,
        description: updatedMarket.description,
        category: updatedMarket.category,
        deadline: updatedMarket.deadline,
        status: updatedMarket.status,
        winner: updatedMarket.winner,
        agree_pool: agreePool,
        disagree_pool: disagreePool,
        total_pool: settlement.totalPool,
        resolution_source: updatedMarket.resolution_source,
        created_at: updatedMarket.created_at,
      },
      resolution: resolution || null,
      settlement: settlementData || null,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
