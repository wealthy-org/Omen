import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isValidEvmAddress, isValidTxHash } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
    }

    const { tx_hash, contract_market_id, wallet_address, side, amount } = body;

    if (!isValidTxHash(tx_hash)) {
      return NextResponse.json(
        { error: "Invalid or missing tx_hash: must be a valid hex transaction hash starting with 0x" },
        { status: 400 }
      );
    }

    const parsedMarketId = Number(contract_market_id);
    if (
      contract_market_id === undefined ||
      contract_market_id === null ||
      !Number.isInteger(parsedMarketId) ||
      parsedMarketId < 0
    ) {
      return NextResponse.json(
        { error: "Invalid or missing contract_market_id: must be a non-negative integer" },
        { status: 400 }
      );
    }

    if (!isValidEvmAddress(wallet_address)) {
      return NextResponse.json(
        { error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    const rawSide = typeof side === "string" ? side.trim().toUpperCase() : "";
    if (rawSide !== "AGREE" && rawSide !== "DISAGREE") {
      return NextResponse.json(
        { error: "Invalid or missing side: must be 'AGREE' or 'DISAGREE'" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing amount: must be a positive number" },
        { status: 400 }
      );
    }

    const normalizedTxHash = tx_hash.trim().toLowerCase();
    const normalizedAddress = wallet_address.trim().toLowerCase();
    const normalizedSide = rawSide as "AGREE" | "DISAGREE";

    const db = getDb();
    const { market_positions, markets, users } = schema;

    const existingBet = await db.query.market_positions.findFirst({
      columns: { id: true },
      where: eq(market_positions.tx_hash, normalizedTxHash),
    });

    if (existingBet) {
      return NextResponse.json(
        { error: `Bet transaction ${normalizedTxHash} has already been indexed` },
        { status: 409 }
      );
    }

    const market = parsedMarketId <= 2_147_483_647
      ? await db.query.markets.findFirst({ where: eq(markets.contract_market_id, parsedMarketId) })
      : undefined;

    if (!market) {
      return NextResponse.json(
        { error: `Market with contract_market_id ${parsedMarketId} not found` },
        { status: 404 }
      );
    }

    const [createdBet] = await db
      .insert(market_positions)
      .values({
        market_id: market.id,
        wallet_address: normalizedAddress,
        side: normalizedSide,
        amount: numericAmount,
        claimed: false,
        tx_hash: normalizedTxHash,
      })
      .returning();

    const poolIncrement = normalizedSide === "AGREE"
      ? { agree_pool: sql`${markets.agree_pool} + ${numericAmount}` }
      : { disagree_pool: sql`${markets.disagree_pool} + ${numericAmount}` };
    const [updatedMarket] = await db
      .update(markets)
      .set(poolIncrement)
      .where(eq(markets.id, market.id))
      .returning({ agree_pool: markets.agree_pool, disagree_pool: markets.disagree_pool });

    const updatedAgreePool = Number(updatedMarket.agree_pool ?? 0);
    const updatedDisagreePool = Number(updatedMarket.disagree_pool ?? 0);

    await db
      .insert(users)
      .values({ wallet_address: normalizedAddress })
      .onConflictDoNothing({ target: users.wallet_address });

    return NextResponse.json(
      {
        success: true,
        bet: {
          id: createdBet.id,
          market_id: createdBet.market_id,
          contract_market_id: parsedMarketId,
          market_title: market.title,
          wallet_address: createdBet.wallet_address,
          side: createdBet.side,
          amount: Number(createdBet.amount),
          claimed: createdBet.claimed,
          tx_hash: createdBet.tx_hash,
          created_at: createdBet.created_at,
        },
        updated_pools: {
          agree_pool: updatedAgreePool,
          disagree_pool: updatedDisagreePool,
          total_pool: updatedAgreePool + updatedDisagreePool,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
