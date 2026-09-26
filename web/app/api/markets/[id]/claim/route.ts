import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { marketIdentifierFilter } from "@/lib/db/filters";
import { isValidEvmAddress } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Market ID is required" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be an object" },
        { status: 400 }
      );
    }

    const { wallet_address, tx_hash } = body;

    if (!isValidEvmAddress(wallet_address)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.trim().toLowerCase();
    const db = getDb();
    const { market_events, market_positions } = schema;

    const market = await db.query.markets.findFirst({ where: marketIdentifierFilter(id) });

    if (!market) {
      return NextResponse.json(
        { success: false, error: `Market with identifier ${id} not found` },
        { status: 404 }
      );
    }

    const updatedPositions = await db
      .update(market_positions)
      .set({ claimed: true })
      .where(and(eq(market_positions.market_id, market.id), eq(market_positions.wallet_address, normalizedAddress)))
      .returning();

    if (typeof tx_hash === "string" && tx_hash.length > 0) {
      await db
        .insert(market_events)
        .values({
          market_id: market.id,
          event_type: "MarketClaimed",
          wallet_address: normalizedAddress,
          tx_hash,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json({
      success: true,
      claimed: true,
      market_id: market.id,
      wallet_address: normalizedAddress,
      updated_positions_count: updatedPositions.length,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
