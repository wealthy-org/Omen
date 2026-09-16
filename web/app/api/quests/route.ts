import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;
    const rawWallet = searchParams.get("wallet_address");

    const { data: quests, error: questsError } = await supabase
      .from("quests")
      .select("id, title, description, category, points_reward, is_active, action_url, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (questsError) {
      return NextResponse.json({ error: questsError.message }, { status: 500 });
    }

    const completedQuestIds = new Set<string>();

    if (rawWallet && EVM_ADDRESS_REGEX.test(rawWallet.trim())) {
      const normalizedAddress = rawWallet.trim().toLowerCase();
      const { data: completions, error: completionsError } = await supabase
        .from("points_events")
        .select("quest_id")
        .eq("wallet_address", normalizedAddress)
        .eq("source", "quest")
        .not("quest_id", "is", null);

      if (completionsError) {
        return NextResponse.json({ error: completionsError.message }, { status: 500 });
      }

      if (completions) {
        for (const record of completions) {
          if (record.quest_id) {
            completedQuestIds.add(record.quest_id);
          }
        }
      }
    }

    const result = (quests || []).map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      category: quest.category || "DAILY",
      points_reward: Number(quest.points_reward || 0),
      is_active: quest.is_active,
      is_completed: completedQuestIds.has(quest.id),
      action_url: quest.action_url,
      created_at: quest.created_at,
    }));

    return NextResponse.json({
      success: true,
      quests: result,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
