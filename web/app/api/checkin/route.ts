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
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    let currentStreak = 1;
    let earnedPoints = 100;

    if (user.last_checkin_at) {
      const lastCheckin = new Date(user.last_checkin_at);
      const diffHours = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        return NextResponse.json(
          { error: `Check-in on cooldown. Please wait ${remainingHours} hours.` },
          { status: 400 }
        );
      }

      if (diffHours <= 48) {
        currentStreak = (user.streak_count || 1) + 1;
      } else {
        currentStreak = 1;
      }
    }

    earnedPoints = Math.round(100 * (1 + (currentStreak - 1) * 0.25));
    const newTotalPoints = Number(user.total_points || 0) + earnedPoints;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: newTotalPoints,
        last_checkin_at: now.toISOString(),
        streak_count: currentStreak,
      })
      .eq("wallet_address", normalizedAddress);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.from("points_events").insert({
      wallet_address: normalizedAddress,
      quest_id: null,
      source: "daily_checkin",
      points: earnedPoints,
    });

    return NextResponse.json({
      success: true,
      earned_points: earnedPoints,
      total_points: newTotalPoints,
      streak_count: currentStreak,
      last_checkin_at: now.toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
