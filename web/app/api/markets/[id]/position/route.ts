import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { marketIdentifierFilter } from "@/lib/db/filters";
import { isValidEvmAddress } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { wallet_address, side, amount, tx_hash, block_number } = body;

    if (!isValidEvmAddress(wallet_address)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    if (side !== "AGREE" && side !== "DISAGREE") {
      return NextResponse.json(
        { success: false, error: "Side must be either AGREE or DISAGREE" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!tx_hash || typeof tx_hash !== "string") {
      return NextResponse.json(
        { success: false, error: "tx_hash is required and must be a string" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { market_events, market_positions, markets } = schema;

    const market = await db.query.markets.findFirst({ where: marketIdentifierFilter(id) });

    if (!market) {
      return NextResponse.json(
        { success: false, error: `Market with identifier ${id} not found` },
        { status: 404 }
      );
    }

    const existingPosition = await db.query.market_positions.findFirst({
      columns: { id: true },
      where: eq(market_positions.tx_hash, tx_hash),
    });

    if (existingPosition) {
      return NextResponse.json(
        { success: false, error: `Position with tx_hash ${tx_hash} already indexed` },
        { status: 409 }
      );
    }

    const normalizedWallet = wallet_address.trim().toLowerCase();

    const [insertedPosition] = await db
      .insert(market_positions)
      .values({
        market_id: market.id,
        wallet_address: normalizedWallet,
        side,
        amount: parsedAmount,
        tx_hash,
        claimed: false,
      })
      .returning();

    await db
      .insert(market_events)
      .values({
        market_id: market.id,
        event_type: "PositionTaken",
        wallet_address: normalizedWallet,
        amount: parsedAmount,
        tx_hash,
        block_number: block_number ? Number(block_number) : null,
      })
      .onConflictDoNothing();

    const poolIncrement = side === "AGREE"
      ? { agree_pool: sql`${markets.agree_pool} + ${parsedAmount}` }
      : { disagree_pool: sql`${markets.disagree_pool} + ${parsedAmount}` };

    await db.update(markets).set(poolIncrement).where(eq(markets.id, market.id));

    return NextResponse.json(
      {
        success: true,
        position: insertedPosition,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
