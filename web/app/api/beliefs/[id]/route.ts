import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Belief ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: belief, error } = await supabase
      .from("beliefs")
      .select("*, belief_sources(*), markets(*), creator_confirmations(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!belief) {
      return NextResponse.json(
        { success: false, error: `Belief with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      belief,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
