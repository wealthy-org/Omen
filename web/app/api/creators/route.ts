import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const sort = searchParams.get("sort") || "confirmed_beliefs";
    const search = searchParams.get("search")?.trim();

    const supabase = getSupabaseClient();
    let query = supabase.from("creator_profiles").select("*", { count: "exact" });

    if (search) {
      query = query.or(`handle.ilike.%${search}%,wallet_address.ilike.%${search}%`);
    }

    if (sort === "accuracy") {
      query = query.order("correct_count", { ascending: false });
    } else if (sort === "resolved") {
      query = query.order("resolved_count", { ascending: false });
    } else {
      query = query.order("confirmed_beliefs_count", { ascending: false });
    }

    const { data: profiles, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const formattedProfiles = (profiles || []).map((profile) => {
      const resolved = profile.resolved_count || 0;
      const correct = profile.correct_count || 0;
      const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : 0;

      return {
        ...profile,
        accuracy_percentage: accuracy,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedProfiles,
      total: count ?? formattedProfiles.length,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
