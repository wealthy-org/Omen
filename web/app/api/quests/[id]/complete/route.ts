import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questId } = await context.params;
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

    const { data: quest, error: questError } = await supabase
      .from("quests")
      .select("*")
      .eq("id", questId)
      .maybeSingle();

    if (questError) {
      return NextResponse.json({ error: questError.message }, { status: 500 });
    }

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (!quest.is_active) {
      return NextResponse.json({ error: "Quest is no longer active" }, { status: 400 });
    }

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

    const { data: existingEvent, error: eventError } = await supabase
      .from("points_events")
      .select("id")
      .eq("wallet_address", normalizedAddress)
      .eq("quest_id", questId)
      .maybeSingle();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (existingEvent) {
      return NextResponse.json({ error: "Quest already completed" }, { status: 400 });
    }

    const pointsReward = Number(quest.points_reward || 0);
    const newTotalPoints = Number(user.total_points || 0) + pointsReward;

    const { error: updateError } = await supabase
      .from("users")
      .update({ total_points: newTotalPoints })
      .eq("wallet_address", normalizedAddress);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.from("points_events").insert({
      wallet_address: normalizedAddress,
      quest_id: questId,
      source: "quest",
      points: pointsReward,
    });

    return NextResponse.json({
      success: true,
      earned_points: pointsReward,
      total_points: newTotalPoints,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
