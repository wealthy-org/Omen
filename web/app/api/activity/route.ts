import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const marketId = searchParams.get("market_id")?.trim();
    const eventType = searchParams.get("event_type")?.trim();

    const db = getDb();
    const { market_events } = schema;
    const where = and(
      marketId ? eq(market_events.market_id, marketId) : undefined,
      eventType ? eq(market_events.event_type, eventType) : undefined
    );

    const [events, count] = await Promise.all([
      db.query.market_events.findMany({
        where,
        orderBy: desc(market_events.created_at),
        limit,
        offset,
        with: {
          markets: {
            columns: { id: true, title: true, contract_address: true, chain_id: true, status: true, belief_id: true },
            with: { beliefs: { columns: { id: true, statement: true, author: true } } },
          },
        },
      }),
      db.$count(market_events, where),
    ]);

    const txHashes = events.map((e) => e.tx_hash);
    const positions = txHashes.length
      ? await db.query.market_positions.findMany({
          columns: { tx_hash: true, side: true },
          where: inArray(schema.market_positions.tx_hash, txHashes),
        })
      : [];
    const sideByTx = new Map(positions.map((p) => [p.tx_hash, p.side]));
    const teamWallets = new Set(
      (process.env.ADMIN_WALLET_ADDRESS ?? "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean)
    );

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
        statement: belief?.statement || market?.title || null,
        belief_author: belief?.author || null,
        side: sideByTx.get(event.tx_hash) ?? null,
        actor_label: teamWallets.has(String(event.wallet_address ?? "").toLowerCase()) ? "Omen team" : null,
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
