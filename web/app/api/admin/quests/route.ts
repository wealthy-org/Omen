import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: quests, error } = await supabase
      .from("quests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quests: quests || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, points_reward, action_url } = body;

    if (!title || points_reward === undefined) {
      return NextResponse.json({ error: "Missing required quest title or points_reward" }, { status: 400 });
    }

    const points = Number(points_reward);
    if (isNaN(points) || points <= 0) {
      return NextResponse.json({ error: "points_reward must be a positive number" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: newQuest, error: insertError } = await supabase
      .from("quests")
      .insert({
        title,
        description: description || null,
        category: (category || "DAILY").toUpperCase(),
        points_reward: points,
        action_url: action_url || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quest: newQuest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
