import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Creator address or handle is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("creator_profiles")
      .select("*")
      .or(`wallet_address.ilike.${address},handle.ilike.${address}`)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Creator profile not found" },
        { status: 404 }
      );
    }

    const { data: beliefs, error: beliefsError } = await supabase
      .from("beliefs")
      .select("*")
      .eq("author", profile.wallet_address)
      .order("created_at", { ascending: false });

    if (beliefsError) {
      return NextResponse.json(
        { success: false, error: beliefsError.message },
        { status: 500 }
      );
    }

    const resolved = profile.resolved_count || 0;
    const correct = profile.correct_count || 0;
    const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        accuracy_percentage: accuracy,
        beliefs: beliefs || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
