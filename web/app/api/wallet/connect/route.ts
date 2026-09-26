import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isValidEvmAddress } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.wallet_address !== "string") {
      return NextResponse.json(
        { error: "wallet_address is required and must be a string" },
        { status: 400 }
      );
    }

    const rawAddress = body.wallet_address.trim();
    if (!isValidEvmAddress(rawAddress)) {
      return NextResponse.json(
        { error: "Invalid EVM wallet address format" },
        { status: 400 }
      );
    }

    const normalizedAddress = rawAddress.toLowerCase();
    const { users } = schema;
    const [user] = await getDb()
      .insert(users)
      .values({ wallet_address: normalizedAddress })
      .onConflictDoUpdate({ target: users.wallet_address, set: { wallet_address: sql`excluded.wallet_address` } })
      .returning({ id: users.id, wallet_address: users.wallet_address, created_at: users.created_at });

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        wallet_address: user?.wallet_address,
        created_at: user?.created_at,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
