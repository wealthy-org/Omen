import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address } = body;

    if (!wallet_address || typeof wallet_address !== "string") {
      return NextResponse.json({ error: "Missing required wallet_address" }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();
    if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
      return NextResponse.json({ error: "Invalid EVM wallet address format" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser, is_new: false }, { status: 200 });
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        wallet_address: normalizedAddress,
        total_points: 0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: newUser, is_new: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
