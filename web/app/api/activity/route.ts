import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const marketId = searchParams.get("market_id")?.trim();
    const eventType = searchParams.get("event_type")?.trim();

    const supabase = getSupabaseClient();
    let query = supabase
      .from("market_events")
      .select("*, markets (id, contract_address, chain_id, status, belief_id, beliefs (id, statement, author))", { count: "exact" });

    if (marketId) {
      query = query.eq("market_id", marketId);
    }

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    query = query.order("created_at", { ascending: false });

    const { data: events, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const formattedEvents = (events || []).map((event: any) => {
      const market = event.markets;
      const belief = market?.beliefs;
      return {
        id: event.id,
        market_id: event.market_id,
        event_type: event.event_type,
        wallet_address: event.wallet_address,
        amount: event.amount,
        tx_hash: event.tx_hash,
        block_number: event.block_number,
        created_at: event.created_at,
        market_contract_address: market?.contract_address || null,
        market_chain_id: market?.chain_id || null,
        market_status: market?.status || null,
        belief_id: belief?.id || market?.belief_id || null,
        statement: belief?.statement || null,
        belief_author: belief?.author || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      activities: formattedEvents,
      total: count ?? formattedEvents.length,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
