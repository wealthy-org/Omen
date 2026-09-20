import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { CreatorProfileDetail, Belief } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || typeof address !== "string" || address.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Creator address or handle is required" },
        { status: 400 }
      );
    }

    const rawAddress = decodeURIComponent(address).trim();
    const cleanHandle = rawAddress.startsWith("@") ? rawAddress : `@${rawAddress}`;
    const cleanName = rawAddress.replace(/^@/, "");
    const supabase = getSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("creator_profiles")
      .select("*")
      .or(`wallet_address.ilike.${rawAddress},handle.ilike.${cleanHandle},handle.ilike.${cleanName}`)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    let creatorProfile: CreatorProfileDetail | null = profile as CreatorProfileDetail | null;
    let creatorBeliefs: Belief[] = [];

    if (creatorProfile) {
      const handleFilter = creatorProfile.handle ? `author.ilike.${creatorProfile.handle},` : "";
      const baseQuery = supabase.from("beliefs").select("*");
      const builder = "or" in baseQuery && typeof baseQuery.or === "function"
        ? baseQuery.or(`${handleFilter}author.ilike.${creatorProfile.wallet_address},author.ilike.${cleanName}`)
        : baseQuery;

      const { data: beliefs } = await builder.order("created_at", { ascending: false });

      creatorBeliefs = (beliefs as Belief[]) ?? [];
    } else {
      const baseQuery = supabase.from("beliefs").select("*");
      const builder = "or" in baseQuery && typeof baseQuery.or === "function"
        ? baseQuery.or(`author.ilike.${rawAddress},author.ilike.${cleanHandle},author.ilike.${cleanName}`)
        : baseQuery;

      const { data: beliefs } = await builder.order("created_at", { ascending: false });

      if (beliefs && beliefs.length > 0) {
        const typedBeliefs = beliefs as Belief[];
        creatorBeliefs = typedBeliefs;
        const firstBelief = typedBeliefs[0];
        const confirmedCount = typedBeliefs.filter((b) => b.status === "CONFIRMED").length;
        const authorText = typeof firstBelief.author === "string" ? firstBelief.author : cleanName;
        const handleText = authorText.startsWith("@") ? authorText : `@${authorText}`;

        creatorProfile = {
          id: `creator-${cleanName}`,
          wallet_address: rawAddress,
          handle: handleText,
          display_name: authorText.replace("@", ""),
          bio: "Social Belief Creator on Omen Protocol",
          avatar_url: null,
          total_beliefs_count: typedBeliefs.length,
          confirmed_beliefs_count: confirmedCount,
          resolved_count: 0,
          correct_count: 0,
          created_at: firstBelief.created_at ?? new Date().toISOString(),
        };
      } else {
        return NextResponse.json(
          { success: false, error: "Creator profile not found" },
          { status: 404 }
        );
      }
    }

    const resolved = Number(creatorProfile.resolved_count ?? 0);
    const correct = Number(creatorProfile.correct_count ?? 0);
    const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : 100;

    const formattedData = {
      ...creatorProfile,
      accuracy_percentage: accuracy,
      beliefs: creatorBeliefs,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      creator: formattedData,
      beliefs: creatorBeliefs,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
