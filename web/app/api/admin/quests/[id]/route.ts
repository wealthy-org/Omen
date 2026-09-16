import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questId } = await context.params;
    const body = await req.json();
    const { is_active, title, description, points_reward } = body;

    const supabase = getSupabaseAdminClient();
    const updates: Record<string, any> = {};

    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (points_reward !== undefined) updates.points_reward = Number(points_reward);

    const { data: updatedQuest, error: updateError } = await supabase
      .from("quests")
      .update(updates)
      .eq("id", questId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, quest: updatedQuest });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questId } = await context.params;
    const supabase = getSupabaseAdminClient();

    const { error: deleteError } = await supabase
      .from("quests")
      .delete()
      .eq("id", questId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted_id: questId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
