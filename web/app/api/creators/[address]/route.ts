import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

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

    let creatorProfile = profile;
    let creatorBeliefs: any[] = [];

    if (creatorProfile) {
      const handleFilter = creatorProfile.handle ? `author.ilike.${creatorProfile.handle},` : "";
      const selectBuilder = supabase.from("beliefs").select("*");
      const filteredBuilder = typeof (selectBuilder as any).or === "function"
        ? (selectBuilder as any).or(`${handleFilter}author.ilike.${creatorProfile.wallet_address},author.ilike.${cleanName}`)
        : selectBuilder;

      const { data: beliefs } = await filteredBuilder.order("created_at", { ascending: false });

      creatorBeliefs = beliefs ?? [];
    } else {
      const selectBuilder = supabase.from("beliefs").select("*");
      const filteredBuilder = typeof (selectBuilder as any).or === "function"
        ? (selectBuilder as any).or(`author.ilike.${rawAddress},author.ilike.${cleanHandle},author.ilike.${cleanName}`)
        : (typeof (selectBuilder as any).ilike === "function" ? (selectBuilder as any).ilike("author", cleanName) : selectBuilder);

      const { data: beliefs } = await filteredBuilder.order("created_at", { ascending: false });

      if (beliefs && beliefs.length > 0) {
        creatorBeliefs = beliefs;
        const firstBelief = beliefs[0];
        const confirmedCount = beliefs.filter((b: any) => b.status === "CONFIRMED").length;
        const authorText = typeof firstBelief.author === "string" ? firstBelief.author : cleanName;
        const handleText = authorText.startsWith("@") ? authorText : `@${authorText}`;

        creatorProfile = {
          id: `creator-${cleanName}`,
          wallet_address: rawAddress.startsWith("0x") && rawAddress.length === 42 ? rawAddress : `0x${Array.from({ length: 40 }, () => "0").join("")}`,
          handle: handleText,
          display_name: authorText.replace("@", ""),
          bio: "Social Belief Creator on Omen Protocol",
          avatar_url: null,
          total_beliefs_count: beliefs.length,
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
