import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

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
    if (!EVM_ADDRESS_REGEX.test(rawAddress)) {
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
      .select("wallet_address, total_points, streak_count")
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
        wallet_address: user.wallet_address,
        total_points: Number(user.total_points),
        streak_count: user.streak_count,
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
