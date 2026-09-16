import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: marketId } = await context.params;
    const body = await req.json();
    const { status, resolution_source } = body;

    if (!status || !["resolved_yes", "resolved_no", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid resolution status" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    let query = supabase.from("markets").select("*");
    if (/^[0-9a-fA-F-]{36}$/.test(marketId)) {
      query = query.eq("id", marketId);
    } else {
      query = query.eq("contract_market_id", Number(marketId));
    }

    const { data: market, error: findError } = await query.maybeSingle();
    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.status !== "active") {
      return NextResponse.json({ error: "Market is already resolved or cancelled" }, { status: 400 });
    }

    const { data: updatedMarket, error: updateError } = await supabase
      .from("markets")
      .update({
        status,
        resolution_source: resolution_source || null,
      })
      .eq("id", market.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, market: updatedMarket });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
