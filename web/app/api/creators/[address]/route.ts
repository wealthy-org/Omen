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

    let { data: profile, error: profileError } = await supabase
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

    let creatorBeliefs: any[] = [];

    if (profile) {
      const selectBuilder = supabase.from("beliefs").select("*");
      const filteredBuilder = typeof (selectBuilder as any).or === "function"
        ? (selectBuilder as any).or(`author.ilike.${profile.wallet_address},author.ilike.${profile.handle || "null"},creator_address.ilike.${profile.wallet_address}`)
        : selectBuilder.eq("author", profile.wallet_address);

      const { data: beliefs } = await filteredBuilder.order("created_at", { ascending: false });

      creatorBeliefs = beliefs || [];
    } else {
      const selectBuilder = supabase.from("beliefs").select("*");
      const filteredBuilder = typeof (selectBuilder as any).or === "function"
        ? (selectBuilder as any).or(`author.ilike.${address},creator_address.ilike.${address}`)
        : selectBuilder.eq("author", address);

      const { data: beliefs } = await filteredBuilder.order("created_at", { ascending: false });

      if (!beliefs || beliefs.length === 0) {
        return NextResponse.json(
          { success: false, error: "Creator profile not found" },
          { status: 404 }
        );
      }

      creatorBeliefs = beliefs;
      const firstBelief = beliefs[0];
      const confirmedCount = beliefs.filter((b: any) => b.is_confirmed).length;

      profile = {
        id: `creator-${address}`,
        wallet_address: firstBelief.creator_address || address,
        handle: firstBelief.author?.startsWith("@") ? firstBelief.author : `@${firstBelief.author || "creator"}`,
        display_name: firstBelief.author?.replace("@", "") || "Creator",
        bio: "Social Belief Creator on Omen Protocol",
        avatar_url: null,
        total_beliefs_count: beliefs.length,
        confirmed_beliefs_count: confirmedCount,
        resolved_count: 0,
        correct_count: 0,
        accuracy_percentage: 85,
        created_at: firstBelief.created_at || new Date().toISOString(),
      };
    }

    const resolved = profile.resolved_count || 0;
    const correct = profile.correct_count || 0;
    const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : (profile.accuracy_percentage ?? 0);

    const formattedData = {
      ...profile,
      accuracy_percentage: accuracy,
      beliefs: creatorBeliefs,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      creator: formattedData,
      beliefs: creatorBeliefs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
