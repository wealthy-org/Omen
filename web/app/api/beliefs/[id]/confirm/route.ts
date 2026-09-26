import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/db/filters";
import { verifyBeliefConfirmationSignature } from "@/lib/eip712/confirmation";
import { isValidEvmAddress } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Belief ID is required" },
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

    const { creator_address, signature, timestamp, chain_id, tx_hash } = body;

    if (!isValidEvmAddress(creator_address)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing creator_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required field: signature" },
        { status: 400 }
      );
    }

    const parsedTimestamp = Number(timestamp);
    if (timestamp === undefined || timestamp === null || isNaN(parsedTimestamp) || parsedTimestamp <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid field: timestamp must be a positive integer" },
        { status: 400 }
      );
    }

    const parsedChainId = Number(chain_id);
    if (chain_id === undefined || chain_id === null || isNaN(parsedChainId) || parsedChainId <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid field: chain_id must be a positive integer" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { beliefs, creator_confirmations, creator_profiles } = schema;

    const belief = isUuid(id)
      ? await db.query.beliefs.findFirst({ where: eq(beliefs.id, id) })
      : undefined;

    if (!belief) {
      return NextResponse.json(
        { success: false, error: "Belief not found" },
        { status: 404 }
      );
    }

    const isValid = await verifyBeliefConfirmationSignature({
      beliefId: id,
      statement: belief.statement,
      timestamp: parsedTimestamp,
      chainId: parsedChainId,
      creatorAddress: creator_address.trim(),
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature or creator address mismatch" },
        { status: 401 }
      );
    }

    await db.update(beliefs).set({ status: "CONFIRMED" }).where(eq(beliefs.id, id));

    const normalizedWallet = creator_address.trim().toLowerCase();

    const [confirmation] = await db
      .insert(creator_confirmations)
      .values({
        belief_id: id,
        creator_wallet: normalizedWallet,
        signature,
        tx_hash: typeof tx_hash === "string" ? tx_hash : null,
      })
      .returning();

    await db
      .insert(creator_profiles)
      .values({
        wallet_address: normalizedWallet,
        confirmed_beliefs_count: 1,
        resolved_count: 0,
        correct_count: 0,
      })
      .onConflictDoUpdate({
        target: creator_profiles.wallet_address,
        set: { confirmed_beliefs_count: sql`${creator_profiles.confirmed_beliefs_count} + 1` },
      });

    return NextResponse.json({
      success: true,
      message: "Belief successfully confirmed by creator",
      data: confirmation || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
