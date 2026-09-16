import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet_address")?.toLowerCase();

    const supabase = getSupabaseAdminClient();
    const { data: quests, error: questsError } = await supabase
      .from("quests")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (questsError) {
      return NextResponse.json({ error: questsError.message }, { status: 500 });
    }

    let completedQuestIds = new Set<string>();
    if (walletAddress) {
      const { data: events, error: eventsError } = await supabase
        .from("points_events")
        .select("quest_id")
        .eq("wallet_address", walletAddress)
        .not("quest_id", "is", null);

      if (!eventsError && events) {
        events.forEach((e) => {
          if (e.quest_id) completedQuestIds.add(e.quest_id);
        });
      }
    }

    const formattedQuests = (quests || []).map((q) => ({
      ...q,
      is_completed: completedQuestIds.has(q.id),
    }));

    return NextResponse.json({ success: true, quests: formattedQuests });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
