import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questId } = await context.params;
    if (!questId || typeof questId !== "string") {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
    }

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

    const { data: quest, error: questError } = await supabase
      .from("quests")
      .select("id, title, points_reward, is_active")
      .eq("id", questId)
      .maybeSingle();

    if (questError) {
      return NextResponse.json({ error: questError.message }, { status: 500 });
    }

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (!quest.is_active) {
      return NextResponse.json({ error: "Quest is not active" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, wallet_address, total_points")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Connect wallet first." },
        { status: 404 }
      );
    }

    const { data: existingCompletion, error: checkError } = await supabase
      .from("points_events")
      .select("id")
      .eq("wallet_address", normalizedAddress)
      .eq("quest_id", quest.id)
      .eq("source", "quest")
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Quest has already been completed by this wallet" },
        { status: 400 }
      );
    }

    const pointsReward = Number(quest.points_reward);
    const updatedTotalPoints = Number(user.total_points) + pointsReward;
    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({ total_points: updatedTotalPoints })
      .eq("wallet_address", normalizedAddress);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: eventError } = await supabase
      .from("points_events")
      .insert({
        wallet_address: normalizedAddress,
        quest_id: quest.id,
        source: "quest",
        points: pointsReward,
        created_at: nowIso,
      });

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quest_id: quest.id,
      points_awarded: pointsReward,
      total_points: updatedTotalPoints,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
