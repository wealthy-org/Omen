import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;

    const statusParam = (searchParams.get("status") || "all").toLowerCase();
    const categoryParam = (searchParams.get("category") || "all").toLowerCase();
    const sortParam = (searchParams.get("sort") || "newest").toLowerCase();

    let query = supabase.from("markets").select("*");

    if (statusParam === "active") {
      query = query.eq("status", "active");
    } else if (statusParam === "resolved") {
      query = query.in("status", ["resolved_yes", "resolved_no"]);
    } else if (statusParam === "cancelled") {
      query = query.eq("status", "cancelled");
    }

    if (categoryParam !== "all") {
      query = query.ilike("category", categoryParam);
    }

    if (sortParam === "highest_pool") {
      query = query.order("total_pool_yes", { ascending: false });
    } else if (sortParam === "ending_soon") {
      query = query.order("deadline", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: markets, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedMarkets = (markets || []).map((m) => {
      const yesPool = Number(m.total_pool_yes || 0);
      const noPool = Number(m.total_pool_no || 0);
      return {
        id: m.id,
        contract_market_id: m.contract_market_id,
        title: m.title,
        description: m.description,
        category: m.category,
        deadline: m.deadline,
        status: m.status,
        total_pool_yes: yesPool,
        total_pool_no: noPool,
        total_pool: yesPool + noPool,
        resolution_source: m.resolution_source,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedMarkets.length,
      markets: formattedMarkets,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
