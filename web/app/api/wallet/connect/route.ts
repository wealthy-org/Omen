import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
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
    const supabase = getSupabaseAdminClient();

    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        { wallet_address: normalizedAddress },
        { onConflict: "wallet_address" }
      )
      .select("id, wallet_address, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

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
