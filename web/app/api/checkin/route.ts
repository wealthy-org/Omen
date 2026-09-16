import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const ONE_HOUR_MS = 1000 * 60 * 60;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;
const FORTY_EIGHT_HOURS_MS = 48 * ONE_HOUR_MS;

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

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, wallet_address, total_points, streak_count, last_checkin_at")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Connect wallet first." },
        { status: 404 }
      );
    }

    const now = Date.now();
    let newStreak = 1;

    if (user.last_checkin_at) {
      const lastCheckinTime = new Date(user.last_checkin_at).getTime();
      const deltaMs = now - lastCheckinTime;

      if (deltaMs < TWENTY_FOUR_HOURS_MS) {
        const remainingSeconds = Math.ceil((TWENTY_FOUR_HOURS_MS - deltaMs) / 1000);
        return NextResponse.json(
          {
            error: "Check-in cooldown active. Please try again after 24 hours.",
            remaining_seconds: remainingSeconds,
          },
          { status: 400 }
        );
      } else if (deltaMs <= FORTY_EIGHT_HOURS_MS) {
        newStreak = (user.streak_count || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    const pointsEarned = Math.round(100 * (1 + (newStreak - 1) * 0.25));
    const updatedTotalPoints = Number(user.total_points) + pointsEarned;
    const nowIso = new Date(now).toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        total_points: updatedTotalPoints,
        streak_count: newStreak,
        last_checkin_at: nowIso,
      })
      .eq("wallet_address", normalizedAddress);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: eventError } = await supabase
      .from("points_events")
      .insert({
        wallet_address: normalizedAddress,
        quest_id: null,
        source: "daily_checkin",
        points: pointsEarned,
        created_at: nowIso,
      });

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      points_earned: pointsEarned,
      streak_count: newStreak,
      total_points: updatedTotalPoints,
      last_checkin_at: nowIso,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
